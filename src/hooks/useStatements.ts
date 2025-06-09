
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
  const [data, setData] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get beginning inventory value
      const { data: inventoryItems } = await supabase
        .from('inventory_items')
        .select('opening_stock, cost_price, current_stock');

      const beginningInventory = inventoryItems?.reduce((sum, item) => 
        sum + (item.opening_stock || 0) * (item.cost_price || 0), 0) || 0;
      
      const endingInventory = inventoryItems?.reduce((sum, item) => 
        sum + (item.current_stock || 0) * (item.cost_price || 0), 0) || 0;

      // Get total purchases (debit to inventory account id 4)
      const { data: purchases } = await supabase
        .from('transactions')
        .select('amount')
        .eq('debit_account_id', 4);

      const totalPurchases = purchases?.reduce((sum, txn) => sum + (txn.amount || 0), 0) || 0;

      // Get total income (credits to income accounts)
      const { data: incomeTransactions } = await supabase
        .from('transactions')
        .select('amount, accounts!credit_account_id(account_heads(name))')
        .not('accounts.account_heads.name', 'is', null);

      const totalIncome = incomeTransactions?.reduce((sum, txn) => {
        const accountHead = (txn.accounts as any)?.account_heads?.name;
        return accountHead === 'Income' ? sum + (txn.amount || 0) : sum;
      }, 0) || 0;

      // Get operating expenses (debits to expense accounts, excluding inventory)
      const { data: expenseTransactions } = await supabase
        .from('transactions')
        .select('amount, accounts!debit_account_id(id, account_heads(name))')
        .not('accounts.account_heads.name', 'is', null);

      const operatingExpenses = expenseTransactions?.reduce((sum, txn) => {
        const account = txn.accounts as any;
        const accountHead = account?.account_heads?.name;
        const accountId = account?.id;
        return accountHead === 'Expense' && accountId !== 4 ? sum + (txn.amount || 0) : sum;
      }, 0) || 0;

      const cogs = beginningInventory + totalPurchases - endingInventory;
      const grossProfit = totalIncome - cogs;
      const netProfitLoss = grossProfit - operatingExpenses;

      const profitStatus = netProfitLoss > 0 ? 'Profit' : netProfitLoss < 0 ? 'Loss' : 'Break Even';

      const statementData: StatementItem[] = [
        { item: 'Total Income', value: totalIncome.toString() },
        { item: 'Beginning Inventory', value: beginningInventory.toString() },
        { item: 'Purchases', value: totalPurchases.toString() },
        { item: 'Ending Inventory', value: endingInventory.toString() },
        { item: 'Cost of Goods Sold', value: cogs.toString() },
        { item: 'Gross Profit', value: grossProfit.toString() },
        { item: 'Operating Expenses', value: operatingExpenses.toString() },
        { item: 'Net Profit/Loss', value: netProfitLoss.toString() },
        { item: 'Profit Status', value: profitStatus }
      ];

      setData(statementData);
    } catch (error) {
      console.error('Error fetching P&L statement:', error);
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

export const useBalanceSheet = () => {
  const [data, setData] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get asset accounts and their balances
      const { data: assetTransactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          debit_account_id,
          credit_account_id,
          accounts!debit_account_id(name, account_heads(name)),
          credit_accounts:accounts!credit_account_id(name, account_heads(name))
        `);

      const assetBalances: { [key: string]: number } = {};
      const liabilityBalances: { [key: string]: number } = {};
      const equityBalances: { [key: string]: number } = {};

      assetTransactions?.forEach(txn => {
        const debitAccount = txn.accounts as any;
        const creditAccount = txn.credit_accounts as any;
        
        // Process debit side
        if (debitAccount?.account_heads?.name === 'Asset') {
          const accountName = debitAccount.name;
          assetBalances[accountName] = (assetBalances[accountName] || 0) + (txn.amount || 0);
        }
        
        // Process credit side
        if (creditAccount?.account_heads?.name === 'Asset') {
          const accountName = creditAccount.name;
          assetBalances[accountName] = (assetBalances[accountName] || 0) - (txn.amount || 0);
        }
        
        if (creditAccount?.account_heads?.name === 'Liability') {
          const accountName = creditAccount.name;
          liabilityBalances[accountName] = (liabilityBalances[accountName] || 0) + (txn.amount || 0);
        }
        
        if (debitAccount?.account_heads?.name === 'Liability') {
          const accountName = debitAccount.name;
          liabilityBalances[accountName] = (liabilityBalances[accountName] || 0) - (txn.amount || 0);
        }
        
        if (creditAccount?.account_heads?.name === 'Equity') {
          const accountName = creditAccount.name;
          equityBalances[accountName] = (equityBalances[accountName] || 0) + (txn.amount || 0);
        }
        
        if (debitAccount?.account_heads?.name === 'Equity') {
          const accountName = debitAccount.name;
          equityBalances[accountName] = (equityBalances[accountName] || 0) - (txn.amount || 0);
        }
      });

      // Calculate net profit for retained earnings
      const { data: profitData } = await useProfitLossStatement();
      const netProfitItem = profitData.find(item => item.item === 'Net Profit/Loss');
      const netProfit = parseFloat(netProfitItem?.value || '0');

      const balanceSheetData: StatementItem[] = [
        { item: 'ASSETS', value: '' },
        ...Object.entries(assetBalances)
          .filter(([_, balance]) => balance !== 0)
          .map(([name, balance]) => ({ item: name, value: balance.toString() })),
        { item: 'Total Assets', value: Object.values(assetBalances).reduce((sum, bal) => sum + bal, 0).toString() },
        { item: '', value: '' },
        { item: 'LIABILITIES', value: '' },
        ...Object.entries(liabilityBalances)
          .filter(([_, balance]) => balance !== 0)
          .map(([name, balance]) => ({ item: name, value: balance.toString() })),
        { item: 'Total Liabilities', value: Object.values(liabilityBalances).reduce((sum, bal) => sum + bal, 0).toString() },
        { item: '', value: '' },
        { item: 'EQUITY', value: '' },
        ...Object.entries(equityBalances)
          .filter(([_, balance]) => balance !== 0)
          .map(([name, balance]) => ({ item: name, value: balance.toString() })),
        { item: 'Retained Earnings', value: netProfit.toString() },
        { item: 'Total Equity', value: (Object.values(equityBalances).reduce((sum, bal) => sum + bal, 0) + netProfit).toString() }
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
    fetchData();
  }, []);

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
