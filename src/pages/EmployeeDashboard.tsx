
import { SidebarTrigger } from "@/components/ui/sidebar";
import AddTransactionForm from "@/components/AddTransactionForm";

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-600">Add and manage transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AddTransactionForm />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
