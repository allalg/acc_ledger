
-- Simplified process_transaction_reversal function with minimal dependencies
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
    RAISE NOTICE 'Starting process_transaction_reversal for request: %', reversal_request_id;
    
    -- Get the reversal request
    SELECT * INTO reversal_request 
    FROM transaction_reversal_requests 
    WHERE id = reversal_request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reversal request not found with ID: %', reversal_request_id;
    END IF;
    
    RAISE NOTICE 'Found reversal request for transaction: %', reversal_request.transaction_id;
    
    -- Get the original transaction
    SELECT * INTO original_txn 
    FROM transactions 
    WHERE id = reversal_request.transaction_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Original transaction not found with ID: %', reversal_request.transaction_id;
    END IF;
    
    RAISE NOTICE 'Creating reversal transaction...';
    
    -- Create the reversal transaction with minimal fields
    INSERT INTO transactions (
        transaction_date,
        description,
        amount,
        debit_account_id,
        credit_account_id,
        user_id,
        created_by,
        reference_transaction_ids
    ) VALUES (
        NOW(),
        'Reversal of Transaction #' || original_txn.id,
        original_txn.amount,
        original_txn.credit_account_id,  -- Swap accounts
        original_txn.debit_account_id,   -- Swap accounts
        original_txn.user_id,
        original_txn.created_by,
        ARRAY[original_txn.id]
    ) RETURNING id INTO new_txn_id;
    
    RAISE NOTICE 'Successfully created reversal transaction with ID: %', new_txn_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in process_transaction_reversal: % - %', SQLSTATE, SQLERRM;
END;
$$;
