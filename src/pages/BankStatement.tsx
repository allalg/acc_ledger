import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBankStatement } from "@/hooks/useStatements";
import { supabase } from "@/integrations/supabase/client";

const BankStatement = () => {
  const { data: bankData, loading } = useBankStatement();

  const handleSaveToPDF = async () => {
    try {
      if (!bankData || bankData.length === 0) {
        toast({
          title: "No Data",
          description: "No bank statement data available to export.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('save-ledger-pdf', {
        body: {
          ledgerData: bankData,
          ledgerType: "Bank Statement",
          filename: `bank-statement-${new Date().toISOString().split('T')[0]}`
        }
      });

      if (error) throw error;

      // Create and download the file
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bank-statement-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Bank statement has been saved successfully.",
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

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return '-';
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bank Statement</h1>
              <p className="text-gray-600">View bank account transactions</p>
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
            <CardTitle className="text-xl">Bank Account Statement</CardTitle>
            <p className="text-gray-600">As of {new Date().toLocaleDateString('en-IN')}</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading bank statement...</div>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="min-w-[1000px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Debit Account</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead>Credit Account</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankData.map((transaction, index) => (
                        <TableRow key={`${transaction.transaction_id}-${index}`}>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.username}</TableCell>
                          <TableCell>{transaction.debit_account}</TableCell>
                          <TableCell className="text-right">
                            {transaction.debit_value ? formatCurrency(transaction.debit_value) : '-'}
                          </TableCell>
                          <TableCell>{transaction.credit_account}</TableCell>
                          <TableCell className="text-right">
                            {transaction.credit_value ? formatCurrency(transaction.credit_value) : '-'}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${
                            transaction.running_bank_balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(transaction.running_bank_balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
            
            {!loading && bankData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bank transactions found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankStatement;
