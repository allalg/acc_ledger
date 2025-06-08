
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LedgerDetail from "@/components/LedgerDetail";

const Ledgers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLedger, setSelectedLedger] = useState<any>(null);
  
  // Mock ledger data
  const ledgers = [
    { id: 1, account: "Cash Account", balance: 25000, type: "Asset" },
    { id: 2, account: "Accounts Receivable", balance: 75000, type: "Asset" },
    { id: 3, account: "Inventory", balance: 48000, type: "Asset" },
    { id: 4, account: "Accounts Payable", balance: -32000, type: "Liability" },
    { id: 5, account: "Sales Revenue", balance: -180000, type: "Revenue" },
    { id: 6, account: "Cost of Goods Sold", balance: 95000, type: "Expense" },
  ];

  const filteredLedgers = ledgers.filter(ledger =>
    ledger.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Ledger report has been saved to PDF successfully.",
    });
    console.log("Saving ledgers to PDF...");
  };

  const handleLedgerClick = (ledger: any) => {
    setSelectedLedger(ledger);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ledgers</h1>
              <p className="text-gray-600">Search and view ledger accounts</p>
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
                placeholder="Search ledger accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ledger Display */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Ledger Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Account Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedgers.map((ledger) => (
                    <tr 
                      key={ledger.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleLedgerClick(ledger)}
                    >
                      <td className="py-3 px-4 text-gray-900 hover:text-blue-600">{ledger.account}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ledger.type === 'Asset' ? 'bg-blue-100 text-blue-800' :
                          ledger.type === 'Liability' ? 'bg-red-100 text-red-800' :
                          ledger.type === 'Revenue' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ledger.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        ledger.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${Math.abs(ledger.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Detail Modal */}
      {selectedLedger && (
        <LedgerDetail 
          ledger={selectedLedger} 
          onClose={() => setSelectedLedger(null)} 
        />
      )}
    </div>
  );
};

export default Ledgers;
