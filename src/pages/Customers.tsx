
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock customer data
  const customers = [
    { 
      id: 1, 
      name: "ABC Corporation", 
      email: "contact@abc-corp.com", 
      phone: "+1 (555) 123-4567",
      balance: 15000, 
      status: "Active" 
    },
    { 
      id: 2, 
      name: "XYZ Industries", 
      email: "billing@xyz-ind.com", 
      phone: "+1 (555) 234-5678",
      balance: -2500, 
      status: "Outstanding" 
    },
    { 
      id: 3, 
      name: "Global Tech Solutions", 
      email: "accounts@globaltech.com", 
      phone: "+1 (555) 345-6789",
      balance: 8750, 
      status: "Active" 
    },
    { 
      id: 4, 
      name: "Metro Services Inc", 
      email: "finance@metro-services.com", 
      phone: "+1 (555) 456-7890",
      balance: 0, 
      status: "Paid" 
    },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Customer report has been saved to PDF successfully.",
    });
    console.log("Saving customers to PDF...");
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
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                    customer.status === 'Outstanding' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
                  <p className={`text-xl font-bold ${
                    customer.balance > 0 ? 'text-green-600' : 
                    customer.balance < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    ${Math.abs(customer.balance).toLocaleString()}
                    {customer.balance < 0 && ' (Credit)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Customers;
