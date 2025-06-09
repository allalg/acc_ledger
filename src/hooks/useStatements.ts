
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatementItem {
  item: string;
  value: string;
}//lets go

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
        .select(`
          amount,
          accounts!credit_account_id(
            account_heads(name)
          )
        `);

      const totalIncome = incomeTransactions?.reduce((sum, txn) => {
        const accountHead = (txn.accounts as any)?.account_heads?.name;
        return accountHead === 'Income' ? sum + (txn.amount || 0) : sum;
      }, 0) || 0;

      // Get operating expenses (debits to expense accounts, excluding inventory)
      const { data: expenseTransactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          accounts!debit_account_id(
            id,
            account_heads(name)
          )
        `);

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
      
      // Get account balances with proper joins
      const { data: accountsData } = await supabase
        .from('accounts')
        .select(`
          id,
          name,
          account_heads(name)
        `);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('debit_account_id, credit_account_id, amount');

      // Calculate balances for each account
      const balances: { [key: string]: { balance: number; type: string; name: string } } = {};
      
      accountsData?.forEach(account => {
        const accountType = (account.account_heads as any)?.name;
        balances[account.id] = {
          balance: 0,
          type: accountType,
          name: account.name
        };
      });

      // Calculate account balances from transactions
      transactions?.forEach(txn => {
        if (txn.debit_account_id && balances[txn.debit_account_id]) {
          balances[txn.debit_account_id].balance += txn.amount;
        }
        if (txn.credit_account_id && balances[txn.credit_account_id]) {
          balances[txn.credit_account_id].balance -= txn.amount;
        }
      });

      // Calculate net profit using P&L data
      const { data: profitData } = useProfitLossStatement();
      const netProfitItem = profitData.find(item => item.item === 'Net Profit/Loss');
      const netProfit = parseFloat(netProfitItem?.value || '0');

      // Separate accounts by type and filter out zero balances
      const assets = Object.values(balances).filter(acc => acc.type === 'Assets' && Math.abs(acc.balance) > 0.01);
      const liabilities = Object.values(balances).filter(acc => acc.type === 'Liabilities' && Math.abs(acc.balance) > 0.01);
      const equity = Object.values(balances).filter(acc => acc.type === 'Equity' && Math.abs(acc.balance) > 0.01);

      const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
      const totalLiabilities = liabilities.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
      const totalEquity = equity.reduce((sum, acc) => sum + Math.abs(acc.balance), 0) + netProfit;

      const balanceSheetData: StatementItem[] = [
        { item: 'ASSETS', value: '' },
        ...assets.map(acc => ({ item: acc.name, value: acc.balance.toString() })),
        { item: 'Total Assets', value: totalAssets.toString() },
        { item: '', value: '' },
        { item: 'LIABILITIES', value: '' },
        ...liabilities.map(acc => ({ item: acc.name, value: Math.abs(acc.balance).toString() })),
        { item: 'Total Liabilities', value: totalLiabilities.toString() },
        { item: '', value: '' },
        { item: 'EQUITY', value: '' },
        ...equity.map(acc => ({ item: acc.name, value: Math.abs(acc.balance).toString() })),
        { item: 'Retained Earnings', value: netProfit.toString() },
        { item: 'Total Equity', value: totalEquity.toString() }
      ];

      console.log('Balance Sheet Data:', balanceSheetData);
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
