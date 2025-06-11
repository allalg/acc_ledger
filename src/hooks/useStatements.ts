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

interface BalanceSheetItem {
  section: string;
  account_name: string;
  amount: string;
}

export const useProfitLossStatement = () => {
  const [data, setData] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: plData, error } = await supabase.rpc('execute_sql', {
        sql_query: `
          WITH 
          beginning_inventory AS (
              SELECT COALESCE(SUM(opening_stock * cost_price), 0) AS value
              FROM inventory_items
          ),

          ending_inventory AS (
              SELECT COALESCE(SUM(current_stock * cost_price), 0) AS value
              FROM inventory_items
          ),

          total_purchases AS (
              SELECT COALESCE(SUM(amount), 0) AS amount
              FROM transactions
              WHERE debit_account_id = 4 -- Inventory account ID
          ),

          cogs AS (
              SELECT 
                   (SELECT value FROM beginning_inventory) +
                   (SELECT amount FROM total_purchases) -
                   (SELECT value FROM ending_inventory) AS cost_of_goods_sold
          ),

          total_income AS (
              SELECT COALESCE(SUM(t.amount), 0) AS amount
              FROM transactions t
              JOIN accounts a ON a.id = t.credit_account_id
              JOIN account_heads ah ON ah.id = a.account_head_id
              WHERE a.name='Inventory'
              OR ah.name = 'Income'
          ),

          operating_expenses AS (
              SELECT COALESCE(SUM(t.amount), 0) AS amount
              FROM transactions t
              JOIN accounts a ON a.id = t.debit_account_id
              JOIN account_heads ah ON ah.id = a.account_head_id
              WHERE ah.name = 'Expense' AND a.id != 4
          ),

          summary AS (
              SELECT 
                  (SELECT amount FROM total_income) AS total_income,
                  (SELECT amount FROM total_purchases) AS total_purchases,
                  (SELECT value FROM beginning_inventory) AS beginning_inventory_value,
                  (SELECT value FROM ending_inventory) AS ending_inventory_value,
                  (SELECT cost_of_goods_sold FROM cogs) AS cogs,
                  (SELECT amount FROM operating_expenses) AS operating_expenses
          )

          SELECT 'Total Income' AS item, total_income::TEXT AS value FROM summary
          UNION ALL
          SELECT 'Beginning Inventory', beginning_inventory_value::TEXT FROM summary
          UNION ALL
          SELECT 'Purchases', total_purchases::TEXT FROM summary
          UNION ALL
          SELECT 'Ending Inventory', ending_inventory_value::TEXT FROM summary
          UNION ALL
          SELECT 'Cost of Goods Sold', cogs::TEXT FROM summary
          UNION ALL
          SELECT 'Gross Profit', (total_income - cogs)::TEXT FROM summary
          UNION ALL
          SELECT 'Operating Expenses', operating_expenses::TEXT FROM summary
          UNION ALL
          SELECT 'Net Profit/Loss', (total_income - cogs - operating_expenses)::TEXT FROM summary
          UNION ALL
          SELECT 'Profit Status', 
              CASE 
                  WHEN (total_income - cogs - operating_expenses) > 0 THEN 'Profit'
                  WHEN (total_income - cogs - operating_expenses) < 0 THEN 'Loss'
                  ELSE 'Break Even'
              END::TEXT
          FROM summary;
        `
      });

      if (error) throw error;

      const statementData: StatementItem[] = plData?.result || [];
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
      
      const { data: bsData, error } = await supabase.rpc('execute_sql', {
        sql_query: `
          WITH account_balances AS (
            SELECT
              a.id,
              a.name AS account_name,
              ah.name AS account_type,
              SUM(CASE WHEN t.debit_account_id = a.id THEN t.amount ELSE 0 END)
              - SUM(CASE WHEN t.credit_account_id = a.id THEN t.amount ELSE 0 END)
              AS balance
            FROM accounts a
            JOIN account_heads ah ON ah.id = a.account_head_id
            LEFT JOIN transactions t
              ON t.debit_account_id = a.id OR t.credit_account_id = a.id
            GROUP BY a.id, a.name, ah.name
          ),
          beginning_inventory AS (
            SELECT COALESCE(SUM(opening_stock * cost_price),0) AS value FROM inventory_items
          ),
          ending_inventory AS (
            SELECT COALESCE(SUM(current_stock * cost_price),0) AS value FROM inventory_items
          ),
          total_purchases AS (
            SELECT COALESCE(SUM(amount),0) AS amount FROM transactions WHERE debit_account_id = 4
          ),
          cogs AS (
            SELECT (SELECT value FROM beginning_inventory)
                 + (SELECT amount FROM total_purchases)
                 - (SELECT value FROM ending_inventory) AS value
          ),
          total_income AS (
            SELECT COALESCE(SUM(t.amount),0) AS amount
            FROM transactions t
            JOIN accounts a ON a.id = t.credit_account_id
            JOIN account_heads ah ON ah.id = a.account_head_id
            WHERE a.name='Inventory' OR ah.name='Income'
          ),
          operating_expenses AS (
            SELECT COALESCE(SUM(t.amount),0) AS amount
            FROM transactions t
            JOIN accounts a ON a.id = t.debit_account_id
            JOIN account_heads ah ON ah.id = a.account_head_id
            WHERE ah.name='Expense' AND a.id != 4
          ),
          net_profit_calc AS (
            SELECT (SELECT amount FROM total_income)
                 - (SELECT value FROM cogs)
                 - (SELECT amount FROM operating_expenses)
                 AS net_profit
          ),
          assets AS (
            SELECT account_name, balance::numeric AS amount
            FROM account_balances WHERE account_type='Assets'
          ),
          assets_total AS (
            SELECT 'Total Assets' AS account_name, SUM(amount) AS amount FROM assets
          ),
          liabilities AS (
            SELECT account_name, -balance::numeric AS amount
            FROM account_balances WHERE account_type='Liabilities'
          ),
          liabilities_total AS (
            SELECT 'Total Liabilities' AS account_name, SUM(amount) AS amount FROM liabilities
          ),
          equity AS (
            SELECT account_name, -balance::numeric AS amount
            FROM account_balances WHERE account_type='Equity'
          ),
          equity_net_profit AS (
            SELECT account_name, amount FROM equity
            UNION ALL
            SELECT 'Net Profit for the Period', net_profit FROM net_profit_calc
          ),
          equity_total AS (
            SELECT 'Total Equity' AS account_name, SUM(amount) AS amount FROM equity_net_profit
          ),
          liabilities_equity_total AS (
            SELECT 'Total Liabilities & Equity' AS account_name,
                   (SELECT amount FROM liabilities_total) + (SELECT amount FROM equity_total) AS amount
          ),
          final_ordered AS (
            SELECT 'Assets' AS section, account_name, ROUND(amount, 2)::text AS amount, 1 AS ord FROM assets
            UNION ALL
            SELECT 'Assets', account_name, ROUND(amount, 2)::text, 2 FROM assets_total
            UNION ALL
            SELECT '', '', '', 3
            UNION ALL
            SELECT 'Liabilities', account_name, ROUND(amount, 2)::text, 4 FROM liabilities
            UNION ALL
            SELECT 'Liabilities', account_name, ROUND(amount, 2)::text, 5 FROM liabilities_total
            UNION ALL
            SELECT '', '', '', 6
            UNION ALL
            SELECT 'Equity', account_name, ROUND(amount, 2)::text, 7 FROM equity_net_profit
            UNION ALL
            SELECT 'Equity', account_name, ROUND(amount, 2)::text, 8 FROM equity_total
            UNION ALL
            SELECT '', '', '', 9
            UNION ALL
            SELECT 'Liabilities & Equity', account_name, ROUND(amount, 2)::text, 10 FROM liabilities_equity_total
          )

          SELECT section, account_name, amount
          FROM final_ordered
          ORDER BY ord;
        `
      });

      if (error) throw error;

      // Transform the balance sheet data to match the expected format
      const balanceSheetData: StatementItem[] = (bsData?.result || []).map((row: BalanceSheetItem) => ({
        item: row.section ? `${row.section} - ${row.account_name}` : row.account_name,
        value: row.amount
      }));

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
