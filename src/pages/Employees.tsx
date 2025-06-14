
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Employees = () => {
  const [timePeriod, setTimePeriod] = useState("month");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: transactionStats, isLoading: statsLoading } = useQuery({
    queryKey: ['employee-transaction-stats', timePeriod, customDateFrom, customDateTo],
    queryFn: async () => {
      let dateFilter = '';
      const now = new Date();
      
      if (timePeriod === 'day') {
        dateFilter = `AND transaction_date >= '${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}'`;
      } else if (timePeriod === 'month') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = `AND transaction_date >= '${firstDayOfMonth.toISOString()}'`;
      } else if (timePeriod === 'year') {
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = `AND transaction_date >= '${firstDayOfYear.toISOString()}'`;
      } else if (timePeriod === 'custom' && customDateFrom && customDateTo) {
        dateFilter = `AND transaction_date >= '${customDateFrom.toISOString()}' AND transaction_date <= '${customDateTo.toISOString()}'`;
      }

      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT 
            e.id,
            e.name,
            COUNT(t.id) as transaction_count
          FROM employees e
          LEFT JOIN transactions t ON t.created_by = e.id ${dateFilter}
          GROUP BY e.id, e.name
          ORDER BY transaction_count DESC
        `
      });

      if (error) throw error;
      return (data as any)?.result || [];
    }
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['employee-chart-data'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT 
            e.name,
            COUNT(CASE WHEN t.transaction_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days,
            COUNT(CASE WHEN t.transaction_date >= CURRENT_DATE - INTERVAL '12 months' THEN 1 END) as last_12_months,
            COUNT(t.id) as all_time
          FROM employees e
          LEFT JOIN transactions t ON t.created_by = e.id
          GROUP BY e.id, e.name
          ORDER BY all_time DESC
        `
      });

      if (error) throw error;
      return (data as any)?.result || [];
    }
  });

  const chartConfig = {
    last_30_days: {
      label: "Last 30 Days",
      color: "#22c55e",
    },
    last_12_months: {
      label: "Last 12 Months", 
      color: "#3b82f6",
    },
    all_time: {
      label: "All Time",
      color: "#f59e0b",
    },
  };

  if (employeesLoading || statsLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Employee Performance</h1>
        <div className="flex gap-4 items-center">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>

          {timePeriod === 'custom' && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateFrom ? format(customDateFrom, "PP") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateFrom}
                    onSelect={setCustomDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateTo ? format(customDateTo, "PP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateTo}
                    onSelect={setCustomDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Transaction Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="last_30_days" fill="var(--color-last_30_days)" />
                <Bar dataKey="last_12_months" fill="var(--color-last_12_months)" />
                <Bar dataKey="all_time" fill="var(--color-all_time)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Employee Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {transactionStats?.map((employee: any) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{employee.name}</CardTitle>
              <p className="text-sm text-gray-500">ID: {employee.id}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Transactions:</span>
                  <span className="text-lg font-bold text-green-600">
                    {employee.transaction_count}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {timePeriod === 'day' && 'Today'}
                  {timePeriod === 'month' && 'This Month'}
                  {timePeriod === 'year' && 'This Year'}
                  {timePeriod === 'custom' && customDateFrom && customDateTo && 
                    `${format(customDateFrom, "MMM dd")} - ${format(customDateTo, "MMM dd")}`
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Employees;
