'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  AlertCircle, TrendingUp, Target, DollarSign, 
  Plus, Edit, Trash, Bell, Check
} from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '@/lib/expenses/categories';

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  startDate: string;
  endDate?: string;
  alertThreshold: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

interface CategorySpending {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}

export default function BudgetsPage() {
  const { data: session } = useSession();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: '0.8'
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      const data = await response.json();
      
      // Calculate spending for each budget
      const budgetsWithSpending = await Promise.all(
        data.map(async (budget: any) => {
          const spendingRes = await fetch(
            `/api/expenses/summary?from=${budget.startDate}&to=${budget.endDate || new Date().toISOString()}&category=${budget.category}`
          );
          const spending = await spendingRes.json();
          
          const spent = spending.categoryBreakdown[budget.category] || 0;
          const remaining = budget.amount - spent;
          const percentageUsed = (spent / budget.amount) * 100;

          return {
            ...budget,
            spent,
            remaining,
            percentageUsed
          };
        })
      );

      setBudgets(budgetsWithSpending);

      // Check for alerts
      const alertMessages = budgetsWithSpending
        .filter(b => b.percentageUsed >= b.alertThreshold * 100)
        .map(b => `${b.category} budget is at ${b.percentageUsed.toFixed(0)}% of limit`);
      
      setAlerts(alertMessages);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load budgets',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expenses/categories');
      const data = await response.json();
      setCategories(data.map((c: any) => c.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const startDate = startOfMonth(new Date());
      let endDate: Date | undefined;

      // Calculate end date based on period
      if (formData.period === 'monthly') {
        endDate = endOfMonth(new Date());
      } else if (formData.period === 'quarterly') {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (formData.period === 'yearly') {
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        alertThreshold: parseFloat(formData.alertThreshold)
      };

      const response = await fetch(
        editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets',
        {
          method: editingBudget ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetData)
        }
      );

      if (!response.ok) throw new Error('Failed to save budget');

      toast({
        title: 'Success',
        description: `Budget ${editingBudget ? 'updated' : 'created'} successfully`
      });

      setShowAddDialog(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to save budget',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete budget');

      toast({
        title: 'Success',
        description: 'Budget deleted successfully'
      });

      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold.toString()
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
      alertThreshold: '0.8'
    });
  };

  const getStatusColor = (percentageUsed: number, alertThreshold: number) => {
    if (percentageUsed >= 100) return 'text-red-600 bg-red-100';
    if (percentageUsed >= alertThreshold * 100) return 'text-orange-600 bg-orange-100';
    if (percentageUsed >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentageUsed: number, alertThreshold: number) => {
    if (percentageUsed >= 100) return 'bg-red-600';
    if (percentageUsed >= alertThreshold * 100) return 'bg-orange-600';
    if (percentageUsed >= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit' : 'Create'} Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center">
                          <span className="mr-2">{getCategoryIcon(category)}</span>
                          {category}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="period">Budget Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Select
                  value={formData.alertThreshold}
                  onValueChange={(value) => setFormData({ ...formData, alertThreshold: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">50%</SelectItem>
                    <SelectItem value="0.6">60%</SelectItem>
                    <SelectItem value="0.7">70%</SelectItem>
                    <SelectItem value="0.8">80%</SelectItem>
                    <SelectItem value="0.9">90%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll be notified when spending reaches this percentage
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setEditingBudget(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBudget ? 'Update' : 'Create'} Budget
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-medium text-orange-900">Budget Alerts</div>
            <ul className="mt-1 text-sm text-orange-800">
              {alerts.map((alert, index) => (
                <li key={index}>" {alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Budget Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {overallPercentage.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(totalRemaining).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.length} alerts active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <div className="grid gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span 
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ backgroundColor: getCategoryColor(budget.category) + '20' }}
                  >
                    {getCategoryIcon(budget.category)}
                  </span>
                  <div>
                    <h3 className="font-semibold">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {budget.period} budget
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    className={getStatusColor(budget.percentageUsed, budget.alertThreshold)}
                  >
                    {budget.percentageUsed >= 100 ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Over Budget
                      </>
                    ) : budget.percentageUsed >= budget.alertThreshold * 100 ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Alert
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        On Track
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(budget)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span className="font-medium">${budget.spent.toFixed(2)}</span>
                </div>
                <Progress 
                  value={Math.min(budget.percentageUsed, 100)} 
                  className="h-2"
                  indicatorClassName={getProgressColor(budget.percentageUsed, budget.alertThreshold)}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                  </span>
                  <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${Math.abs(budget.remaining).toFixed(2)} {budget.remaining >= 0 ? 'remaining' : 'over'}
                  </span>
                </div>
              </div>

              {budget.percentageUsed >= budget.alertThreshold * 100 && (
                <Alert className="mt-4 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm">
                    This budget has reached {budget.percentageUsed.toFixed(0)}% of its limit.
                    Consider reviewing your spending in this category.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets set up yet</h3>
            <p className="text-muted-foreground mb-4">
              Create budgets to track and control your spending by category
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}