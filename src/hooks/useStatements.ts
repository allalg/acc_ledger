
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
      
      // Get Bank account ID first
      const { data: bankAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', 'Bank')
        .single();

      if (bankAccount) {
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select(`
            id,
            transaction_date,
            description,
            user_id,
            amount,
            debit_account_id,
            credit_account_id,
            users(username),
            debit_account:accounts!transactions_debit_account_id_fkey(name),
            credit_account:accounts!transactions_credit_account_id_fkey(name)
          `)
          .or(`debit_account_id.eq.${bankAccount.id},credit_account_id.eq.${bankAccount.id}`)
          .order('transaction_date')
          .order('id');

        if (error) {
          console.error('Error fetching bank transactions:', error);
          setData([]);
        } else if (transactions) {
          let runningBalance = 0;
          const formattedData = transactions.map((t: any) => {
            const debitValue = t.debit_account_id === bankAccount.id ? t.amount : 0;
            const creditValue = t.credit_account_id === bankAccount.id ? t.amount : 0;
            runningBalance += (debitValue - creditValue);
            
            return {
              transaction_id: t.id,
              transaction_date: t.transaction_date,
              description: t.description || '',
              username: t.users?.username || 'System/Auto',
              debit_account: t.debit_account?.name || '',
              debit_value: debitValue,
              credit_account: t.credit_account?.name || '',
              credit_value: creditValue,
              running_bank_balance: runningBalance
            };
          });
          setData(formattedData);
        }
      } else {
        console.error('Bank account not found');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching bank statement:', error);
      setData([]);
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
      
      // Calculate beginning inventory
      const { data: inventoryItems } = await supabase
        .from('inventory_items')
        .select('opening_stock, cost_price, current_stock');

      let beginningInventory = 0;
      let endingInventory = 0;
      
      if (inventoryItems) {
        beginningInventory = inventoryItems.reduce((sum, item) => 
          sum + (item.opening_stock || 0) * (item.cost_price || 0), 0);
        endingInventory = inventoryItems.reduce((sum, item) => 
          sum + (item.current_stock || 0) * (item.cost_price || 0), 0);
      }

      // Get inventory account ID for purchases
      const { data: inventoryAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', 'Inventory')
        .single();

      let totalPurchases = 0;
      if (inventoryAccount) {
        const { data: purchaseTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('debit_account_id', inventoryAccount.id);
        
        totalPurchases = purchaseTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      }

      // Calculate income
      const { data: incomeAccounts } = await supabase
        .from('accounts')
        .select(`
          id,
          account_heads!inner(name)
        `)
        .eq('account_heads.name', 'Income');

      let totalIncome = 0;
      if (incomeAccounts && incomeAccounts.length > 0) {
        const incomeAccountIds = incomeAccounts.map(acc => acc.id);
        const { data: incomeTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .in('credit_account_id', incomeAccountIds);
        
        totalIncome = incomeTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      }

      // Calculate expenses (excluding inventory)
      const { data: expenseAccounts } = await supabase
        .from('accounts')
        .select(`
          id,
          account_heads!inner(name)
        `)
        .eq('account_heads.name', 'Expense')
        .neq('id', inventoryAccount?.id || -1);

      let operatingExpenses = 0;
      if (expenseAccounts && expenseAccounts.length > 0) {
        const expenseAccountIds = expenseAccounts.map(acc => acc.id);
        const { data: expenseTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .in('debit_account_id', expenseAccountIds);
        
        operatingExpenses = expenseTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      }

      const cogs = beginningInventory + totalPurchases - endingInventory;
      const grossProfit = totalIncome - cogs;
      const netProfitLoss = grossProfit - operatingExpenses;

      const profitLossData = [
        { item: 'Total Income', value: totalIncome.toString() },
        { item: 'Beginning Inventory', value: beginningInventory.toString() },
        { item: 'Purchases', value: totalPurchases.toString() },
        { item: 'Ending Inventory', value: endingInventory.toString() },
        { item: 'Cost of Goods Sold', value: cogs.toString() },
        { item: 'Gross Profit', value: grossProfit.toString() },
        { item: 'Operating Expenses', value: operatingExpenses.toString() },
        { item: 'Net Profit/Loss', value: netProfitLoss.toString() },
        { 
          item: 'Profit Status', 
          value: netProfitLoss > 0 ? 'Profit' : netProfitLoss < 0 ? 'Loss' : 'Break Even'
        }
      ];

      setData(profitLossData);
    } catch (error) {
      console.error('Error fetching profit/loss statement:', error);
      setData([]);
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
      
      // For now, use the same data as P&L since they have similar structure
      // In a real accounting system, balance sheet would show assets, liabilities, equity
      const { data: profitLossData } = await new Promise<{data: StatementItem[]}>((resolve) => {
        // Reuse the P&L calculation logic here
        // This is a simplified approach - in reality balance sheet would be different
        resolve({ data: [] });
      });

      // Calculate beginning inventory
      const { data: inventoryItems } = await supabase
        .from('inventory_items')
        .select('opening_stock, cost_price, current_stock');

      let beginningInventory = 0;
      let endingInventory = 0;
      
      if (inventoryItems) {
        beginningInventory = inventoryItems.reduce((sum, item) => 
          sum + (item.opening_stock || 0) * (item.cost_price || 0), 0);
        endingInventory = inventoryItems.reduce((sum, item) => 
          sum + (item.current_stock || 0) * (item.cost_price || 0), 0);
      }

      // Get inventory account ID for purchases
      const { data: inventoryAccount } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', 'Inventory')
        .single();

      let totalPurchases = 0;
      if (inventoryAccount) {
        const { data: purchaseTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('debit_account_id', inventoryAccount.id);
        
        totalPurchases = purchaseTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      }

      // Calculate income
      const { data: incomeAccounts } = await supabase
        .from('accounts')
        .select(`
          id,
          account_heads!inner(name)
        `)
        .eq('account_heads.name', 'Income');

      let totalIncome = 0;
      if (incomeAccounts && incomeAccounts.length > 0) {
        const incomeAccountIds = incomeAccounts.map(acc => acc.id);
        const { data: incomeTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .in('credit_account_id', incomeAccountIds);
        
        totalIncome = incomeTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      }

      // Calculate expenses (excluding inventory)
      const { data: expenseAccounts } = await supabase
        .from('accounts')
        .select(`
          id,
          account_heads!inner(name)
        `)
        .eq('account_heads.name', 'Expense')
        .neq('id', inventoryAccount?.id || -1);

      let operatingExpenses = 0;
      if (expenseAccounts && expenseAccounts.length > 0) {
        const expenseAccountIds = expenseAccounts.map(acc => acc.id);
        const { data: expenseTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .in('debit_account_id', expenseAccountIds);
        
        operatingExpenses = expenseTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      }

      const cogs = beginningInventory + totalPurchases - endingInventory;
      const grossProfit = totalIncome - cogs;
      const netProfitLoss = grossProfit - operatingExpenses;

      const balanceSheetData = [
        { item: 'Total Income', value: totalIncome.toString() },
        { item: 'Beginning Inventory', value: beginningInventory.toString() },
        { item: 'Purchases', value: totalPurchases.toString() },
        { item: 'Ending Inventory', value: endingInventory.toString() },
        { item: 'Cost of Goods Sold', value: cogs.toString() },
        { item: 'Gross Profit', value: grossProfit.toString() },
        { item: 'Operating Expenses', value: operatingExpenses.toString() },
        { item: 'Net Profit/Loss', value: netProfitLoss.toString() },
        { 
          item: 'Profit Status', 
          value: netProfitLoss > 0 ? 'Profit' : netProfitLoss < 0 ? 'Loss' : 'Break Even'
        }
      ];

      setData(balanceSheetData);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  return { data, loading, refetch: fetchBalanceSheet };
};
