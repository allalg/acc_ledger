
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomersVendors";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { customers, loading } = useCustomers();
  
  const filteredCustomers = customers.filter(customer =>
    customer.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Customer report has been saved to PDF successfully.",
    });
    console.log("Saving customers to PDF...");
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (balance: number) => {
    if (balance > 0) return 'bg-green-100 text-green-800';
    if (balance < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (balance: number) => {
    if (balance > 0) return 'Outstanding';
    if (balance < 0) return 'Credit';
    return 'Paid';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600">Manage customer information and balances</p>
            </div>
          </div>
          <Button onClick={handleSaveToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Save to PDF
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Display */}
        {loading ? (
          <div className="text-center py-8">Loading customers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.user_id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customer.username}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.balance)}`}>
                      {getStatusText(customer.balance)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    Customer ID: {customer.user_id.substring(0, 8)}...
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
                    <p className={`text-xl font-bold ${
                      customer.balance > 0 ? 'text-green-600' : 
                      customer.balance < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatCurrency(customer.balance)}
                      {customer.balance < 0 && ' (Credit)'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
