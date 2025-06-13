
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReversalRequests } from '@/hooks/useReversalRequests';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const AdminReversalRequests = () => {
  const { requests, loading, updateReversalRequestStatus } = useReversalRequests();
  const { toast } = useToast();

  const handleApprove = async (requestId: string) => {
    try {
      await updateReversalRequestStatus(requestId, 'approved');
      toast({
        title: "Request Approved",
        description: "Transaction reversal has been processed successfully.",
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve reversal request.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await updateReversalRequestStatus(requestId, 'rejected');
      toast({
        title: "Request Rejected",
        description: "Transaction reversal request has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject reversal request.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5" />
            Transaction Reversal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <AlertTriangle className="h-5 w-5" />
          Transaction Reversal Requests ({requests.filter(r => r.status === 'pending').length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No reversal requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        Transaction #{request.transaction_id}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Description:</strong> {request.transaction_description}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Amount:</strong> {formatCurrency(request.transaction_amount || 0)}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Requested by:</strong> {request.requester_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested on: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {request.status !== 'pending' && request.reviewed_at && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {request.status === 'approved' ? 'Approved' : 'Rejected'} on: {new Date(request.reviewed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminReversalRequests;
