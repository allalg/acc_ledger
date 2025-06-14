
-- Fix the process_transaction_reversal function to handle missing employee records
CREATE OR REPLACE FUNCTION public.process_transaction_reversal(reversal_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    original_txn RECORD;
    reversal_request RECORD;
    new_txn_id INTEGER;
    reviewing_user_id UUID;
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
    
    -- Set the reviewing user, but handle case where they might not be in employees table
    reviewing_user_id := reversal_request.reviewed_by;
    
    -- Check if reviewing user exists in employees table, if not use original creator
    IF NOT EXISTS (SELECT 1 FROM employees WHERE id = reviewing_user_id) THEN
        -- Use the original transaction's created_by if it exists in employees
        IF EXISTS (SELECT 1 FROM employees WHERE id = original_txn.created_by) THEN
            reviewing_user_id := original_txn.created_by;
        ELSE
            -- Set to null to avoid foreign key constraint violation
            reviewing_user_id := NULL;
        END IF;
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
        created_by,
        reference_transaction_ids
    ) VALUES (
        NOW(),
        'Transaction Reversed: ' || COALESCE(original_txn.description, 'Transaction #' || original_txn.id),
        original_txn.amount,
        original_txn.credit_account_id,  -- Swap: original credit becomes debit
        original_txn.debit_account_id,   -- Swap: original debit becomes credit
        original_txn.user_id,
        original_txn.misc_vendor_name,
        original_txn.misc_customer_name,
        reviewing_user_id,  -- Use the safe user ID
        ARRAY[original_txn.id]  -- Add original transaction ID to reference
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
