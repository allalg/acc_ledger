
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Ledgers from "./pages/Ledgers";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import BankStatement from "./pages/BankStatement";
import ProfitLoss from "./pages/ProfitLoss";
import BalanceSheet from "./pages/BalanceSheet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <Index />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="/ledgers" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <Ledgers />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="/customers" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <Customers />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="/vendors" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <Customers />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="/bank-statement" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <BankStatement />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="/profit-loss" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <ProfitLoss />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="/balance-sheet" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gray-50">
                <AppSidebar />
                <main className="flex-1">
                  <BalanceSheet />
                </main>
              </div>
            </SidebarProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
