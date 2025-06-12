
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useLowStockWarnings } from "@/hooks/useLowStockWarnings";

const LowStockWarnings = () => {
  const { lowStockItems, loading } = useLowStockWarnings();

  console.log('LowStockWarnings render:', { lowStockItems, loading });

  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (lowStockItems.length === 0) {
    console.log('No low stock items found, hiding component');
    return (
      <div className="mb-4">
        <p className="text-sm text-gray-600">No low stock warnings at this time.</p>
      </div>
    );
  }

  console.log('Rendering low stock warnings for items:', lowStockItems);

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
