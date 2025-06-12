
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, Truck, Package, ShoppingCart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLowStockWarnings } from "@/hooks/useLowStockWarnings";

const Index = () => {
  const { data, loading } = useDashboardData();
  const { lowStockItems } = useLowStockWarnings();

  const staticWarnings = [
    { type: "Bad Debt", item: "Customer ABC Inc", amount: "₹5,000" },
  ];

  // Combine low stock warnings with static warnings
  const lowStockWarnings = lowStockItems.map(item => ({
    type: "Low Inventory",
    item: `${item.name} (SKU: ${item.sku})`,
    level: item.current_stock <= 5 ? "Critical" : "Warning",
    stock: item.current_stock
  }));

  const allWarnings = [...lowStockWarnings, ...staticWarnings];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    { 
      title: "Debtor Balance", 
      value: loading ? "Loading..." : formatCurrency(data.debtorBalance), 
      icon: Users, 
      trend: "up" 
    },
    { 
      title: "Creditor Balance", 
      value: loading ? "Loading..." : formatCurrency(data.creditorBalance), 
      icon: Truck, 
      trend: "down" 
    },
    { 
      title: "Total Sales", 
      value: loading ? "Loading..." : formatCurrency(data.totalSales), 
      icon: ShoppingCart, 
      trend: "up" 
    },
    { 
      title: "Total Purchases", 
      value: loading ? "Loading..." : formatCurrency(data.totalPurchases), 
      icon: Package, 
      trend: "up" 
    },
    { 
      title: "Total Inventory", 
      value: loading ? "Loading..." : formatCurrency(data.totalInventory), 
      icon: Package, 
      trend: "stable" 
    },
    { 
      title: "Warnings", 
      value: `${allWarnings.length} Active`, 
      icon: AlertTriangle, 
      trend: "warning" 
    },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      <div className="border-b border-green-200 bg-white">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-green-600">Welcome back! Here's your financial overview.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-700">Net Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${data.netProfitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {data.netProfitLoss >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className={`text-3xl font-bold ${data.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {loading ? "Loading..." : formatCurrency(Math.abs(data.netProfitLoss))}
                  </p>
                  <p className="text-sm text-gray-600">
                    {data.profitStatus} this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-700">Bank Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${data.bankBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <DollarSign className={`h-6 w-6 ${data.bankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${data.bankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {loading ? "Loading..." : formatCurrency(Math.abs(data.bankBalance))}
                  </p>
                  <p className="text-sm text-gray-600">Current balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow border-green-200">
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
                  <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                  
                  {metric.title === "Warnings" && (
                    <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                      {allWarnings.map((warning, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-2 rounded text-xs ${
                          warning.level === 'Critical' ? 'bg-red-50' : 'bg-yellow-50'
                        }`}>
                          <AlertCircle className={`h-3 w-3 flex-shrink-0 ${
                            warning.level === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                          <span className={warning.level === 'Critical' ? 'text-red-800' : 'text-yellow-800'}>
                            {warning.type}: {warning.item}
                            {warning.level && ` (${warning.level})`}
                            {warning.amount && ` - ${warning.amount}`}
                            {warning.stock !== undefined && ` - ${warning.stock} units left`}
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
