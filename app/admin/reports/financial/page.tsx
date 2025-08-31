'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { 
  Download, TrendingUp, TrendingDown, DollarSign, Receipt, 
  BarChart3, LineChart, PieChart, FileText, Calendar,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, Line, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { getCategoryColor } from '@/lib/expenses/categories';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface PLStatement {
  period: string;
  revenue: {
    services: number;
    addOns: number;
    tips: number;
    other: number;
    total: number;
  };
  expenses: {
    categories: Record<string, number>;
    total: number;
  };
  netProfit: number;
  profitMargin: number;
}

interface TaxSummary {
  totalRevenue: number;
  deductibleExpenses: number;
  nonDeductibleExpenses: number;
  taxableIncome: number;
  estimatedTax: number;
  quarterlyPayments: Record<string, number>;
}

export default function FinancialReportsPage() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [plStatement, setPlStatement] = useState<PLStatement | null>(null);
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod, selectedYear]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        year: selectedYear.toString()
      });

      // Fetch multiple reports in parallel
      const [monthlyRes, categoryRes, plRes, taxRes] = await Promise.all([
        fetch(`/api/reports/monthly-trends?${params}`),
        fetch(`/api/reports/category-breakdown?${params}`),
        fetch(`/api/reports/pl-statement?${params}`),
        fetch(`/api/reports/tax-summary?${params}`)
      ]);

      const [monthly, category, pl, tax] = await Promise.all([
        monthlyRes.json(),
        categoryRes.json(),
        plRes.json(),
        taxRes.json()
      ]);

      setMonthlyData(monthly);
      setCategoryData(category);
      setPlStatement(pl);
      setTaxSummary(tax);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: 'pl' | 'tax' | 'full', format: 'pdf' | 'csv') => {
    try {
      const params = new URLSearchParams({
        type,
        format,
        period: selectedPeriod,
        year: selectedYear.toString()
      });

      const response = await fetch(`/api/reports/export?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Report exported successfully'
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="current_quarter">Current Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="current_year">Current Year</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pl">P&L Statement</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="tax">Tax Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${plStatement?.revenue.total.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${plStatement?.expenses.total.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +4.5% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                {plStatement && plStatement.netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${plStatement && plStatement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(plStatement?.netProfit || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +30.2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${plStatement && plStatement.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {plStatement?.profitMargin.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.4% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" strokeWidth={2} />
                  <Line type="monotone" dataKey="netProfit" stroke="#3B82F6" name="Net Profit" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${category.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pl" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Profit & Loss Statement</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => exportReport('pl', 'pdf')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={() => exportReport('pl', 'csv')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {plStatement && (
                <div className="space-y-6">
                  <div className="text-center pb-4 border-b">
                    <h3 className="font-semibold text-lg">Profit & Loss Statement</h3>
                    <p className="text-sm text-muted-foreground">{plStatement.period}</p>
                  </div>

                  {/* Revenue Section */}
                  <div>
                    <h4 className="font-semibold mb-3">Revenue</h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Service Revenue</span>
                        <span>${plStatement.revenue.services.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add-on Services</span>
                        <span>${plStatement.revenue.addOns.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tips</span>
                        <span>${plStatement.revenue.tips.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Income</span>
                        <span>${plStatement.revenue.other.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total Revenue</span>
                        <span>${plStatement.revenue.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h4 className="font-semibold mb-3">Operating Expenses</h4>
                    <div className="space-y-2 ml-4">
                      {Object.entries(plStatement.expenses.categories).map(([category, amount]) => (
                        <div key={category} className="flex justify-between">
                          <span>{category}</span>
                          <span>${amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total Expenses</span>
                        <span>${plStatement.expenses.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit Section */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Net Profit</span>
                      <span className={plStatement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(plStatement.netProfit).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Profit Margin</span>
                      <span className={plStatement.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {plStatement.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  <Bar dataKey="netProfit" fill="#3B82F6" name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="profitMargin" 
                    stroke="#8B5CF6" 
                    name="Profit Margin %" 
                    strokeWidth={2} 
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Tax Summary</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => exportReport('tax', 'pdf')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Tax Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {taxSummary && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Income Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Revenue</span>
                          <span>${taxSummary.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductible Expenses</span>
                          <span className="text-green-600">-${taxSummary.deductibleExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Non-Deductible Expenses</span>
                          <span className="text-gray-600">-${taxSummary.nonDeductibleExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Taxable Income</span>
                          <span>${taxSummary.taxableIncome.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Estimated Tax</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total Estimated Tax</span>
                          <span>${taxSummary.estimatedTax.toLocaleString()}</span>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Quarterly Payments</p>
                          <div className="space-y-1">
                            {Object.entries(taxSummary.quarterlyPayments).map(([quarter, amount]) => (
                              <div key={quarter} className="flex justify-between text-sm">
                                <span>{quarter}</span>
                                <span>${amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> This is an estimated tax calculation based on your business income and expenses. 
                      Please consult with a tax professional for accurate tax planning and filing.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deductible Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData.filter(c => c.value > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}