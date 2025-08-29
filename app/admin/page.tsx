'use client';

import {
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import { useDashboardData } from '@/src/hooks/useDashboardData';

export default function AdminDashboard() {
  const { stats, recentBookings, topTechnicians, revenueData, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-10 h-10 text-blue-600" />
            <span className="text-sm text-green-600 font-semibold">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalBookings.toLocaleString()}</h3>
          <p className="text-gray-600">Total Bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 text-green-600" />
            <span className="text-sm text-green-600 font-semibold">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">${stats.monthlyRevenue.toLocaleString()}</h3>
          <p className="text-gray-600">Monthly Revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-purple-600" />
            <span className="text-sm text-green-600 font-semibold">+2</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.activeTechnicians}</h3>
          <p className="text-gray-600">Active Technicians</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-10 h-10 text-yellow-500" />
            <span className="text-sm text-green-600 font-semibold">+0.1</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.satisfactionScore}</h3>
          <p className="text-gray-600">Satisfaction Score</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div className="space-y-4">
          {/* Chart container */}
          <div className="h-64 relative flex">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-xs text-gray-500 pr-4 w-12">
              <span>$60k</span>
              <span>$45k</span>
              <span>$30k</span>
              <span>$15k</span>
              <span>$0</span>
            </div>
            
            {/* Chart area */}
            <div className="flex-1 h-full flex items-end space-x-2 border-l-2 border-b-2 border-gray-200 pb-6 pl-4">
              {revenueData.map((data, index) => {
                const maxRevenue = 60000;
                const heightPercentage = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                    {/* Value label */}
                    <span className="text-xs font-semibold text-gray-700 mb-2">
                      ${(data.revenue / 1000).toFixed(0)}k
                    </span>
                    {/* Bar container */}
                    <div className="w-full relative flex-1 flex items-end">
                      {/* Bar */}
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-300 hover:shadow-lg relative group cursor-pointer"
                        style={{ 
                          height: `${heightPercentage}%`,
                          minHeight: '20px'
                        }}
                      >
                        {/* Hover tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div className="font-semibold">${data.revenue.toLocaleString()}</div>
                          <div className="text-gray-300">{data.month} 2024</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex ml-12 pl-4">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-sm font-medium text-gray-600">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chart footer */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Revenue:</span> ${revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-green-600 font-medium">
            +8.2% vs last period
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Technicians */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Top Performing Technicians</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topTechnicians.map((technician) => (
              <div key={technician.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {technician.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{technician.name}</h4>
                    <p className="text-sm text-gray-600">{technician.jobs} jobs completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{technician.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">${technician.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}