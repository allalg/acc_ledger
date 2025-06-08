
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BankStatement = () => {
  // Mock bank statement data
  const transactions = [
    { id: 1, date: "2024-06-07", description: "Customer Payment - ABC Corp", amount: 15000, type: "credit", balance: 125000 },
    { id: 2, date: "2024-06-06", description: "Office Rent Payment", amount: -2500, type: "debit", balance: 110000 },
    { id: 3, date: "2024-06-05", description: "Sales Revenue - XYZ Inc", amount: 8500, type: "credit", balance: 112500 },
    { id: 4, date: "2024-06-04", description: "Supplier Payment - Tech Equipment", amount: -12000, type: "debit", balance: 104000 },
    { id: 5, date: "2024-06-03", description: "Interest Income", amount: 150, type: "credit", balance: 116000 },
    { id: 6, date: "2024-06-02", description: "Utility Bills", amount: -850, type: "debit", balance: 115850 },
    { id: 7, date: "2024-06-01", description: "Beginning Balance", amount: 116700, type: "credit", balance: 116700 },
  ];

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Bank statement has been saved to PDF successfully.",
    });
    console.log("Saving bank statement to PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bank Statement</h1>
              <p className="text-gray-600">Current month bank transaction summary</p>
            </div>
          </div>
          <Button onClick={handleSaveToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Save to PDF
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle className="text-xl">Bank Statement - June 2024</CardTitle>
              <p className="text-gray-600 mt-1">Account: Business Checking (****1234)</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600">$125,000.00</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{transaction.date}</td>
                      <td className="py-3 px-4 text-gray-900">{transaction.description}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        ${transaction.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Credits</p>
                  <p className="text-lg font-semibold text-green-600">+$23,650</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Debits</p>
                  <p className="text-lg font-semibold text-red-600">-$15,350</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Net Change</p>
                  <p className="text-lg font-semibold text-blue-600">+$8,300</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankStatement;
