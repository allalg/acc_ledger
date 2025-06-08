
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, Truck, Package, ShoppingCart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  // Mock data - in real app this would come from Supabase
  const netProfitLoss = 45000; // Positive = profit, negative = loss
  const bankBalance = 125000;
  
  const metrics = [
    { title: "Debtor Balance", value: "$75,000", icon: Users, trend: "up" },
    { title: "Creditor Balance", value: "$32,000", icon: Truck, trend: "down" },
    { title: "Total Sales", value: "$180,000", icon: ShoppingCart, trend: "up" },
    { title: "Total Purchases", value: "$95,000", icon: Package, trend: "up" },
    { title: "Total Inventory", value: "$48,000", icon: Package, trend: "stable" },
    { title: "Warnings", value: "3 Active", icon: AlertTriangle, trend: "warning" },
  ];

  const warnings = [
    { type: "Low Inventory", item: "Office Supplies", level: "Critical" },
    { type: "Bad Debt", item: "Customer ABC Inc", amount: "$5,000" },
    { type: "Low Inventory", item: "Raw Materials", level: "Warning" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-700">Net Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${netProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {netProfitLoss >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className={`text-3xl font-bold ${netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(netProfitLoss).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {netProfitLoss >= 0 ? 'Profit' : 'Loss'} this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-700">Bank Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${bankBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                  <DollarSign className={`h-6 w-6 ${bankBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${bankBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${Math.abs(bankBalance).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Current balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      metric.trend === 'warning' ? 'bg-yellow-100' : 
                      metric.trend === 'up' ? 'bg-green-100' : 
                      metric.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <metric.icon className={`h-5 w-5 ${
                        metric.trend === 'warning' ? 'text-yellow-600' : 
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                    {metric.trend === 'warning' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Alert
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  
                  {metric.title === "Warnings" && (
                    <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                      {warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-xs">
                          <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                          <span className="text-yellow-800">
                            {warning.type}: {warning.item}
                            {warning.level && ` (${warning.level})`}
                            {warning.amount && ` - ${warning.amount}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
