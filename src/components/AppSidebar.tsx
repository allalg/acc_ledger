
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Users, Truck, FileText, LogOut, BookOpen, PieChart, DollarSign, CreditCard, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: PieChart,
  },
  {
    title: "Ledgers",
    url: "/ledgers",
    icon: BookOpen,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Vendors",
    url: "/vendors",
    icon: Truck,
  },
];

const employeeMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Plus,
  },
];

const statementItems = [
  {
    title: "Bank Statement",
    url: "/bank-statement",
    icon: CreditCard,
  },
  {
    title: "Profit and Loss Statement",
    url: "/profit-loss",
    icon: DollarSign,
  },
  {
    title: "Balance Sheet",
    url: "/balance-sheet",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const userRole = user?.user_metadata?.role;

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = userRole === 'employee' ? employeeMenuItems : adminMenuItems;

  return (
    <Sidebar className="border-r border-green-200 bg-white">
      <SidebarHeader className="p-6 border-b border-green-200">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/83d7f3c9-e326-4199-b20a-8b48f7d64bf5.png" 
            alt="Acco Sight Logo" 
            className="h-8 w-auto"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Acco Sight</h2>
            <p className="text-sm text-green-600">
              {userRole === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-green-700 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-green-50">
                      <item.icon className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupContent>
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Statements</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-green-600" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 ml-8">
                  <SidebarMenu>
                    {statementItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm hover:bg-green-50">
                            <item.icon className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-green-200">
        <div className="text-xs text-gray-600 mb-2">
          Logged in as: {user?.user_metadata?.username}
        </div>
        <Button 
          onClick={handleSignOut}
          variant="outline" 
          className="w-full flex items-center gap-2 text-gray-700 hover:text-red-600 hover:border-red-600 border-green-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
