
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatementItem {
  item: string;
  value: string;
}

interface BankTransaction {
  transaction_id: number;
  transaction_date: string;
  description: string;
  username: string;
  debit_account: string;
  debit_value: number;
  credit_account: string;
  credit_value: number;
  running_bank_balance: number;
}

export const useProfitLossStatement = () => {
  const { data, loading, refetch } = useStatementData('profit-loss');
  return { data, loading, refetch };
};

export const useBalanceSheet = () => {
  const { data, loading, refetch } = useStatementData('balance-sheet');
  return { data, loading, refetch };
};

const useStatementData = (type: 'profit-loss' | 'balance-sheet') => {
  const [data, setData] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (type === 'profit-loss') {
        console.log('Fetching profit & loss statement...');
        
        const { data: response, error } = await supabase.rpc('get_profit_summary_supabase');

        console.log('Profit & loss raw response:', response);

        if (error) {
          console.error('Error in profit & loss RPC call:', error);
          throw error;
        }

        const statementData: StatementItem[] = response || [];
        console.log('Profit & loss final data:', statementData);
        setData(statementData);
        
      } else {
        console.log('Fetching balance sheet...');
        
        const { data: response, error } = await supabase.rpc('get_balance_sheet_supabase');

        console.log('Balance sheet raw response:', response);

        if (error) {
          console.error('Error in balance sheet RPC call:', error);
          throw error;
        }

        const statementData: StatementItem[] = response?.map((row: any) => ({
          item: row.section ? `${row.section} - ${row.account_name}` : row.account_name,
          value: row.amount
        })) || [];
        
        console.log('Balance sheet final data:', statementData);
        setData(statementData);
      }
    } catch (error) {
      console.error(`Error fetching ${type} statement:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  return { data, loading, refetch: fetchData };
};

export const useBankStatement = () => {
  const [data, setData] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get bank account ID
      const { data: bankAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', 'Bank')
        .single();

      if (!bankAccount) {
        console.error('Bank account not found');
        setData([]);
        return;
      }

      // Get all transactions involving the bank account
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_date,
          description,
          amount,
          debit_account_id,
          credit_account_id,
          user_id,
          users(username),
          debit_account:accounts!debit_account_id(name),
          credit_account:accounts!credit_account_id(name)
        `)
        .or(`debit_account_id.eq.${bankAccount.id},credit_account_id.eq.${bankAccount.id}`)
        .order('transaction_date', { ascending: true })
        .order('id', { ascending: true });

      let runningBalance = 0;
      const bankTransactions: BankTransaction[] = transactions?.map(txn => {
        const debitValue = txn.debit_account_id === bankAccount.id ? txn.amount : 0;
        const creditValue = txn.credit_account_id === bankAccount.id ? txn.amount : 0;
        runningBalance += debitValue - creditValue;

        return {
          transaction_id: txn.id,
          transaction_date: txn.transaction_date || '',
          description: txn.description || '',
          username: (txn.users as any)?.username || 'System/Auto',
          debit_account: (txn.debit_account as any)?.name || '',
          debit_value: debitValue,
          credit_account: (txn.credit_account as any)?.name || '',
          credit_value: creditValue,
          running_bank_balance: runningBalance
        };
      }) || [];

      setData(bankTransactions);
    } catch (error) {
      console.error('Error fetching bank statement:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
};
