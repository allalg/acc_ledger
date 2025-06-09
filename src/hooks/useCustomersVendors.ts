
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  user_id: string;
  username: string;
  balance: number;
  role: string;
}

interface Vendor {
  user_id: string;
  username: string;
  balance: number;
  role: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          user_id,
          username,
          role
        `)
        .eq('role', 'customer');

      if (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
        return;
      }

      // Get customer balances
      const { data: customerAccounts } = await supabase
        .from('customer_accounts')
        .select('customer_id, balance');

      const formattedData = data?.map(user => {
        const customerAccount = customerAccounts?.find(acc => acc.customer_id === user.user_id);
        return {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          balance: customerAccount?.balance || 0
        };
      }) || [];

      console.log('Customer data:', formattedData);
      setCustomers(formattedData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, refetch: fetchCustomers };
};

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          user_id,
          username,
          role
        `)
        .eq('role', 'vendor');

      if (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]);
        return;
      }

      // Get vendor balances
      const { data: vendorAccounts } = await supabase
        .from('vendor_accounts')
        .select('vendor_id, balance');

      const formattedData = data?.map(user => {
        const vendorAccount = vendorAccounts?.find(acc => acc.vendor_id === user.user_id);
        return {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          balance: vendorAccount?.balance || 0
        };
      }) || [];

      console.log('Vendor data:', formattedData);
      setVendors(formattedData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return { vendors, loading, refetch: fetchVendors };
};
