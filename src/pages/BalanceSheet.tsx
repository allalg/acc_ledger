import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBalanceSheet } from "@/hooks/useStatements";
import { supabase } from "@/integrations/supabase/client";

const BalanceSheet = () => {
  const { data: balanceSheetData, loading } = useBalanceSheet();

  const handleSaveToPDF = async () => {
    try {
      if (!balanceSheetData || balanceSheetData.length === 0) {
        toast({
          title: "No Data",
          description: "No balance sheet data available to export.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('save-ledger-pdf', {
        body: {
          ledgerData: balanceSheetData,
          ledgerType: "Balance Sheet",
          filename: `balance-sheet-${new Date().toISOString().split('T')[0]}`
        }
      });

      if (error) throw error;

      // Create and download the file
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balance-sheet-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Balance sheet has been saved successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: string) => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return `₹${Math.abs(numValue).toLocaleString('en-IN')}`;
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
                      <TableRow key={index} className={
                        item.item.includes('ASSETS') || item.item.includes('LIABILITIES') || item.item.includes('EQUITY') 
                          ? 'bg-gray-50 font-bold' 
                          : item.item.includes('Total') 
                            ? 'border-t-2 border-gray-300 font-semibold' 
                            : ''
                      }>
                        <TableCell className={
                          item.item.includes('ASSETS') || item.item.includes('LIABILITIES') || item.item.includes('EQUITY')
                            ? 'font-bold text-gray-900'
                            : 'font-medium'
                        }>
                          {item.item}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
            
            {!loading && balanceSheetData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No balance sheet data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheet;
