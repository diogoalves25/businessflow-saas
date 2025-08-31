'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, DollarSign, Users, Calendar, Building, AlertCircle, Check } from 'lucide-react';
import { format } from 'date-fns';
import { usePlaidLink } from 'react-plaid-link';
import { useFeatureAccess } from '@/src/hooks/useFeatureAccess';
import { formatCurrency } from '@/src/lib/utils';

interface BankAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  balance: number;
  available: number;
}

interface BankConnection {
  connectionId: string;
  institutionName: string;
  accounts: BankAccount[];
}

interface PayrollCalculation {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  hoursWorked: number;
  hourlyRate: number;
  grossAmount: number;
  taxWithholding: number;
  netAmount: number;
  tips: number;
  bonus: number;
}

interface PayrollPeriod {
  start: string;
  end: string;
}

export default function PayrollPage() {
  const router = useRouter();
  const { canAccess } = useFeatureAccess();
  const [loading, setLoading] = useState(true);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<PayrollPeriod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);

  // Check Premium access
  useEffect(() => {
    if (!canAccess('hasPayroll')) {
      router.push('/admin/settings?upgrade=true');
    }
  }, [canAccess, router]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchBankAccounts(),
        fetchPayrollCalculations(),
        fetchPayrollHistory(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch('/api/plaid/accounts');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
        
        // Auto-select first checking account
        if (data.connections.length > 0 && !selectedAccount) {
          const firstChecking = data.connections[0].accounts.find(
            (acc: BankAccount) => acc.subtype === 'checking'
          );
          if (firstChecking) {
            setSelectedAccount(`${data.connections[0].connectionId}:${firstChecking.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchPayrollCalculations = async () => {
    try {
      const response = await fetch('/api/payroll/calculate');
      if (response.ok) {
        const data = await response.json();
        setCalculations(data.calculations || []);
        setCurrentPeriod(data.period);
      }
    } catch (error) {
      console.error('Error fetching calculations:', error);
    }
  };

  const fetchPayrollHistory = async () => {
    try {
      const response = await fetch('/api/payroll/history');
      if (response.ok) {
        const data = await response.json();
        setPayrollHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const createLinkToken = async () => {
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setLinkToken(data.link_token);
      }
    } catch (error) {
      console.error('Error creating link token:', error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const response = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token,
            institution: metadata.institution,
            accounts: metadata.accounts,
          }),
        });

        if (response.ok) {
          await fetchBankAccounts();
        }
      } catch (error) {
        console.error('Error exchanging token:', error);
      }
    },
  });

  const processPayroll = async () => {
    if (!selectedAccount || calculations.length === 0) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          periodStart: currentPeriod?.start,
          periodEnd: currentPeriod?.end,
          calculations,
        }),
      });

      if (response.ok) {
        // Refresh data
        await fetchData();
        // Show success message
        alert('Payroll processed successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to process payroll');
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const disconnectAccount = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank account?')) return;

    try {
      const response = await fetch('/api/plaid/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        await fetchBankAccounts();
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalGross = calculations.reduce((sum, calc) => sum + calc.grossAmount, 0);
  const totalTax = calculations.reduce((sum, calc) => sum + calc.taxWithholding, 0);
  const totalNet = calculations.reduce((sum, calc) => sum + calc.netAmount, 0);
  const totalHours = calculations.reduce((sum, calc) => sum + calc.hoursWorked, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <p className="text-muted-foreground">
          Automate payroll processing with Plaid integration
        </p>
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="process">Process Payroll</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {currentPeriod && `${format(new Date(currentPeriod.start), 'MMM d')} - ${format(new Date(currentPeriod.end), 'MMM d')}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalGross)}</div>
                <p className="text-xs text-muted-foreground">Before taxes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Withholding</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalTax)}</div>
                <p className="text-xs text-muted-foreground">Federal + State + FICA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalNet)}</div>
                <p className="text-xs text-muted-foreground">{calculations.length} employees</p>
              </CardContent>
            </Card>
          </div>

          {/* Bank Account Selection */}
          {connections.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect a bank account to process payroll
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment Account</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedAccount || ''}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select an account</option>
                  {connections.map((conn) =>
                    conn.accounts.map((acc) => (
                      <option key={acc.id} value={`${conn.connectionId}:${acc.id}`}>
                        {conn.institutionName} - {acc.name} (...{acc.mask}) - {formatCurrency(acc.available)}
                      </option>
                    ))
                  )}
                </select>
              </CardContent>
            </Card>
          )}

          {/* Employee Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calculations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No payroll to process for this period
                  </p>
                ) : (
                  calculations.map((calc) => (
                    <div key={calc.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{calc.user.name}</p>
                        <p className="text-sm text-muted-foreground">{calc.user.email}</p>
                        <div className="flex gap-4 mt-1 text-sm">
                          <span>{calc.hoursWorked} hours @ {formatCurrency(calc.hourlyRate)}/hr</span>
                          {calc.tips > 0 && <span>+ {formatCurrency(calc.tips)} tips</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(calc.netAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Gross: {formatCurrency(calc.grossAmount)} - Tax: {formatCurrency(calc.taxWithholding)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Process Button */}
          {calculations.length > 0 && connections.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={processPayroll}
                disabled={!selectedAccount || processing}
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Process Payroll ({formatCurrency(totalNet)})
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Connected Bank Accounts</h2>
            <Button
              onClick={() => {
                if (!linkToken) {
                  createLinkToken();
                } else {
                  open();
                }
              }}
              disabled={!ready && linkToken !== null}
            >
              <Plus className="mr-2 h-4 w-4" />
              Connect Bank Account
            </Button>
          </div>

          <div className="grid gap-4">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No bank accounts connected</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect your business checking account to process payroll
                  </p>
                </CardContent>
              </Card>
            ) : (
              connections.map((conn) => (
                <Card key={conn.connectionId}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{conn.institutionName}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disconnectAccount(conn.connectionId)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {conn.accounts.map((acc) => (
                        <div key={acc.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{acc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {acc.type} - {acc.subtype} (...{acc.mask})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(acc.balance)}</p>
                            <p className="text-sm text-muted-foreground">
                              Available: {formatCurrency(acc.available)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h2 className="text-xl font-semibold">Payroll History</h2>
          
          <div className="space-y-4">
            {payrollHistory.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No payroll history yet</p>
                </CardContent>
              </Card>
            ) : (
              payrollHistory.map((run) => (
                <Card key={run.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">
                          {format(new Date(run.periodStart), 'MMM d')} - {format(new Date(run.periodEnd), 'MMM d, yyyy')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Processed {format(new Date(run.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                        {run.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold">{formatCurrency(run.totalAmount)}</span>
                    </div>
                    <div className="space-y-2">
                      {run.payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center text-sm">
                          <span>{payment.user.name}</span>
                          <span>{formatCurrency(payment.netAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}