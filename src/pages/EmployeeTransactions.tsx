
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Transaction {
  id: number;
  transaction_date: string;
  description: string;
  amount: number;
  payment_status: string;
  debit_account: string;
  credit_account: string;
  misc_vendor_name?: string;
  misc_customer_name?: string;
  username?: string;
  reference_transaction_ids?: number[];
  created_by_me: boolean;
}

export default function EmployeeTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployeeTransactions();
  }, [user]);

  const fetchEmployeeTransactions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch transactions created by the employee
      const { data: createdTransactions } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_date,
          description,
          amount,
          payment_status,
          reference_transaction_ids,
          misc_vendor_name,
          misc_customer_name,
          debit_account:accounts!transactions_debit_account_id_fkey(name),
          credit_account:accounts!transactions_credit_account_id_fkey(name),
          users(username)
        `)
        .eq('created_by', user.id)
        .order('transaction_date', { ascending: false })
        .order('id', { ascending: false });

      // Fetch transactions that reference transactions created by this employee
      const { data: referencedTransactions } = await supabase
        .from('transactions')
        .select(`
          id,
          transaction_date,
          description,
          amount,
          payment_status,
          reference_transaction_ids,
          misc_vendor_name,
          misc_customer_name,
          debit_account:accounts!transactions_debit_account_id_fkey(name),
          credit_account:accounts!transactions_credit_account_id_fkey(name),
          users(username)
        `)
        .overlaps('reference_transaction_ids', createdTransactions?.map(t => t.id) || [])
        .neq('created_by', user.id)
        .order('transaction_date', { ascending: false })
        .order('id', { ascending: false });

      // Combine and format the data
      const allTransactions: Transaction[] = [
        ...(createdTransactions || []).map(t => ({
          id: t.id,
          transaction_date: t.transaction_date,
          description: t.description,
          amount: t.amount,
          payment_status: t.payment_status,
          debit_account: t.debit_account?.name || '',
          credit_account: t.credit_account?.name || '',
          misc_vendor_name: t.misc_vendor_name,
          misc_customer_name: t.misc_customer_name,
          username: t.users?.username,
          reference_transaction_ids: t.reference_transaction_ids,
          created_by_me: true
        })),
        ...(referencedTransactions || []).map(t => ({
          id: t.id,
          transaction_date: t.transaction_date,
          description: t.description,
          amount: t.amount,
          payment_status: t.payment_status,
          debit_account: t.debit_account?.name || '',
          credit_account: t.credit_account?.name || '',
          misc_vendor_name: t.misc_vendor_name,
          misc_customer_name: t.misc_customer_name,
          username: t.users?.username,
          reference_transaction_ids: t.reference_transaction_ids,
          created_by_me: false
        }))
      ];

      // Remove duplicates and sort by date
      const uniqueTransactions = allTransactions.filter((transaction, index, self) =>
        index === self.findIndex(t => t.id === transaction.id)
      ).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

      setTransactions(uniqueTransactions);
    } catch (error) {
      console.error('Error fetching employee transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'unpaid':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">My Transactions</h1>
      </div>

      <div className="grid gap-4">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">No transactions found.</p>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Transaction #{transaction.id}
                    {transaction.created_by_me ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Created by me
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Referenced
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.transaction_date)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <Badge variant={getStatusBadgeVariant(transaction.payment_status)}>
                      {transaction.payment_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Debit Account</p>
                    <p className="text-sm text-gray-600">{transaction.debit_account}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Credit Account</p>
                    <p className="text-sm text-gray-600">{transaction.credit_account}</p>
                  </div>
                  {transaction.username && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">User</p>
                      <p className="text-sm text-gray-600">{transaction.username}</p>
                    </div>
                  )}
                  {transaction.misc_vendor_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Vendor</p>
                      <p className="text-sm text-gray-600">{transaction.misc_vendor_name}</p>
                    </div>
                  )}
                  {transaction.misc_customer_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Customer</p>
                      <p className="text-sm text-gray-600">{transaction.misc_customer_name}</p>
                    </div>
                  )}
                  {transaction.reference_transaction_ids && transaction.reference_transaction_ids.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reference Transaction IDs</p>
                      <p className="text-sm text-gray-600">
                        {transaction.reference_transaction_ids.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
