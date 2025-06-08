
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LedgerDetailProps {
  ledger: {
    id: number;
    account: string;
    balance: number;
    type: string;
  };
  onClose: () => void;
}

const LedgerDetail = ({ ledger, onClose }: LedgerDetailProps) => {
  // Mock detailed ledger transactions
  const transactions = [
    { date: "2024-01-15", description: "Opening Balance", debit: 0, credit: 10000, balance: 10000 },
    { date: "2024-01-16", description: "Cash Sale", debit: 5000, credit: 0, balance: 15000 },
    { date: "2024-01-17", description: "Purchase Payment", debit: 0, credit: 2000, balance: 13000 },
    { date: "2024-01-18", description: "Service Revenue", debit: 3000, credit: 0, balance: 16000 },
    { date: "2024-01-19", description: "Utility Payment", debit: 0, credit: 500, balance: 15500 },
    { date: "2024-01-20", description: "Customer Payment", debit: 7500, credit: 0, balance: 23000 },
    { date: "2024-01-21", description: "Rent Payment", debit: 0, credit: 2000, balance: 21000 },
    { date: "2024-01-22", description: "Sales Revenue", debit: 4000, credit: 0, balance: 25000 },
    { date: "2024-01-23", description: "Office Supplies", debit: 0, credit: 300, balance: 24700 },
    { date: "2024-01-24", description: "Bank Interest", debit: 50, credit: 0, balance: 24750 },
    { date: "2024-01-25", description: "Equipment Purchase", debit: 0, credit: 8000, balance: 16750 },
    { date: "2024-01-26", description: "Consulting Revenue", debit: 6000, credit: 0, balance: 22750 },
    { date: "2024-01-27", description: "Insurance Payment", debit: 0, credit: 1200, balance: 21550 },
    { date: "2024-01-28", description: "Product Sales", debit: 8500, credit: 0, balance: 30050 },
    { date: "2024-01-29", description: "Marketing Expense", debit: 0, credit: 1500, balance: 28550 },
    { date: "2024-01-30", description: "Month End Balance", debit: 0, credit: 0, balance: 28550 },
  ];

  const handleSaveToPDF = () => {
    toast({
      title: "PDF Generated",
      description: `${ledger.account} ledger has been saved to PDF successfully.`,
    });
    console.log(`Saving ${ledger.account} ledger to PDF...`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {ledger.account} - Ledger Details
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Account Type: <span className="font-medium">{ledger.type}</span> | 
              Current Balance: <span className={`font-bold ${ledger.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(ledger.balance).toLocaleString()}
              </span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[calc(90vh-140px)] w-full">
            <div className="p-6">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead className="min-w-64">Description</TableHead>
                    <TableHead className="w-32 text-right">Debit</TableHead>
                    <TableHead className="w-32 text-right">Credit</TableHead>
                    <TableHead className="w-32 text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right">
                        {transaction.debit > 0 ? `$${transaction.debit.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.credit > 0 ? `$${transaction.credit.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${transaction.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
        
        <div className="border-t p-4 flex justify-center">
          <Button onClick={handleSaveToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Save to PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LedgerDetail;
