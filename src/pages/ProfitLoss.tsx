import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfitLossStatement } from "@/hooks/useStatements";
import { supabase } from "@/integrations/supabase/client";

const ProfitLoss = () => {
  const { data: statementData, loading } = useProfitLossStatement();

  const handleSaveToPDF = async () => {
    try {
      if (!statementData || statementData.length === 0) {
        toast({
          title: "No Data",
          description: "No profit & loss data available to export.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('save-ledger-pdf', {
        body: {
          ledgerData: statementData,
          ledgerType: "Profit & Loss Statement",
          filename: `profit-loss-statement-${new Date().toISOString().split('T')[0]}`
        }
      });

      if (error) throw error;

      // Create and download the file
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profit-loss-statement-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Profit & Loss statement has been saved successfully.",
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

  const netProfitLoss = statementData.find(item => item.item === 'Net Profit/Loss');
  const profitStatus = statementData.find(item => item.item === 'Profit Status');

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
            <p className="text-gray-600">For the Period Ended {new Date().toLocaleDateString('en-IN')}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading profit & loss statement...</div>
            ) : (
              <>
                <ScrollArea className="h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2">Item</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statementData.map((item, index) => (
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

                {/* Summary */}
                {netProfitLoss && profitStatus && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Financial Summary</h4>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Net Result</p>
                      <p className={`text-3xl font-bold ${getRowColor(netProfitLoss.item, netProfitLoss.value)}`}>
                        {formatCurrency(netProfitLoss.value)}
                      </p>
                      <p className={`text-lg font-medium mt-2 ${getRowColor(profitStatus.item, profitStatus.value)}`}>
                        {profitStatus.value}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {!loading && statementData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No profit & loss data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfitLoss;
