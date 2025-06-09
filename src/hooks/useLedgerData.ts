
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LedgerTransaction {
  transaction_id: number;
  transaction_date: string;
  description: string;
  user_id?: string;
  username: string;
  payment_status?: string;
  reference_transaction_ids?: number[];
  debit_account: string;
  debit_val?: number;
  debit_value?: number;
  credit_account: string;
  credit_val?: number;
  credit_value?: number;
  item_name?: string;
  quantity?: number;
  unit_price?: number;
  discount?: number;
  line_total?: number;
  debit?: number;
  credit?: number;
  running_balance: number;
  running_inventory_balance?: number;
}

export const useLedgerData = (ledgerType: string) => {
  const [data, setData] = useState<LedgerTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      let result: any[] = [];

      switch (ledgerType) {
        case 'accounts-receivable':
          // Get AR account ID first
          const { data: arAccount } = await supabase
            .from('accounts')
            .select('id')
            .eq('name', 'Accounts recievables')
            .single();

          if (arAccount) {
            const { data: transactions } = await supabase
              .from('transactions')
              .select(`
                id,
                transaction_date,
                description,
                user_id,
                payment_status,
                reference_transaction_ids,
                amount,
                debit_account_id,
                credit_account_id,
                users!inner(username),
                debit_account:accounts!transactions_debit_account_id_fkey(name),
                credit_account:accounts!transactions_credit_account_id_fkey(name)
              `)
              .or(`debit_account_id.eq.${arAccount.id},credit_account_id.eq.${arAccount.id}`)
              .order('transaction_date')
              .order('id');

            if (transactions) {
              let runningBalance = 0;
              result = transactions.map((t: any) => {
                const debitVal = t.debit_account_id === arAccount.id ? t.amount : 0;
                const creditVal = t.credit_account_id === arAccount.id ? t.amount : 0;
                runningBalance += (debitVal - creditVal);
                
                return {
                  transaction_id: t.id,
                  transaction_date: t.transaction_date,
                  description: t.description,
                  user_id: t.user_id,
                  username: t.users?.username || 'Unknown',
                  payment_status: t.payment_status,
                  reference_transaction_ids: t.reference_transaction_ids,
                  debit_account: t.debit_account?.name || '',
                  debit_val: debitVal,
                  credit_account: t.credit_account?.name || '',
                  credit_val: creditVal,
                  running_balance: runningBalance
                };
              });
            }
          }
          break;

        case 'accounts-payable':
          // Get AP account ID first
          const { data: apAccount } = await supabase
            .from('accounts')
            .select('id')
            .eq('name', 'Accounts payable')
            .single();

          if (apAccount) {
            const { data: transactions } = await supabase
              .from('transactions')
              .select(`
                id,
                transaction_date,
                description,
                user_id,
                amount,
                debit_account_id,
                credit_account_id,
                users!inner(username),
                debit_account:accounts!transactions_debit_account_id_fkey(name),
                credit_account:accounts!transactions_credit_account_id_fkey(name)
              `)
              .or(`debit_account_id.eq.${apAccount.id},credit_account_id.eq.${apAccount.id}`)
              .order('transaction_date')
              .order('id');

            if (transactions) {
              let runningBalance = 0;
              result = transactions.map((t: any) => {
                const debitValue = t.debit_account_id === apAccount.id ? t.amount : 0;
                const creditValue = t.credit_account_id === apAccount.id ? t.amount : 0;
                runningBalance += (creditValue - debitValue);
                
                return {
                  transaction_id: t.id,
                  transaction_date: t.transaction_date,
                  description: t.description,
                  user_id: t.user_id,
                  username: t.users?.username || 'Unknown',
                  debit_account: t.debit_account?.name || '',
                  debit_value: debitValue,
                  credit_account: t.credit_account?.name || '',
                  credit_value: creditValue,
                  running_balance: runningBalance
                };
              });
            }
          }
          break;

        case 'sales':
          // Get inventory account ID first
          const { data: inventoryAccount } = await supabase
            .from('accounts')
            .select('id')
            .eq('name', 'Inventory')
            .single();

          if (inventoryAccount) {
            const { data: transactions } = await supabase
              .from('transactions')
              .select(`
                id,
                transaction_date,
                description,
                users!inner(username),
                transaction_items!inner(
                  quantity,
                  unit_price,
                  discount,
                  inventory_items!inner(name)
                )
              `)
              .eq('credit_account_id', inventoryAccount.id)
              .order('transaction_date')
              .order('id');

            if (transactions) {
              let runningBalance = 0;
              result = transactions.flatMap((t: any) => 
                t.transaction_items.map((ti: any) => {
                  const lineTotal = ti.quantity * ti.unit_price;
                  const credit = lineTotal;
                  runningBalance += credit;
                  
                  return {
                    transaction_id: t.id,
                    transaction_date: t.transaction_date,
                    description: t.description,
                    username: t.users?.username || 'Unknown',
                    item_name: ti.inventory_items?.name || 'Unknown Item',
                    quantity: ti.quantity,
                    unit_price: ti.unit_price,
                    discount: ti.discount || 0,
                    line_total: lineTotal,
                    debit: 0,
                    credit: credit,
                    running_inventory_balance: runningBalance
                  };
                })
              );
            }
          }
          break;

        case 'purchases':
          // Get inventory account ID first
          const { data: invAccount } = await supabase
            .from('accounts')
            .select('id')
            .eq('name', 'Inventory')
            .single();

          if (invAccount) {
            const { data: transactions } = await supabase
              .from('transactions')
              .select(`
                id,
                transaction_date,
                description,
                users!inner(username),
                transaction_items!inner(
                  quantity,
                  unit_price,
                  discount,
                  inventory_items!inner(name)
                )
              `)
              .eq('debit_account_id', invAccount.id)
              .order('transaction_date')
              .order('id');

            if (transactions) {
              let runningBalance = 0;
              result = transactions.flatMap((t: any) => 
                t.transaction_items.map((ti: any) => {
                  const lineTotal = (ti.quantity * ti.unit_price) - (ti.discount || 0);
                  const debit = lineTotal;
                  runningBalance += debit;
                  
                  return {
                    transaction_id: t.id,
                    transaction_date: t.transaction_date,
                    description: t.description,
                    username: t.users?.username || 'Unknown',
                    item_name: ti.inventory_items?.name || 'Unknown Item',
                    quantity: ti.quantity,
                    unit_price: ti.unit_price,
                    discount: ti.discount || 0,
                    line_total: lineTotal,
                    debit: debit,
                    credit: 0,
                    running_inventory_balance: runningBalance
                  };
                })
              );
            }
          }
          break;

        default:
          result = [];
      }

      setData(result);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [ledgerType]);

  return { data, loading, refetch: fetchLedgerData };
};
