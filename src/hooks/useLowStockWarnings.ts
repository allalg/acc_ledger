
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  sku: string;
}

export const useLowStockWarnings = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, current_stock, sku')
        .lt('current_stock', 10)
        .order('current_stock', { ascending: true });

      if (error) {
        console.error('Error fetching low stock items:', error);
        setLowStockItems([]);
      } else {
        setLowStockItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  return { lowStockItems, loading, refetch: fetchLowStockItems };
};
