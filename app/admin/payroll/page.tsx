'use client';

import { useState } from 'react';
import { 
  DollarSign, Calendar, Download, CreditCard, 
  FileText, CheckCircle,
  Percent, Calculator, BanknoteIcon
} from 'lucide-react';

// Mock payroll data
const payrollData = {
  currentPeriod: {
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    status: 'pending',
    totalGrossPay: 28450.00,
    totalDeductions: 7112.50,
    totalNetPay: 21337.50,
    processDate: '2024-01-16',
  },
  employees: [
    {
      id: 1,
      name: 'Maria Garcia',
      role: 'Senior Technician',
      department: 'Residential',
      hoursWorked: 80,
      regularHours: 80,
      overtimeHours: 0,
      hourlyRate: 25,
      regularPay: 2000,
      overtimePay: 0,
      bonuses: 200,
      grossPay: 2200,
      federalTax: 330,
      stateTax: 176,
      socialSecurity: 136.40,
      medicare: 31.90,
      healthInsurance: 125,
      retirement401k: 110,
      totalDeductions: 909.30,
      netPay: 1290.70,
      payMethod: 'Direct Deposit',
      bankAccount: '****4567',
      ytdGross: 52800,
      ytdNet: 39600,
    },
    {
      id: 2,
      name: 'John Smith',
      role: 'Team Lead',
      department: 'Commercial',
      hoursWorked: 85,
      regularHours: 80,
      overtimeHours: 5,
      hourlyRate: 28,
      regularPay: 2240,
      overtimePay: 210,
      bonuses: 150,
      grossPay: 2600,
      federalTax: 390,
      stateTax: 208,
      socialSecurity: 161.20,
      medicare: 37.70,
      healthInsurance: 125,
      retirement401k: 130,
      totalDeductions: 1051.90,
      netPay: 1548.10,
      payMethod: 'Direct Deposit',
      bankAccount: '****8901',
      ytdGross: 62400,
      ytdNet: 46800,
    },
    {
      id: 3,
      name: 'Anna Lee',
      role: 'Technician',
      department: 'Residential',
      hoursWorked: 72,
      regularHours: 72,
      overtimeHours: 0,
      hourlyRate: 22,
      regularPay: 1584,
      overtimePay: 0,
      bonuses: 100,
      grossPay: 1684,
      federalTax: 252.60,
      stateTax: 134.72,
      socialSecurity: 104.40,
      medicare: 24.42,
      healthInsurance: 125,
      retirement401k: 84.20,
      totalDeductions: 725.34,
      netPay: 958.66,
      payMethod: 'Direct Deposit',
      bankAccount: '****2345',
      ytdGross: 40416,
      ytdNet: 30312,
    },
    {
      id: 4,
      name: 'Robert Chen',
      role: 'Part-time Technician',
      department: 'Commercial',
      hoursWorked: 40,
      regularHours: 40,
      overtimeHours: 0,
      hourlyRate: 20,
      regularPay: 800,
      overtimePay: 0,
      bonuses: 0,
      grossPay: 800,
      federalTax: 96,
      stateTax: 64,
      socialSecurity: 49.60,
      medicare: 11.60,
      healthInsurance: 0,
      retirement401k: 40,
      totalDeductions: 261.20,
      netPay: 538.80,
      payMethod: 'Paper Check',
      bankAccount: 'N/A',
      ytdGross: 19200,
      ytdNet: 14400,
    },
    {
      id: 5,
      name: 'Sofia Rodriguez',
      role: 'Technician',
      department: 'Residential',
      hoursWorked: 76,
      regularHours: 76,
      overtimeHours: 0,
      hourlyRate: 23,
      regularPay: 1748,
      overtimePay: 0,
      bonuses: 150,
      grossPay: 1898,
      federalTax: 284.70,
      stateTax: 151.84,
      socialSecurity: 117.68,
      medicare: 27.52,
      healthInsurance: 125,
      retirement401k: 94.90,
      totalDeductions: 801.64,
      netPay: 1096.36,
      payMethod: 'Direct Deposit',
      bankAccount: '****6789',
      ytdGross: 45552,
      ytdNet: 34164,
    },
  ],
  taxRates: {
    federalTax: 0.15,
    stateTax: 0.08,
    socialSecurity: 0.062,
    medicare: 0.0145,
    unemployment: 0.06,
  },
  payHistory: [
    { period: 'Dec 16-31, 2023', grossPay: 27800, netPay: 20850, status: 'paid', processDate: '2024-01-02' },
    { period: 'Dec 1-15, 2023', grossPay: 28200, netPay: 21150, status: 'paid', processDate: '2023-12-16' },
    { period: 'Nov 16-30, 2023', grossPay: 27500, netPay: 20625, status: 'paid', processDate: '2023-12-01' },
    { period: 'Nov 1-15, 2023', grossPay: 27000, netPay: 20250, status: 'paid', processDate: '2023-11-16' },
  ],
  upcomingPayroll: {
    nextPayDate: '2024-01-30',
    estimatedAmount: 28900,
    employeeCount: 24,
  },
};

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'history' | 'settings'>('overview');
  const [showPayStub, setShowPayStub] = useState<number | null>(null);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Run Payroll
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {(['overview', 'employees', 'history', 'settings'] as const).map((tab) => (
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
          {/* Current Period Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gross Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${payrollData.currentPeriod.totalGrossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${payrollData.currentPeriod.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Percent className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${payrollData.currentPeriod.totalNetPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <BanknoteIcon className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Process Date</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollData.currentPeriod.processDate}</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Current Period Summary */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Period: {payrollData.currentPeriod.startDate} to {payrollData.currentPeriod.endDate}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Regular Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OT Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonuses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollData.employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.role}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.hoursWorked}h</div>
                        {employee.overtimeHours > 0 && (
                          <div className="text-xs text-orange-600">+{employee.overtimeHours}h OT</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.regularPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.overtimePay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.bonuses.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${employee.grossPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -${employee.totalDeductions.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${employee.netPay.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setShowPayStub(employee.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Pay Stub
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Payroll */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payroll</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Next Pay Date</p>
                <p className="text-lg font-semibold text-gray-900">{payrollData.upcomingPayroll.nextPayDate}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${payrollData.upcomingPayroll.estimatedAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-lg font-semibold text-gray-900">{payrollData.upcomingPayroll.employeeCount}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Employee Payment Settings</h3>
          </div>
          <div className="divide-y">
            {payrollData.employees.map((employee) => (
              <div key={employee.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-500">{employee.role} - {employee.department}</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Pay Method</p>
                        <div className="flex items-center mt-1">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">{employee.payMethod}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Bank Account</p>
                        <p className="text-sm text-gray-900">{employee.bankAccount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Hourly Rate</p>
                        <p className="text-sm text-gray-900">${employee.hourlyRate}/hr</p>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Payroll History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Payroll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Payroll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollData.payHistory.map((payroll, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payroll.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payroll.grossPay.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payroll.netPay.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.processDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                      <button className="text-gray-600 hover:text-gray-900">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payroll Settings</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Tax Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(payrollData.taxRates).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        value={(value * 100).toFixed(1)}
                        readOnly
                        className="block w-full pr-10 border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Direct Deposit Settings</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Bank Account</p>
                    <p className="text-sm text-gray-500">Wells Fargo Business Checking ****1234</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Payroll Schedule</h4>
              <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                <option>Bi-weekly (Every 2 weeks)</option>
                <option>Semi-monthly (1st and 15th)</option>
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pay Stub Modal */}
      {showPayStub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Pay Stub</h3>
              <button 
                onClick={() => setShowPayStub(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const employee = payrollData.employees.find(e => e.id === showPayStub);
              if (!employee) return null;
              
              return (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h4 className="font-semibold text-gray-900">BusinessFlow Services</h4>
                    <p className="text-sm text-gray-600">123 Main St, San Francisco, CA 94102</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Employee Information</h5>
                      <p className="text-sm text-gray-600">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                      <p className="text-sm text-gray-600">Employee ID: #{employee.id}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Pay Period</h5>
                      <p className="text-sm text-gray-600">{payrollData.currentPeriod.startDate} to {payrollData.currentPeriod.endDate}</p>
                      <p className="text-sm text-gray-600">Pay Date: {payrollData.currentPeriod.processDate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Earnings</h5>
                    <table className="w-full text-sm">
                      <tr>
                        <td className="text-gray-600">Regular Hours ({employee.regularHours} @ ${employee.hourlyRate}/hr)</td>
                        <td className="text-right text-gray-900">${employee.regularPay.toFixed(2)}</td>
                      </tr>
                      {employee.overtimeHours > 0 && (
                        <tr>
                          <td className="text-gray-600">Overtime ({employee.overtimeHours} @ ${employee.hourlyRate * 1.5}/hr)</td>
                          <td className="text-right text-gray-900">${employee.overtimePay.toFixed(2)}</td>
                        </tr>
                      )}
                      {employee.bonuses > 0 && (
                        <tr>
                          <td className="text-gray-600">Bonuses</td>
                          <td className="text-right text-gray-900">${employee.bonuses.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-t font-medium">
                        <td className="pt-2">Gross Pay</td>
                        <td className="text-right pt-2">${employee.grossPay.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Deductions</h5>
                    <table className="w-full text-sm">
                      <tr>
                        <td className="text-gray-600">Federal Tax</td>
                        <td className="text-right text-gray-900">-${employee.federalTax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600">State Tax</td>
                        <td className="text-right text-gray-900">-${employee.stateTax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600">Social Security</td>
                        <td className="text-right text-gray-900">-${employee.socialSecurity.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600">Medicare</td>
                        <td className="text-right text-gray-900">-${employee.medicare.toFixed(2)}</td>
                      </tr>
                      {employee.healthInsurance > 0 && (
                        <tr>
                          <td className="text-gray-600">Health Insurance</td>
                          <td className="text-right text-gray-900">-${employee.healthInsurance.toFixed(2)}</td>
                        </tr>
                      )}
                      {employee.retirement401k > 0 && (
                        <tr>
                          <td className="text-gray-600">401(k) Contribution</td>
                          <td className="text-right text-gray-900">-${employee.retirement401k.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-t font-medium">
                        <td className="pt-2">Total Deductions</td>
                        <td className="text-right pt-2">-${employee.totalDeductions.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Net Pay</span>
                      <span className="text-green-600">${employee.netPay.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Payment Method: {employee.payMethod} {employee.bankAccount !== 'N/A' && `(${employee.bankAccount})`}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Year-to-Date</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">YTD Gross:</span>
                        <span className="ml-2 text-gray-900">${employee.ytdGross.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">YTD Net:</span>
                        <span className="ml-2 text-gray-900">${employee.ytdNet.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Email to Employee
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}