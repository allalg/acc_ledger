
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReversalRequest {
  id: string;
  transaction_id: number;
  requested_by: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  requester_name?: string;
  transaction_description?: string;
  transaction_amount?: number;
}

export const useReversalRequests = () => {
  const [requests, setRequests] = useState<ReversalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReversalRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching reversal requests...');
      
      const { data, error } = await supabase
        .from('transaction_reversal_requests')
        .select(`
          id,
          transaction_id,
          requested_by,
          reason,
          status,
          reviewed_by,
          reviewed_at,
          created_at,
          requester:users!transaction_reversal_requests_requested_by_fkey(username),
          transaction:transactions!transaction_reversal_requests_transaction_id_fkey(description, amount)
        `)
        .order('created_at', { ascending: false });

      console.log('Reversal requests query result:', { data, error });

      if (error) {
        console.error('Error fetching reversal requests:', error);
        setRequests([]);
      } else {
        const formattedRequests = (data || []).map((req: any) => ({
          id: req.id,
          transaction_id: req.transaction_id,
          requested_by: req.requested_by,
          reason: req.reason,
          status: req.status,
          reviewed_by: req.reviewed_by,
          reviewed_at: req.reviewed_at,
          created_at: req.created_at,
          requester_name: req.requester?.username || 'Unknown',
          transaction_description: req.transaction?.description || 'No description',
          transaction_amount: req.transaction?.amount || 0
        }));
        console.log('Formatted reversal requests:', formattedRequests);
        setRequests(formattedRequests);
      }
    } catch (error) {
      console.error('Error fetching reversal requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const createReversalRequest = async (transactionId: number, reason: string) => {
    try {
      console.log('Creating reversal request for transaction:', transactionId);
      
      // Get current user from localStorage - check both possible keys
      let currentUser = localStorage.getItem('accosight_user') || localStorage.getItem('currentUser');
      console.log('Raw currentUser from localStorage:', currentUser);
      
      if (!currentUser) {
        console.error('No currentUser found in localStorage');
        throw new Error('No user logged in');
      }
      
      let userData;
      try {
        userData = JSON.parse(currentUser);
        console.log('Parsed userData:', userData);
      } catch (parseError) {
        console.error('Error parsing currentUser:', parseError);
        throw new Error('Invalid user data in localStorage');
      }
      
      // Check multiple possible fields for user ID
      const userId = userData.user_id || userData.id || userData.user_metadata?.user_id;
      console.log('Extracted userId:', userId);
      
      if (!userId) {
        console.error('No user_id found in userData:', userData);
        throw new Error('User ID not found');
      }
      
      console.log('Attempting to insert reversal request with:', {
        transaction_id: transactionId,
        reason,
        requested_by: userId
      });
      
      const { error } = await supabase
        .from('transaction_reversal_requests')
        .insert({
          transaction_id: transactionId,
          reason,
          requested_by: userId
        });

      if (error) {
        console.error('Error creating reversal request:', error);
        throw error;
      }

      console.log('Reversal request created successfully');
      await fetchReversalRequests();
      return true;
    } catch (error) {
      console.error('Error creating reversal request:', error);
      throw error;
    }
  };

  const updateReversalRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      console.log('Updating reversal request status:', requestId, status);
      
      // Get current user from localStorage - check both possible keys
      let currentUser = localStorage.getItem('accosight_user') || localStorage.getItem('currentUser');
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      const userData = JSON.parse(currentUser);
      const userId = userData.user_id || userData.id || userData.user_metadata?.user_id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      console.log('Updating request with user ID:', userId);
      
      const { error } = await supabase
        .from('transaction_reversal_requests')
        .update({
          status,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating reversal request:', error);
        throw error;
      }

      console.log('Reversal request status updated successfully');

      // If approved, process the reversal
      if (status === 'approved') {
        console.log('Processing reversal for request:', requestId);
        
        try {
          // Get the original transaction details first for logging
          const request = requests.find(r => r.id === requestId);
          if (request) {
            console.log('Processing reversal for transaction ID:', request.transaction_id);
            
            // Check if the original transaction exists
            const { data: originalTxn, error: txnError } = await supabase
              .from('transactions')
              .select('*')
              .eq('id', request.transaction_id)
              .single();
              
            console.log('Original transaction check:', { originalTxn, txnError });
          }
          
          // Now call the reversal function
          const { data, error: processError } = await supabase.rpc('process_transaction_reversal', {
            reversal_request_id: requestId
          });

          console.log('Process reversal RPC result:', { data, processError });

          if (processError) {
            console.error('Error processing transaction reversal:', processError);
            throw processError;
          }

          console.log('Transaction reversal processed successfully, checking for new transactions...');
          
          // Wait a moment and then check for the new reversal transaction
          setTimeout(async () => {
            const { data: newTxns, error: checkError } = await supabase
              .from('transactions')
              .select('*')
              .contains('reference_transaction_ids', [request?.transaction_id])
              .order('created_at', { ascending: false })
              .limit(5);
              
            console.log('Checking for new reversal transactions:', { newTxns, checkError });
          }, 2000);
          
        } catch (rpcError) {
          console.error('RPC call failed:', rpcError);
          throw rpcError;
        }
      }

      await fetchReversalRequests();
      return true;
    } catch (error) {
      console.error('Error updating reversal request:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReversalRequests();
  }, []);

  return { 
    requests, 
    loading, 
    refetch: fetchReversalRequests,
    createReversalRequest,
    updateReversalRequestStatus
  };
};
