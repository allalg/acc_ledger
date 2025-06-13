
-- Create table for transaction reversal requests
CREATE TABLE public.transaction_reversal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES public.transactions(id),
  requested_by UUID NOT NULL REFERENCES public.users(user_id),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for transaction reversal requests
ALTER TABLE public.transaction_reversal_requests ENABLE ROW LEVEL SECURITY;

-- Policy for employees to view their own requests
CREATE POLICY "Users can view their own reversal requests" 
  ON public.transaction_reversal_requests 
  FOR SELECT 
  USING (requested_by = (SELECT user_id FROM users WHERE user_id = auth.uid()));

-- Policy for employees to create reversal requests
CREATE POLICY "Users can create reversal requests" 
  ON public.transaction_reversal_requests 
  FOR INSERT 
  WITH CHECK (requested_by = (SELECT user_id FROM users WHERE user_id = auth.uid()));

-- Policy for admins to view all requests (assuming admin role exists)
CREATE POLICY "Admins can view all reversal requests" 
  ON public.transaction_reversal_requests 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'));

-- Policy for admins to update requests
CREATE POLICY "Admins can update reversal requests" 
  ON public.transaction_reversal_requests 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'));

-- Create function to process approved transaction reversals
CREATE OR REPLACE FUNCTION public.process_transaction_reversal(reversal_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    original_txn RECORD;
    reversal_request RECORD;
    new_txn_id INTEGER;
BEGIN
    -- Get the reversal request
    SELECT * INTO reversal_request 
    FROM transaction_reversal_requests 
    WHERE id = reversal_request_id AND status = 'approved';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reversal request not found or not approved';
    END IF;
    
    -- Get the original transaction
    SELECT * INTO original_txn 
    FROM transactions 
    WHERE id = reversal_request.transaction_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Original transaction not found';
    END IF;
    
    -- Create the reversal transaction (swap debit and credit accounts)
    INSERT INTO transactions (
        transaction_date,
        description,
        amount,
        debit_account_id,
        credit_account_id,
        user_id,
        misc_vendor_name,
        misc_customer_name,
        created_by
    ) VALUES (
        NOW(),
        'REVERSAL: ' || original_txn.description,
        original_txn.amount,
        original_txn.credit_account_id,  -- Swap: original credit becomes debit
        original_txn.debit_account_id,   -- Swap: original debit becomes credit
        original_txn.user_id,
        original_txn.misc_vendor_name,
        original_txn.misc_customer_name,
        reversal_request.reviewed_by
    ) RETURNING id INTO new_txn_id;
    
    -- Copy transaction items if they exist (with reversed inventory effect)
    INSERT INTO transaction_items (
        transaction_id,
        item_id,
        quantity,
        unit_price,
        discount
    )
    SELECT 
        new_txn_id,
        item_id,
        quantity,
        unit_price,
        discount
    FROM transaction_items
    WHERE transaction_id = original_txn.id;
    
    RETURN TRUE;
END;
$$;
