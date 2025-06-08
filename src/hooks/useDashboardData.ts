
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  netProfitLoss: number;
  profitStatus: string;
  bankBalance: number;
  debtorBalance: number;
  creditorBalance: number;
  totalSales: number;
  totalPurchases: number;
  totalInventory: number;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    netProfitLoss: 0,
    profitStatus: 'Break Even',
    bankBalance: 0,
    debtorBalance: 0,
    creditorBalance: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalInventory: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get net profit/loss
      const { data: profitData } = await supabase.rpc('get_net_profit_loss');
      
      // Get bank balance
      const { data: bankData } = await supabase.rpc('get_total_bank_balance');

      // Get debtor balance
      const { data: debtorData } = await supabase
        .from('customer_accounts')
        .select('balance');
      const debtorBalance = debtorData?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

      // Get creditor balance
      const { data: creditorData } = await supabase
        .from('vendor_accounts')
        .select('balance');
      const creditorBalance = creditorData?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

      // Get total sales
      const { data: salesData } = await supabase
        .from('inventory_movements')
        .select('unit_cost, quantity')
        .eq('movement_type', 'out');
      const totalSales = salesData?.reduce((sum, movement) => sum + (movement.unit_cost * movement.quantity), 0) || 0;

      // Get total purchases
      const { data: purchasesData } = await supabase
        .from('inventory_movements')
        .select('unit_cost, quantity')
        .eq('movement_type', 'in');
      const totalPurchases = purchasesData?.reduce((sum, movement) => sum + (movement.unit_cost * movement.quantity), 0) || 0;

      // Get total inventory
      const { data: inventoryData } = await supabase
        .from('inventory_items')
        .select('current_stock, cost_price');
      const totalInventory = inventoryData?.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0) || 0;

      setData({
        netProfitLoss: profitData?.netProfitLoss || 0,
        profitStatus: profitData?.profitStatus || 'Break Even',
        bankBalance: bankData || 0,
        debtorBalance,
        creditorBalance,
        totalSales,
        totalPurchases,
        totalInventory
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up interval to fetch data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, refetch: fetchDashboardData };
};
