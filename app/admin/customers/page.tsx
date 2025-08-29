'use client';

import { useState } from 'react';
import { Search, Phone, Mail, MapPin, Calendar, DollarSign, Star, Download, UserPlus } from 'lucide-react';

// Mock customer data
const customersData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 201-2345',
    address: '123 Oak Street, San Francisco, CA 94102',
    joinDate: '2023-06-15',
    totalBookings: 24,
    totalSpent: 1920,
    avgRating: 5.0,
    preferredTechnician: 'Maria Garcia',
    lastBooking: '2024-01-15',
    nextBooking: '2024-01-22',
    frequency: 'Weekly',
    bookingHistory: [
      { date: '2024-01-15', service: 'Regular Cleaning', technician: 'Maria Garcia', amount: 80, rating: 5 },
      { date: '2024-01-08', service: 'Regular Cleaning', technician: 'Maria Garcia', amount: 80, rating: 5 },
      { date: '2024-01-01', service: 'Deep Cleaning', technician: 'Maria Garcia', amount: 150, rating: 5 },
      { date: '2023-12-25', service: 'Regular Cleaning', technician: 'Maria Garcia', amount: 80, rating: 5 },
    ],
  },
  {
    id: 2,
    name: 'Mike Williams',
    email: 'mike.williams@example.com',
    phone: '(555) 202-3456',
    address: '456 Pine Avenue, San Francisco, CA 94103',
    joinDate: '2023-08-22',
    totalBookings: 18,
    totalSpent: 2700,
    avgRating: 4.8,
    preferredTechnician: 'John Smith',
    lastBooking: '2024-01-15',
    nextBooking: '2024-01-29',
    frequency: 'Bi-weekly',
    bookingHistory: [
      { date: '2024-01-15', service: 'Deep Cleaning', technician: 'John Smith', amount: 150, rating: 5 },
      { date: '2024-01-01', service: 'Deep Cleaning', technician: 'John Smith', amount: 150, rating: 4 },
      { date: '2023-12-18', service: 'Regular Cleaning', technician: 'Anna Lee', amount: 80, rating: 5 },
    ],
  },
  {
    id: 3,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 203-4567',
    address: '789 Elm Street, San Francisco, CA 94104',
    joinDate: '2023-09-10',
    totalBookings: 15,
    totalSpent: 2400,
    avgRating: 4.9,
    preferredTechnician: 'Anna Lee',
    lastBooking: '2024-01-10',
    nextBooking: '2024-01-16',
    frequency: 'Monthly',
    bookingHistory: [
      { date: '2024-01-10', service: 'Move-in Cleaning', technician: 'Anna Lee', amount: 200, rating: 5 },
      { date: '2023-12-10', service: 'Deep Cleaning', technician: 'Anna Lee', amount: 150, rating: 5 },
      { date: '2023-11-10', service: 'Regular Cleaning', technician: 'Anna Lee', amount: 80, rating: 4 },
    ],
  },
  {
    id: 4,
    name: 'James Brown',
    email: 'james.brown@example.com',
    phone: '(555) 204-5678',
    address: '321 Market Street, San Francisco, CA 94105',
    joinDate: '2023-07-05',
    totalBookings: 21,
    totalSpent: 2520,
    avgRating: 4.7,
    preferredTechnician: 'Robert Chen',
    lastBooking: '2024-01-14',
    nextBooking: '2024-01-16',
    frequency: 'Monthly',
    bookingHistory: [
      { date: '2024-01-14', service: 'Office Cleaning', technician: 'Robert Chen', amount: 120, rating: 4 },
      { date: '2023-12-14', service: 'Office Cleaning', technician: 'Robert Chen', amount: 120, rating: 5 },
      { date: '2023-11-14', service: 'Office Cleaning', technician: 'Maria Garcia', amount: 120, rating: 5 },
    ],
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    phone: '(555) 205-6789',
    address: '555 Broadway, San Francisco, CA 94106',
    joinDate: '2023-10-12',
    totalBookings: 12,
    totalSpent: 960,
    avgRating: 5.0,
    preferredTechnician: 'Maria Garcia',
    lastBooking: '2024-01-12',
    nextBooking: '2024-01-17',
    frequency: 'Bi-weekly',
    bookingHistory: [
      { date: '2024-01-12', service: 'Regular Cleaning', technician: 'Maria Garcia', amount: 80, rating: 5 },
      { date: '2023-12-29', service: 'Regular Cleaning', technician: 'Maria Garcia', amount: 80, rating: 5 },
      { date: '2023-12-15', service: 'Regular Cleaning', technician: 'Maria Garcia', amount: 80, rating: 5 },
    ],
  },
  {
    id: 6,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '(555) 206-7890',
    address: '777 Valencia St, San Francisco, CA 94107',
    joinDate: '2023-11-20',
    totalBookings: 8,
    totalSpent: 1200,
    avgRating: 4.6,
    preferredTechnician: 'John Smith',
    lastBooking: '2024-01-13',
    nextBooking: null,
    frequency: 'Once',
    bookingHistory: [
      { date: '2024-01-13', service: 'Deep Cleaning', technician: 'John Smith', amount: 150, rating: 5 },
      { date: '2023-12-20', service: 'Regular Cleaning', technician: 'John Smith', amount: 80, rating: 4 },
    ],
  },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');

  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFrequency = frequencyFilter === 'all' || customer.frequency === frequencyFilter;
    return matchesSearch && matchesFrequency;
  });

  const selectedCustomerData = selectedCustomer ? customersData.find(c => c.id === selectedCustomer) : null;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customersData.length}</p>
            </div>
            <UserPlus className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {customersData.filter(c => c.frequency !== 'Once').length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${customersData.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating Given</p>
              <p className="text-2xl font-bold text-gray-900">
                {(customersData.reduce((sum, c) => sum + c.avgRating, 0) / customersData.length).toFixed(1)}
              </p>
            </div>
            <Star className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Frequencies</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Once">One-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">Customer since {customer.joinDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.frequency === 'Weekly' ? 'bg-green-100 text-green-800' :
                      customer.frequency === 'Bi-weekly' ? 'bg-blue-100 text-blue-800' :
                      customer.frequency === 'Monthly' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.totalBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.nextBooking || 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => setSelectedCustomer(customer.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View History
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && selectedCustomerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedCustomerData.name}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {selectedCustomerData.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedCustomerData.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedCustomerData.address}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Preferred Technician</p>
                <p className="font-semibold text-gray-900">{selectedCustomerData.preferredTechnician}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average Rating Given</p>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="ml-1 font-semibold text-gray-900">{selectedCustomerData.avgRating}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Lifetime Value</p>
                <p className="font-semibold text-gray-900">${selectedCustomerData.totalSpent.toLocaleString()}</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h4>
            <div className="space-y-3">
              {selectedCustomerData.bookingHistory.map((booking, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {booking.date}
                      </div>
                      <div className="font-medium text-gray-900">{booking.service}</div>
                      <div className="text-sm text-gray-600">Technician: {booking.technician}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${booking.amount}</div>
                      <div className="flex items-center justify-end mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm">{booking.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}