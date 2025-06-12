
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useLowStockWarnings } from "@/hooks/useLowStockWarnings";

const LowStockWarnings = () => {
  const { lowStockItems, loading } = useLowStockWarnings();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Inventory Warnings</h3>
      {lowStockItems.map((item) => (
        <Alert key={item.id} variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-red-800">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-red-700">
            <strong>{item.name}</strong> (SKU: {item.sku}) has only {item.current_stock} units remaining in stock.
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default LowStockWarnings;
