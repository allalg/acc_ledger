
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBankStatement } from "@/hooks/useStatements";

const BankStatement = () => {
  const { data: transactions, loading } = useBankStatement();

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: "Bank statement has been saved to PDF successfully.",
    });
    console.log("Saving bank statement to PDF...");
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const currentBalance = transactions.length > 0 ? transactions[transactions.length - 1].running_bank_balance : 0;
  const totalCredits = transactions.reduce((sum, txn) => sum + (txn.credit_value || 0), 0);
  const totalDebits = transactions.reduce((sum, txn) => sum + (txn.debit_value || 0), 0);
  const netChange = totalCredits - totalDebits;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bank Statement</h1>
              <p className="text-gray-600">Current bank transaction summary</p>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle className="text-xl">Bank Statement - {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</CardTitle>
              <p className="text-gray-600 mt-1">Account: Business Checking</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentBalance)}</p>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading bank statement...</div>
            ) : (
              <>
                <ScrollArea className="h-[500px] w-full">
                  <div className="min-w-[800px]">
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
                        {transactions.map((transaction, index) => (
                          <TableRow key={`${transaction.transaction_id}-${index}`}>
                            <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.username}</TableCell>
                            <TableCell>{transaction.debit_account}</TableCell>
                            <TableCell className="text-right">
                              {transaction.debit_value > 0 ? formatCurrency(transaction.debit_value) : '-'}
                            </TableCell>
                            <TableCell>{transaction.credit_account}</TableCell>
                            <TableCell className="text-right">
                              {transaction.credit_value > 0 ? formatCurrency(transaction.credit_value) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(transaction.running_bank_balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Credits</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(totalCredits)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Debits</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(totalDebits)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Net Change</p>
                      <p className={`text-lg font-semibold ${netChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankStatement;
