
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2 } from "lucide-react";

interface Account {
  id: number;
  name: string;
}

interface User {
  user_id: string;
  username: string;
  role: string;
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
}

interface TransactionItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
}

const AddTransactionForm = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    debit_account_id: '',
    credit_account_id: '',
    user_id: '',
    misc_vendor_name: '',
    misc_customer_name: ''
  });

  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [showInventoryItems, setShowInventoryItems] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    const isInventoryTransaction = formData.debit_account_id === '4' || formData.credit_account_id === '4';
    setShowInventoryItems(isInventoryTransaction);
    if (!isInventoryTransaction) {
      setTransactionItems([]);
    }
  }, [formData.debit_account_id, formData.credit_account_id]);

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('id, name')
      .order('name');
    setAccounts(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('user_id, username, role')
      .order('username');
    setUsers(data || []);
  };

  const fetchInventoryItems = async () => {
    const { data } = await supabase
      .from('inventory_items')
      .select('id, name, sku, cost_price, sale_price, current_stock')
      .order('name');
    setInventoryItems(data || []);
  };

  const addTransactionItem = () => {
    setTransactionItems([...transactionItems, {
      item_id: 0,
      quantity: 0,
      unit_price: 0,
      discount: 0
    }]);
  };

  const removeTransactionItem = (index: number) => {
    setTransactionItems(transactionItems.filter((_, i) => i !== index));
  };

  const updateTransactionItem = (index: number, field: keyof TransactionItem, value: number) => {
    const updated = [...transactionItems];
    updated[index] = { ...updated[index], [field]: value };
    setTransactionItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.amount || !formData.debit_account_id || !formData.credit_account_id) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Insert transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          transaction_date: formData.transaction_date,
          description: formData.description,
          amount: parseFloat(formData.amount),
          debit_account_id: parseInt(formData.debit_account_id),
          credit_account_id: parseInt(formData.credit_account_id),
          user_id: formData.user_id || null,
          misc_vendor_name: formData.misc_vendor_name || null,
          misc_customer_name: formData.misc_customer_name || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Insert transaction items if inventory is involved
      if (showInventoryItems && transactionItems.length > 0) {
        const itemsToInsert = transactionItems.map(item => ({
          transaction_id: transaction.id,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount
          // Remove gross_amount and total_amount - let the database handle these
        }));

        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });

      // Reset form
      setFormData({
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        debit_account_id: '',
        credit_account_id: '',
        user_id: '',
        misc_vendor_name: '',
        misc_customer_name: ''
      });
      setTransactionItems([]);

    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Transaction Date</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debit_account">Debit Account</Label>
              <Select value={formData.debit_account_id} onValueChange={(value) => setFormData({...formData, debit_account_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select debit account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_account">Credit Account</Label>
              <Select value={formData.credit_account_id} onValueChange={(value) => setFormData({...formData, credit_account_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credit account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">User (Optional)</Label>
              <Select value={formData.user_id} onValueChange={(value) => setFormData({...formData, user_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.username} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="misc_vendor_name">Misc Vendor Name</Label>
              <Input
                id="misc_vendor_name"
                placeholder="Enter vendor name"
                value={formData.misc_vendor_name}
                onChange={(e) => setFormData({...formData, misc_vendor_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="misc_customer_name">Misc Customer Name</Label>
              <Input
                id="misc_customer_name"
                placeholder="Enter customer name"
                value={formData.misc_customer_name}
                onChange={(e) => setFormData({...formData, misc_customer_name: e.target.value})}
              />
            </div>
          </div>

          {showInventoryItems && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Transaction Items (Inventory)</Label>
                <Button type="button" onClick={addTransactionItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {transactionItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Inventory Item</Label>
                      <Select 
                        value={item.item_id.toString()} 
                        onValueChange={(value) => updateTransactionItem(index, 'item_id', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((invItem) => (
                            <SelectItem key={invItem.id} value={invItem.id.toString()}>
                              {invItem.name} ({invItem.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateTransactionItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateTransactionItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateTransactionItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        />
                        <Button 
                          type="button" 
                          onClick={() => removeTransactionItem(index)}
                          variant="outline" 
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding Transaction..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTransactionForm;
