
-- Drop existing RLS policies that reference auth.uid()
DROP POLICY IF EXISTS "Users can view their own reversal requests" ON public.transaction_reversal_requests;
DROP POLICY IF EXISTS "Users can create reversal requests" ON public.transaction_reversal_requests;
DROP POLICY IF EXISTS "Admins can view all reversal requests" ON public.transaction_reversal_requests;
DROP POLICY IF EXISTS "Admins can update reversal requests" ON public.transaction_reversal_requests;

-- Disable RLS for now since this app uses custom authentication
ALTER TABLE public.transaction_reversal_requests DISABLE ROW LEVEL SECURITY;
