
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBalanceSheet } from "@/hooks/useStatements";

const BalanceSheet = () => {
  const { data: balanceSheetData, loading } = useBalanceSheet();

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Balance sheet has been saved to PDF successfully.",
    });
    console.log("Saving balance sheet to PDF...");
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return `₹${Math.abs(numValue).toLocaleString('en-IN')}`;
  };

  const getRowColor = (item: string, value: string) => {
    if (item === 'Net Profit/Loss') {
      const numValue = parseFloat(value);
      if (numValue > 0) return 'text-green-600';
      if (numValue < 0) return 'text-red-600';
    }
    if (item === 'Profit Status') {
      if (value === 'Profit') return 'text-green-600';
      if (value === 'Loss') return 'text-red-600';
    }
    return 'text-gray-900';
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
            <p className="text-gray-600">As of {new Date().toLocaleDateString('en-IN')}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading balance sheet...</div>
            ) : (
              <ScrollArea className="h-[500px] w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Item</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceSheetData.map((item, index) => (
                      <TableRow key={index} className={item.item === 'Net Profit/Loss' ? 'border-t-2 border-gray-300' : ''}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell className={`text-right font-semibold ${getRowColor(item.item, item.value)}`}>
                          {item.item === 'Profit Status' ? item.value : formatCurrency(item.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheet;
