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
      let query = '';

      switch (ledgerType) {
        case 'accounts-receivable':
          query = `
            WITH ar_account AS (
              SELECT id FROM accounts WHERE name = 'Accounts recievables'
            ),
            ar_transactions AS (
              SELECT
                t.id AS transaction_id,
                t.transaction_date,
                t.description,
                t.user_id,
                u.username,
                t.payment_status,
                t.reference_transaction_ids,
                da.name AS debit_account,
                CASE WHEN t.debit_account_id = ar.id THEN t.amount ELSE 0 END AS debit_val,
                ca.name AS credit_account,
                CASE WHEN t.credit_account_id = ar.id THEN t.amount ELSE 0 END AS credit_val
              FROM transactions t
              JOIN users u ON u.user_id = t.user_id
              JOIN accounts da ON da.id = t.debit_account_id
              JOIN accounts ca ON ca.id = t.credit_account_id
              JOIN ar_account ar ON (t.debit_account_id = ar.id OR t.credit_account_id = ar.id)
            )
            SELECT 
              transaction_id,
              transaction_date,
              description,
              user_id,
              username,
              payment_status,
              reference_transaction_ids,
              debit_account,
              debit_val,
              credit_account,
              credit_val,
              SUM(debit_val - credit_val) OVER (ORDER BY transaction_date, transaction_id) AS running_balance
            FROM ar_transactions
            ORDER BY transaction_date, transaction_id;
          `;
          break;

        case 'accounts-payable':
          query = `
            WITH ap_account AS (
              SELECT id FROM accounts WHERE name = 'Accounts payable'
            ),
            ap_transactions AS (
              SELECT
                t.id AS transaction_id,
                t.transaction_date,
                t.description,
                t.user_id,
                u.username,
                da.name AS debit_account,
                CASE WHEN t.debit_account_id = ap.id THEN t.amount ELSE 0 END AS debit_value,
                ca.name AS credit_account,
                CASE WHEN t.credit_account_id = ap.id THEN t.amount ELSE 0 END AS credit_value
              FROM transactions t
              JOIN users u ON u.user_id = t.user_id
              JOIN accounts da ON da.id = t.debit_account_id
              JOIN accounts ca ON ca.id = t.credit_account_id
              JOIN ap_account ap ON (t.debit_account_id = ap.id OR t.credit_account_id = ap.id)
            )
            SELECT 
              transaction_id,
              transaction_date,
              description,
              user_id,
              username,
              debit_account,
              debit_value,
              credit_account,
              credit_value,
              SUM(credit_value - debit_value) OVER (ORDER BY transaction_date, transaction_id) AS running_balance
            FROM ap_transactions
            ORDER BY transaction_date, transaction_id;
          `;
          break;

        case 'sales':
          query = `
            WITH inventory_account AS (
              SELECT id FROM accounts WHERE name = 'Inventory'
            ),
            sales_transactions AS (
              SELECT
                t.id AS transaction_id,
                t.transaction_date,
                t.description,
                u.username,
                ii.name as item_name,
                ti.quantity,
                ti.unit_price,
                ti.discount,
                (ti.quantity * ti.unit_price) AS line_total,
                CASE WHEN t.debit_account_id = ia.id THEN (ti.quantity * ti.unit_price) ELSE 0 END AS debit,
                CASE WHEN t.credit_account_id = ia.id THEN (ti.quantity * ti.unit_price) ELSE 0 END AS credit
              FROM transactions t
              JOIN users u ON u.user_id = t.user_id
              JOIN transaction_items ti ON ti.transaction_id = t.id
              JOIN inventory_items ii ON ii.id = ti.item_id
              JOIN inventory_account ia ON t.credit_account_id = ia.id
            )
            SELECT
              transaction_id,
              transaction_date,
              description,
              username,
              item_name,
              quantity,
              unit_price,
              discount,
              line_total,
              debit,
              credit,
              SUM(credit-debit ) OVER (ORDER BY transaction_date, transaction_id) AS running_inventory_balance
            FROM sales_transactions
            ORDER BY transaction_date, transaction_id;
          `;
          break;

        case 'purchases':
          query = `
            WITH inventory_account AS (
              SELECT id FROM accounts WHERE name = 'Inventory'
            ),
            purchase_transactions AS (
              SELECT
                t.id AS transaction_id,
                t.transaction_date,
                t.description,
                u.username,
                ii.name AS item_name,
                ti.quantity,
                ti.unit_price,
                ti.discount,
                (ti.quantity * ti.unit_price - ti.discount) AS line_total,
                CASE WHEN t.debit_account_id = ia.id THEN (ti.quantity * ti.unit_price - ti.discount) ELSE 0 END AS debit,
                CASE WHEN t.credit_account_id = ia.id THEN (ti.quantity * ti.unit_price - ti.discount) ELSE 0 END AS credit
              FROM transactions t
              JOIN users u ON u.user_id = t.user_id
              JOIN transaction_items ti ON ti.transaction_id = t.id
              JOIN inventory_items ii ON ii.id = ti.item_id
              JOIN inventory_account ia ON t.debit_account_id = ia.id
            )
            SELECT
              transaction_id,
              transaction_date,
              description,
              username,
              item_name,
              quantity,
              unit_price,
              discount,
              line_total,
              debit,
              credit,
              SUM(debit - credit) OVER (ORDER BY transaction_date, transaction_id) AS running_inventory_balance
            FROM purchase_transactions
            ORDER BY transaction_date, transaction_id;
          `;
          break;

        default:
          setData([]);
          setLoading(false);
          return;
      }

      // Use the correct Supabase RPC function for custom SQL
      const { data: ledgerData, error } = await supabase.rpc('execute_sql', { query });
      // Ensure type safety: setData only if array, else empty array
      setData(Array.isArray(ledgerData) ? ledgerData : []);
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [ledgerType]);

  return { data, loading, refetch: fetchLedgerData };
};
