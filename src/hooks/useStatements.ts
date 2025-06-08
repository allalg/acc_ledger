
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
      
      const query = `
        WITH bank_account AS (
          SELECT id FROM accounts WHERE name = 'Bank'
        ),
        bank_transactions AS (
          SELECT
            t.id AS transaction_id,
            t.transaction_date,
            t.description,
            COALESCE(u.username, 'System/Auto') AS username,
            da.name AS debit_account,
            CASE WHEN t.debit_account_id = ba.id THEN t.amount ELSE 0 END AS debit_value,
            ca.name AS credit_account,
            CASE WHEN t.credit_account_id = ba.id THEN t.amount ELSE 0 END AS credit_value
          FROM transactions t
          LEFT JOIN users u ON u.user_id = t.user_id
          JOIN accounts da ON da.id = t.debit_account_id
          JOIN accounts ca ON ca.id = t.credit_account_id
          JOIN bank_account ba ON (t.debit_account_id = ba.id OR t.credit_account_id = ba.id)
        )
        SELECT
          transaction_id,
          transaction_date,
          description,
          username,
          debit_account,
          debit_value,
          credit_account,
          credit_value,
          SUM(debit_value - credit_value) OVER (ORDER BY transaction_date, transaction_id) AS running_bank_balance
        FROM bank_transactions
        ORDER BY transaction_date, transaction_id;
      `;

      const { data: bankData, error } = await supabase.rpc('execute_sql', { query });
      
      if (error) {
        console.error('Error fetching bank statement:', error);
      } else {
        setData(bankData || []);
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
      
      const query = `
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
            WHERE debit_account_id = 4
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
            WHERE ah.name = 'Income'
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
      `;

      const { data: profitLossData, error } = await supabase.rpc('execute_sql', { query });
      
      if (error) {
        console.error('Error fetching profit/loss statement:', error);
      } else {
        setData(profitLossData || []);
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
      
      // Using the same query as profit/loss for now as requested
      const query = `
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
            WHERE debit_account_id = 4
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
            WHERE ah.name = 'Income'
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
      `;

      const { data: balanceSheetData, error } = await supabase.rpc('execute_sql', { query });
      
      if (error) {
        console.error('Error fetching balance sheet:', error);
      } else {
        setData(balanceSheetData || []);
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
