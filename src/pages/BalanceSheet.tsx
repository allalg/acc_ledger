
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BalanceSheet = () => {
  // Mock balance sheet data
  const assets = {
    current: [
      { account: "Cash and Cash Equivalents", amount: 125000 },
      { account: "Accounts Receivable", amount: 75000 },
      { account: "Inventory", amount: 48000 },
      { account: "Prepaid Expenses", amount: 5000 },
    ],
    nonCurrent: [
      { account: "Property, Plant & Equipment", amount: 180000 },
      { account: "Less: Accumulated Depreciation", amount: -45000 },
      { account: "Intangible Assets", amount: 25000 },
    ]
  };

  const liabilities = {
    current: [
      { account: "Accounts Payable", amount: 32000 },
      { account: "Accrued Expenses", amount: 8500 },
      { account: "Short-term Debt", amount: 15000 },
    ],
    nonCurrent: [
      { account: "Long-term Debt", amount: 85000 },
      { account: "Deferred Tax Liability", amount: 12000 },
    ]
  };

  const equity = [
    { account: "Common Stock", amount: 100000 },
    { account: "Retained Earnings", amount: 160500 },
  ];

  const totalCurrentAssets = assets.current.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentAssets = assets.nonCurrent.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = liabilities.current.reduce((sum, item) => sum + item.amount, 0);
  const totalNonCurrentLiabilities = liabilities.nonCurrent.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Balance sheet has been saved to PDF successfully.",
    });
    console.log("Saving balance sheet to PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
              <p className="text-gray-600">Financial position statement</p>
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
            <CardTitle className="text-xl">Balance Sheet</CardTitle>
            <p className="text-gray-600">As of June 30, 2024</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Assets */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">ASSETS</h3>
              
              {/* Current Assets */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Current Assets</h4>
                <div className="space-y-2 ml-4">
                  {assets.current.map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.account}</span>
                      <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Current Assets</span>
                      <span className="text-blue-600">${totalCurrentAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Non-Current Assets */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Non-Current Assets</h4>
                <div className="space-y-2 ml-4">
                  {assets.nonCurrent.map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.account}</span>
                      <span className={`font-medium ${item.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.amount < 0 ? '(' : ''}${Math.abs(item.amount).toLocaleString()}{item.amount < 0 ? ')' : ''}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Non-Current Assets</span>
                      <span className="text-blue-600">${totalNonCurrentAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">TOTAL ASSETS</span>
                  <span className="text-blue-600">${totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">LIABILITIES & EQUITY</h3>
              
              {/* Current Liabilities */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Current Liabilities</h4>
                <div className="space-y-2 ml-4">
                  {liabilities.current.map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.account}</span>
                      <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Current Liabilities</span>
                      <span className="text-red-600">${totalCurrentLiabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Non-Current Liabilities */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Non-Current Liabilities</h4>
                <div className="space-y-2 ml-4">
                  {liabilities.nonCurrent.map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.account}</span>
                      <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Non-Current Liabilities</span>
                      <span className="text-red-600">${totalNonCurrentLiabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900">Total Liabilities</span>
                  <span className="text-red-600">${totalLiabilities.toLocaleString()}</span>
                </div>
              </div>

              {/* Equity */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Equity</h4>
                <div className="space-y-2 ml-4">
                  {equity.map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.account}</span>
                      <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total Equity</span>
                      <span className="text-green-600">${totalEquity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">TOTAL LIABILITIES & EQUITY</span>
                  <span className="text-blue-600">${(totalLiabilities + totalEquity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheet;
