
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProfitLoss = () => {
  // Mock P&L data
  const revenue = [
    { account: "Sales Revenue", amount: 180000 },
    { account: "Service Revenue", amount: 25000 },
    { account: "Interest Income", amount: 1200 },
  ];

  const expenses = [
    { account: "Cost of Goods Sold", amount: 95000 },
    { account: "Salaries & Wages", amount: 45000 },
    { account: "Rent Expense", amount: 12000 },
    { account: "Utilities", amount: 3200 },
    { account: "Marketing", amount: 8500 },
    { account: "Professional Services", amount: 4200 },
    { account: "Insurance", amount: 2800 },
    { account: "Depreciation", amount: 5500 },
  ];

  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Profit & Loss statement has been saved to PDF successfully.",
    });
    console.log("Saving P&L statement to PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
              <p className="text-gray-600">Financial performance summary</p>
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
          <CardHeader>
            <CardTitle className="text-xl">Profit & Loss Statement</CardTitle>
            <p className="text-gray-600">For the Month Ended June 30, 2024</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
              <div className="space-y-2">
                {revenue.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="text-gray-700">{item.account}</span>
                    <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total Revenue</span>
                    <span className="text-green-600">${totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
              <div className="space-y-2">
                {expenses.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="text-gray-700">{item.account}</span>
                    <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total Expenses</span>
                    <span className="text-red-600">${totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Net Income</h3>
                <span className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(netIncome).toLocaleString()}
                  {netIncome < 0 && ' (Loss)'}
                </span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Gross Profit Margin</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {((totalRevenue - 95000) / totalRevenue * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Operating Margin</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {(netIncome / totalRevenue * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Expense Ratio</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {(totalExpenses / totalRevenue * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfitLoss;
