
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLedgerData } from "@/hooks/useLedgerData";
import { supabase } from "@/integrations/supabase/client";

const Ledgers = () => {
  const [selectedLedger, setSelectedLedger] = useState<string>("accounts-receivable");
  
  const ledgerOptions = [
    { value: "accounts-receivable", label: "Accounts Receivable A/c" },
    { value: "accounts-payable", label: "Accounts Payable A/c" },
    { value: "sales", label: "Sales A/c" },
    { value: "purchases", label: "Purchases A/c" },
  ];

  const { data: ledgerData, loading } = useLedgerData(selectedLedger);

  const handleSaveToPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('save-ledger-pdf', {
        body: {
          ledgerData,
          ledgerType: ledgerOptions.find(opt => opt.value === selectedLedger)?.label,
          filename: `${selectedLedger}-ledger-${new Date().toISOString().split('T')[0]}`
        }
      });

      if (error) throw error;

      toast({
        title: "PDF Generated",
        description: "Ledger report has been saved to PDF successfully.",
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
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ledgers</h1>
              <p className="text-gray-600">View detailed ledger accounts</p>
            </div>
          </div>
          <Button onClick={handleSaveToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Save to PDF
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ledger Selection */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-2 flex-wrap">
              {ledgerOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedLedger === option.value ? "default" : "outline"}
                  onClick={() => setSelectedLedger(option.value)}
                  className="mb-2"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ledger Display */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>
              {ledgerOptions.find(opt => opt.value === selectedLedger)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading ledger data...</div>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="min-w-[1200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Username</TableHead>
                        {selectedLedger === 'sales' || selectedLedger === 'purchases' ? (
                          <>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Total</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Debit Account</TableHead>
                            <TableHead>Debit</TableHead>
                            <TableHead>Credit Account</TableHead>
                            <TableHead>Credit</TableHead>
                          </>
                        )}
                        <TableHead className="text-right">Running Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerData.map((transaction, index) => (
                        <TableRow key={`${transaction.transaction_id}-${index}`}>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.username}</TableCell>
                          {selectedLedger === 'sales' || selectedLedger === 'purchases' ? (
                            <>
                              <TableCell>{transaction.item_name}</TableCell>
                              <TableCell>{transaction.quantity}</TableCell>
                              <TableCell>{transaction.unit_price ? formatCurrency(transaction.unit_price) : '-'}</TableCell>
                              <TableCell>{transaction.discount ? formatCurrency(transaction.discount) : '-'}</TableCell>
                              <TableCell>{transaction.line_total ? formatCurrency(transaction.line_total) : '-'}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{transaction.debit_account}</TableCell>
                              <TableCell>{(transaction.debit_val || transaction.debit_value) ? formatCurrency(transaction.debit_val || transaction.debit_value || 0) : '-'}</TableCell>
                              <TableCell>{transaction.credit_account}</TableCell>
                              <TableCell>{(transaction.credit_val || transaction.credit_value) ? formatCurrency(transaction.credit_val || transaction.credit_value || 0) : '-'}</TableCell>
                            </>
                          )}
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(transaction.running_balance || transaction.running_inventory_balance || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ledgers;
