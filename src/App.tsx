
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Ledgers from "./pages/Ledgers";
import BankStatement from "./pages/BankStatement";
import ProfitLoss from "./pages/ProfitLoss";
import BalanceSheet from "./pages/BalanceSheet";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const userRole = user?.user_metadata?.role;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="flex-1">
                <Routes>
                  {userRole === 'employee' ? (
                    <>
                      <Route path="/dashboard" element={<EmployeeDashboard />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </>
                  ) : (
                    <>
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/ledgers" element={<Ledgers />} />
                      <Route path="/bank-statement" element={<BankStatement />} />
                      <Route path="/profit-loss" element={<ProfitLoss />} />
                      <Route path="/balance-sheet" element={<BalanceSheet />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/vendors" element={<Vendors />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </>
                  )}
                </Routes>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
