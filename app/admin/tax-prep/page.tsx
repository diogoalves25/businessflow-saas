'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Calculator, 
  AlertCircle, 
  CheckCircle,
  TrendingDown,
  Receipt,
  DollarSign,
  FileCheck
} from 'lucide-react';

interface TaxDocument {
  type: string;
  name: string;
  status: 'ready' | 'missing' | 'pending';
  description: string;
}

interface Deduction {
  category: string;
  amount: number;
  count: number;
  description: string;
}

export default function TaxPrepPage() {
  const { data: session } = useSession();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [taxSummary, setTaxSummary] = useState<any>(null);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxData();
  }, [selectedYear]);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      
      // Fetch tax summary
      const summaryRes = await fetch(`/api/reports/tax-summary?year=${selectedYear}`);
      const summaryData = await summaryRes.json();
      setTaxSummary(summaryData);

      // Fetch deductions
      const deductionsRes = await fetch(`/api/tax/deductions?year=${selectedYear}`);
      const deductionsData = await deductionsRes.json();
      setDeductions(deductionsData);

      // Mock tax documents status
      setDocuments([
        {
          type: '1099-K',
          name: 'Payment Processing Form',
          status: 'ready',
          description: 'Stripe payment processing summary'
        },
        {
          type: 'Schedule C',
          name: 'Profit or Loss Statement',
          status: 'ready',
          description: 'Business income and expenses'
        },
        {
          type: 'Form 8829',
          name: 'Home Office Deduction',
          status: session?.user?.businessType === 'MOBILE_DETAILING' ? 'pending' : 'missing',
          description: 'Business use of home'
        },
        {
          type: 'Receipts',
          name: 'Expense Documentation',
          status: 'ready',
          description: 'All business expense receipts'
        },
        {
          type: 'Mileage Log',
          name: 'Vehicle Usage Records',
          status: ['MOBILE_DETAILING', 'LAWN_CARE', 'PLUMBING'].includes(session?.user?.businessType || '') ? 'pending' : 'missing',
          description: 'Business mileage documentation'
        },
      ]);
    } catch (error) {
      console.error('Error fetching tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTaxPackage = async () => {
    try {
      const response = await fetch(`/api/tax/export?year=${selectedYear}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-package-${selectedYear}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting tax package:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tax Preparation</h1>
          <p className="text-muted-foreground">Organize your business taxes efficiently</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2].map(offset => {
                const year = new Date().getFullYear() - offset;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button onClick={exportTaxPackage}>
            <Download className="mr-2 h-4 w-4" />
            Export Tax Package
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${taxSummary?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross business income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deductible Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${taxSummary?.deductibleExpenses?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tax-deductible expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${taxSummary?.taxableIncome?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              After deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${taxSummary?.estimatedTax?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Federal tax estimate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deductions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly Taxes</TabsTrigger>
          <TabsTrigger value="checklist">Tax Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="deductions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Deductions</CardTitle>
              <CardDescription>
                All tax-deductible expenses for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductions.map((deduction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {deduction.category}
                      </TableCell>
                      <TableCell>{deduction.description}</TableCell>
                      <TableCell className="text-right">{deduction.count}</TableCell>
                      <TableCell className="text-right">
                        ${deduction.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Documents</CardTitle>
              <CardDescription>
                Required documents for filing your business taxes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{doc.type}</h4>
                      <p className="text-sm text-muted-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'ready' && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Ready
                      </Badge>
                    )}
                    {doc.status === 'pending' && (
                      <Badge variant="secondary">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                    {doc.status === 'missing' && (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Missing
                      </Badge>
                    )}
                    {doc.status === 'ready' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Tax Payments</CardTitle>
              <CardDescription>
                Estimated tax payments for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(taxSummary?.quarterlyPayments || {}).map(([quarter, amount]) => (
                  <Card key={quarter}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{quarter}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${(amount as number).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {getQuarterlyDueDate(quarter, selectedYear)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These are estimated quarterly payments. Consult with a tax professional
                  for accurate calculations based on your specific situation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Preparation Checklist</CardTitle>
              <CardDescription>
                Ensure you have everything ready for tax filing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getTaxChecklist(session?.user?.businessType || 'GENERAL').map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <FileCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getQuarterlyDueDate(quarter: string, year: string): string {
  const dates: Record<string, string> = {
    'Q1': `April 15, ${year}`,
    'Q2': `June 15, ${year}`,
    'Q3': `September 15, ${year}`,
    'Q4': `January 15, ${parseInt(year) + 1}`,
  };
  return dates[quarter] || '';
}

function getTaxChecklist(businessType: string): Array<{ title: string; description: string }> {
  const commonItems = [
    {
      title: 'Income Records',
      description: 'All 1099 forms, payment processing statements, and cash income logs'
    },
    {
      title: 'Expense Receipts',
      description: 'Organized receipts for all business expenses with proper categorization'
    },
    {
      title: 'Bank Statements',
      description: 'Business bank account statements for the entire tax year'
    },
    {
      title: 'Credit Card Statements',
      description: 'Business credit card statements showing all transactions'
    },
    {
      title: 'Prior Year Tax Return',
      description: 'Last year\'s tax return for reference and carryovers'
    },
  ];

  const businessSpecific: Record<string, Array<{ title: string; description: string }>> = {
    MOBILE_DETAILING: [
      {
        title: 'Vehicle Mileage Log',
        description: 'Detailed log of business miles driven with dates and purposes'
      },
      {
        title: 'Vehicle Expenses',
        description: 'Gas, maintenance, insurance, and depreciation records'
      },
    ],
    CLEANING: [
      {
        title: 'Supply Inventory',
        description: 'Year-end inventory count and valuation of cleaning supplies'
      },
      {
        title: 'Contract Income',
        description: 'Documentation for all service contracts and recurring clients'
      },
    ],
    SALON: [
      {
        title: 'Product Inventory',
        description: 'Year-end inventory of retail products and supplies'
      },
      {
        title: 'Booth Rental Income',
        description: 'Records of any booth rental income received'
      },
    ],
    LAWN_CARE: [
      {
        title: 'Equipment Depreciation',
        description: 'Purchase records and depreciation schedules for equipment'
      },
      {
        title: 'Seasonal Income',
        description: 'Documentation showing seasonal income variations'
      },
    ],
    DENTAL: [
      {
        title: 'Professional License Fees',
        description: 'Records of professional licensing and continuing education'
      },
      {
        title: 'Lab Fees',
        description: 'Invoices and payments for dental lab services'
      },
    ],
  };

  return [
    ...commonItems,
    ...(businessSpecific[businessType] || [])
  ];
}