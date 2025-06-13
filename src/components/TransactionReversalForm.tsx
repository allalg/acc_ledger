
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useReversalRequests } from '@/hooks/useReversalRequests';
import { Undo2 } from 'lucide-react';

const TransactionReversalForm = () => {
  const [transactionId, setTransactionId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createReversalRequest } = useReversalRequests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both transaction ID and reason for reversal.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReversalRequest(parseInt(transactionId), reason.trim());
      
      toast({
        title: "Reversal Request Submitted",
        description: "Your transaction reversal request has been submitted for admin approval.",
      });
      
      // Reset form
      setTransactionId('');
      setReason('');
    } catch (error) {
      console.error('Error submitting reversal request:', error);
      toast({
        title: "Error",
        description: "Failed to submit reversal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Undo2 className="h-5 w-5" />
          Request Transaction Reversal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <Input
              id="transactionId"
              type="number"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID to reverse"
              required
            />
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Reversal
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why this transaction needs to be reversed..."
              rows={3}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Reversal Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionReversalForm;
