
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BadDebtCustomer {
  customer_name: string;
  unpaid_amount: number;
  oldest_transaction_date: string;
}

export const useBadDebtWarnings = () => {
  const [badDebtCustomers, setBadDebtCustomers] = useState<BadDebtCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadDebtData = async () => {
    try {
      setLoading(true);
      
      // Get customers with unpaid AR transactions older than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          user_id,
          amount,
          amount_paid,
          transaction_date,
          misc_customer_name,
          users(username)
        `)
        .eq('debit_account_id', 3) // AR account
        .in('payment_status', ['unpaid', 'partial'])
        .lt('transaction_date', oneYearAgo.toISOString());

      if (transactions) {
        // Group by customer and calculate unpaid amounts
        const customerDebts = new Map<string, { unpaid_amount: number; oldest_date: string }>();
        
        transactions.forEach(txn => {
          const customerName = txn.misc_customer_name || (txn.users as any)?.username || 'Unknown Customer';
          const unpaidAmount = txn.amount - (txn.amount_paid || 0);
          
          if (unpaidAmount > 0) {
            const existing = customerDebts.get(customerName);
            if (existing) {
              existing.unpaid_amount += unpaidAmount;
              if (txn.transaction_date < existing.oldest_date) {
                existing.oldest_date = txn.transaction_date;
              }
            } else {
              customerDebts.set(customerName, {
                unpaid_amount: unpaidAmount,
                oldest_date: txn.transaction_date
              });
            }
          }
        });

        // Convert to array
        const badDebtList: BadDebtCustomer[] = Array.from(customerDebts.entries()).map(
          ([customer_name, data]) => ({
            customer_name,
            unpaid_amount: data.unpaid_amount,
            oldest_transaction_date: data.oldest_date
          })
        );

        setBadDebtCustomers(badDebtList);
      }
    } catch (error) {
      console.error('Error fetching bad debt data:', error);
      setBadDebtCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadDebtData();
  }, []);

  return { badDebtCustomers, loading, refetch: fetchBadDebtData };
};
