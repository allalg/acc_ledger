
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Mail, Phone, Building } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock vendor data
  const vendors = [
    { 
      id: 1, 
      name: "Office Supply Co", 
      email: "orders@officesupply.com", 
      phone: "+1 (555) 987-6543",
      category: "Office Supplies",
      balance: 5500, 
      status: "Active" 
    },
    { 
      id: 2, 
      name: "Tech Equipment Ltd", 
      email: "sales@techequip.com", 
      phone: "+1 (555) 876-5432",
      category: "Technology",
      balance: 12000, 
      status: "Outstanding" 
    },
    { 
      id: 3, 
      name: "Raw Materials Inc", 
      email: "billing@rawmaterials.com", 
      phone: "+1 (555) 765-4321",
      category: "Manufacturing",
      balance: 0, 
      status: "Paid" 
    },
    { 
      id: 4, 
      name: "Logistics Partners", 
      email: "accounts@logistics.com", 
      phone: "+1 (555) 654-3210",
      category: "Shipping",
      balance: 3200, 
      status: "Active" 
    },
  ];

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Vendor report has been saved to PDF successfully.",
    });
    console.log("Saving vendors to PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
              <p className="text-gray-600">Manage vendor information and payables</p>
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
                placeholder="Search vendors by name, email, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vendor Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vendor.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    vendor.status === 'Outstanding' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  {vendor.category}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {vendor.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {vendor.phone}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-1">Amount Payable</p>
                  <p className={`text-xl font-bold ${
                    vendor.balance > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    ${vendor.balance.toLocaleString()}
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

export default Vendors;
