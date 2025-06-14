
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReversalRequests } from "@/hooks/useReversalRequests";
import { CheckCircle, XCircle, Clock, ArrowLeft, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PreviousReversalRequests = () => {
  const { requests, loading } = useReversalRequests();
  const navigate = useNavigate();

  // Filter to only show approved and rejected requests
  const previousRequests = requests.filter(request => request.status !== 'pending');

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
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <div className="border-b border-green-200 bg-white">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Previous Reversal Requests</h1>
            <p className="text-green-600">View all previously processed reversal requests</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <History className="h-5 w-5" />
              Previous Reversal Requests ({previousRequests.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : previousRequests.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No previous reversal requests found.</p>
            ) : (
              <div className="space-y-4">
                {previousRequests.map((request) => (
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
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-gray-500">
                            Requested on: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                          {request.reviewed_at && (
                            <p className="text-xs text-gray-500">
                              {request.status === 'approved' ? 'Approved' : 'Rejected'} on: {new Date(request.reviewed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviousReversalRequests;
