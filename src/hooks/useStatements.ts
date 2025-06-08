import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface StatementItem {
  item: string;
  value: string;
}

export const useBankStatement = () => {
  const [data, setData] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBankStatement = async () => {
    try {
      setLoading(true);
      
      // Instead of 'execute_sql', use the correct RPC function for type safety
      // For BankStatement, use 'get_total_bank_balance'
      const { data: bankData, error } = await supabase.rpc('get_total_bank_balance');
      
      if (error) {
        console.error('Error fetching bank statement:', error);
      } else {
        // For setData, ensure type safety by checking if data is an array
        setData(Array.isArray(bankData) ? bankData : []);
      }
    } catch (error) {
      console.error('Error fetching bank statement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankStatement();
  }, []);

  return { data, loading, refetch: fetchBankStatement };
};

export const useProfitLossStatement = () => {
  const [data, setData] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      
      // For ProfitLossStatement, use 'get_net_profit_loss'
      const { data: profitLossData, error } = await supabase.rpc('get_net_profit_loss');
      
      if (error) {
        console.error('Error fetching profit/loss statement:', error);
      } else {
        // For setData, ensure type safety by checking if data is an array
        setData(Array.isArray(profitLossData) ? profitLossData : []);
      }
    } catch (error) {
      console.error('Error fetching profit/loss statement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  return { data, loading, refetch: fetchProfitLoss };
};

export const useBalanceSheet = () => {
  const [data, setData] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      
      // For BalanceSheet, use 'get_net_profit_loss' or create a new function if needed
      const { data: balanceSheetData, error } = await supabase.rpc('get_net_profit_loss');
      
      if (error) {
        console.error('Error fetching balance sheet:', error);
      } else {
        // For setData, ensure type safety by checking if data is an array
        setData(Array.isArray(balanceSheetData) ? balanceSheetData : []);
      }
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  return { data, loading, refetch: fetchBalanceSheet };
};
