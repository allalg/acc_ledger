
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
          role,
          customer_accounts!inner (
            balance
          )
        `)
        .eq('role', 'customer');

      if (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } else {
        const formattedData = data?.map(user => ({
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          balance: user.customer_accounts?.[0]?.balance || 0
        })) || [];
        setCustomers(formattedData);
      }
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
          role,
          vendor_accounts!inner (
            balance
          )
        `)
        .eq('role', 'vendor');

      if (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]);
      } else {
        const formattedData = data?.map(user => ({
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          balance: user.vendor_accounts?.[0]?.balance || 0
        })) || [];
        setVendors(formattedData);
      }
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
