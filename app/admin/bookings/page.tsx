'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, User, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

// Mock booking data
const bookingsData = [
  { id: 1, customer: 'Sarah Johnson', technician: 'Maria Garcia', service: 'Regular Cleaning', date: '2024-01-15', time: '9:00 AM', status: 'completed', address: '123 Oak Street, SF', amount: 80 },
  { id: 2, customer: 'Mike Williams', technician: 'John Smith', service: 'Deep Cleaning', date: '2024-01-15', time: '2:00 PM', status: 'completed', address: '456 Pine Avenue, SF', amount: 150 },
  { id: 3, customer: 'Emily Davis', technician: 'Anna Lee', service: 'Move-in Cleaning', date: '2024-01-16', time: '10:00 AM', status: 'in_progress', address: '789 Elm Street, SF', amount: 200 },
  { id: 4, customer: 'James Brown', technician: 'Robert Chen', service: 'Office Cleaning', date: '2024-01-16', time: '4:00 PM', status: 'scheduled', address: '321 Market Street, SF', amount: 120 },
  { id: 5, customer: 'Lisa Anderson', technician: 'Maria Garcia', service: 'Regular Cleaning', date: '2024-01-17', time: '11:00 AM', status: 'scheduled', address: '555 Broadway, SF', amount: 80 },
  { id: 6, customer: 'David Wilson', technician: 'John Smith', service: 'Deep Cleaning', date: '2024-01-17', time: '1:00 PM', status: 'scheduled', address: '777 Valencia St, SF', amount: 150 },
  { id: 7, customer: 'Jennifer Martinez', technician: 'Anna Lee', service: 'Regular Cleaning', date: '2024-01-18', time: '9:00 AM', status: 'scheduled', address: '999 Mission St, SF', amount: 80 },
  { id: 8, customer: 'Robert Taylor', technician: 'Robert Chen', service: 'Move-out Cleaning', date: '2024-01-18', time: '2:00 PM', status: 'scheduled', address: '111 Powell St, SF', amount: 200 },
  { id: 9, customer: 'Maria Rodriguez', technician: 'Maria Garcia', service: 'Office Cleaning', date: '2024-01-19', time: '10:00 AM', status: 'scheduled', address: '222 Geary St, SF', amount: 120 },
  { id: 10, customer: 'William Lee', technician: 'John Smith', service: 'Regular Cleaning', date: '2024-01-19', time: '3:00 PM', status: 'scheduled', address: '333 Bush St, SF', amount: 80 },
];

// Calendar data structure
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  while (current <= lastDay || current.getDay() !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export default function BookingsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookingsData.filter(booking => booking.date === dateStr);
  };
  
  const filteredBookings = selectedDate 
    ? getBookingsForDate(selectedDate)
    : bookingsData;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg ${
              view === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* List View */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate 
              ? `Bookings for ${selectedDate.toLocaleDateString()}`
              : 'All Bookings'
            }
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{booking.date}</div>
                        <div className="text-gray-500">{booking.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.technician}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      {booking.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                      {booking.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const bookings = getBookingsForDate(day);
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[80px] p-2 border rounded-lg text-left transition-colors ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    } ${
                      isToday ? 'bg-blue-50' : ''
                    } hover:bg-gray-50`}
                  >
                    <div className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    {bookings.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs text-blue-600 font-medium">
                          {bookings.length} booking{bookings.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}