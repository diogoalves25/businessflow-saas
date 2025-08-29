'use client';

import { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Receipt, Upload, 
  PieChart, Download, Plus,
  Fuel, Package, Wrench, Home, CreditCard, Users
} from 'lucide-react';

// Mock expense data
const expenseData = {
  currentMonth: {
    revenue: 45680,
    expenses: 12450,
    netProfit: 33230,
    profitMargin: 72.7,
  },
  monthlyPL: {
    revenue: {
      cleaning: 38500,
      addOns: 4200,
      tips: 2980,
    },
    expenses: {
      supplies: 2850,
      gas: 1650,
      equipment: 890,
      payroll: 5800,
      insurance: 450,
      marketing: 380,
      other: 430,
    },
  },
  expenses: [
    { id: 1, date: '2024-01-15', category: 'Supplies', vendor: 'CleanSupply Co', amount: 285.50, description: 'Cleaning products bulk order', receipt: true },
    { id: 2, date: '2024-01-14', category: 'Gas', vendor: 'Shell Station', amount: 65.23, description: 'Van fuel', receipt: true },
    { id: 3, date: '2024-01-14', category: 'Equipment', vendor: 'Amazon', amount: 189.99, description: 'New vacuum technician', receipt: true },
    { id: 4, date: '2024-01-13', category: 'Supplies', vendor: 'Costco', amount: 156.78, description: 'Paper towels and disinfectants', receipt: true },
    { id: 5, date: '2024-01-12', category: 'Gas', vendor: 'Chevron', amount: 58.90, description: 'Van fuel', receipt: true },
    { id: 6, date: '2024-01-11', category: 'Marketing', vendor: 'Facebook Ads', amount: 125.00, description: 'Social media advertising', receipt: false },
    { id: 7, date: '2024-01-10', category: 'Insurance', vendor: 'State Farm', amount: 450.00, description: 'Monthly business insurance', receipt: true },
    { id: 8, date: '2024-01-09', category: 'Equipment', vendor: 'Home Depot', amount: 234.56, description: 'Mop buckets and handles', receipt: true },
    { id: 9, date: '2024-01-08', category: 'Gas', vendor: 'BP Station', amount: 71.45, description: 'Van fuel', receipt: true },
    { id: 10, date: '2024-01-07', category: 'Other', vendor: 'Office Max', amount: 89.34, description: 'Office supplies', receipt: true },
  ],
  categories: [
    { name: 'Supplies', icon: Package, color: 'bg-blue-500', total: 3245.67, percentage: 26.1 },
    { name: 'Gas', icon: Fuel, color: 'bg-orange-500', total: 1856.34, percentage: 14.9 },
    { name: 'Equipment', icon: Wrench, color: 'bg-purple-500', total: 1234.89, percentage: 9.9 },
    { name: 'Payroll', icon: Users, color: 'bg-green-500', total: 5800.00, percentage: 46.6 },
    { name: 'Insurance', icon: Home, color: 'bg-red-500', total: 450.00, percentage: 3.6 },
    { name: 'Marketing', icon: TrendingUp, color: 'bg-pink-500', total: 380.00, percentage: 3.1 },
    { name: 'Other', icon: CreditCard, color: 'bg-gray-500', total: 483.10, percentage: 3.9 },
  ],
  yearToDate: {
    revenue: 542300,
    expenses: 148900,
    netProfit: 393400,
    avgMonthlyProfit: 32783,
  },
};

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'receipts'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const filteredExpenses = selectedCategory 
    ? expenseData.expenses.filter(expense => expense.category === selectedCategory)
    : expenseData.expenses;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Expenses & P&L</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button 
            onClick={() => setShowAddExpense(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${expenseData.currentMonth.revenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${expenseData.currentMonth.expenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">${expenseData.currentMonth.netProfit.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{expenseData.currentMonth.profitMargin}%</p>
            </div>
            <PieChart className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {(['overview', 'expenses', 'receipts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Monthly P&L Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown - January 2024</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cleaning Services</span>
                  <span className="font-medium text-gray-900">${expenseData.monthlyPL.revenue.cleaning.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Add-on Services</span>
                  <span className="font-medium text-gray-900">${expenseData.monthlyPL.revenue.addOns.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tips</span>
                  <span className="font-medium text-gray-900">${expenseData.monthlyPL.revenue.tips.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Revenue</span>
                  <span className="text-lg font-bold text-green-600">${expenseData.currentMonth.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown - January 2024</h3>
              <div className="space-y-4">
                {Object.entries(expenseData.monthlyPL.expenses).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                    <span className="font-medium text-gray-900">${amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Expenses</span>
                  <span className="text-lg font-bold text-red-600">${expenseData.currentMonth.expenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {expenseData.categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedCategory === category.name 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 text-left">{category.name}</p>
                    <p className="text-lg font-bold text-gray-900 text-left">${category.total.toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* YTD Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-to-Date Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">YTD Revenue</p>
                <p className="text-xl font-bold text-gray-900">${expenseData.yearToDate.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">YTD Expenses</p>
                <p className="text-xl font-bold text-gray-900">${expenseData.yearToDate.expenses.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">YTD Net Profit</p>
                <p className="text-xl font-bold text-gray-900">${expenseData.yearToDate.netProfit.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Avg Monthly Profit</p>
                <p className="text-xl font-bold text-gray-900">${expenseData.yearToDate.avgMonthlyProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filter: {selectedCategory}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.vendor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {expense.receipt ? (
                        <Receipt className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-gray-400">No receipt</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-gray-600 hover:text-gray-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Upload Receipts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Drag and drop receipt images or click to browse
              </p>
              <div className="mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Select Files
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Receipts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {expenseData.expenses.filter(e => e.receipt).slice(0, 6).map((expense) => (
                <div key={expense.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <Receipt className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-gray-900">{expense.vendor}</p>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">${expense.amount.toFixed(2)}</p>
                    <div className="mt-3 flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700">View</button>
                      <button className="text-sm text-gray-600 hover:text-gray-700">Download</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
              <button 
                onClick={() => setShowAddExpense(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                  <option>Supplies</option>
                  <option>Gas</option>
                  <option>Equipment</option>
                  <option>Insurance</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="e.g., Home Depot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  rows={3}
                  placeholder="What did you purchase?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600">Upload receipt image</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Choose file</button>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}