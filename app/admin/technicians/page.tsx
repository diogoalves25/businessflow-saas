'use client';

import { useState } from 'react';
import { Star, DollarSign, Calendar, Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useBusiness } from '@/src/contexts/BusinessContext';

interface TechnicianData {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  earnings: {
    today: number;
    week: number;
    month: number;
  };
  availability: Record<string, boolean>;
  todaySchedule: Array<{
    time: string;
    customer: string;
    address: string;
    service: string;
    status: string;
  }>;
}

const generateTechnicianData = (template: { services: { name: string }[] }): TechnicianData[] => [
  {
    id: 1,
    name: 'Maria Garcia',
    email: 'maria.garcia@businessflow.com',
    phone: '(555) 123-4567',
    status: 'active',
    rating: 4.9,
    totalJobs: 145,
    completedJobs: 142,
    cancelledJobs: 3,
    earnings: {
      today: 240,
      week: 1680,
      month: 11600,
    },
    availability: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: true,
      sun: false,
    },
    todaySchedule: [
      { time: '9:00 AM', customer: 'Sarah Johnson', address: '123 Oak Street', service: template.services[0]?.name || 'Service', status: 'completed' },
      { time: '1:00 PM', customer: 'Mike Wilson', address: '456 Pine Ave', service: template.services[1]?.name || 'Service', status: 'in_progress' },
      { time: '4:00 PM', customer: 'Emma Davis', address: '789 Elm Street', service: template.services[0]?.name || 'Service', status: 'scheduled' },
    ],
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@businessflow.com',
    phone: '(555) 234-5678',
    status: 'active',
    rating: 4.8,
    totalJobs: 132,
    completedJobs: 128,
    cancelledJobs: 4,
    earnings: {
      today: 150,
      week: 1470,
      month: 10560,
    },
    availability: {
      mon: true,
      tue: true,
      wed: false,
      thu: true,
      fri: true,
      sat: true,
      sun: true,
    },
    todaySchedule: [
      { time: '10:00 AM', customer: 'David Brown', address: '321 Market St', service: template.services[3]?.name || template.services[0]?.name || 'Service', status: 'completed' },
      { time: '2:00 PM', customer: 'Lisa Anderson', address: '654 Broadway', service: template.services[1]?.name || 'Service', status: 'scheduled' },
    ],
  },
  {
    id: 3,
    name: 'Anna Lee',
    email: 'anna.lee@businessflow.com',
    phone: '(555) 345-6789',
    status: 'active',
    rating: 4.9,
    totalJobs: 128,
    completedJobs: 126,
    cancelledJobs: 2,
    earnings: {
      today: 320,
      week: 1600,
      month: 10240,
    },
    availability: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: false,
      sun: false,
    },
    todaySchedule: [
      { time: '8:00 AM', customer: 'Robert Taylor', address: '987 Valencia St', service: template.services[2]?.name || template.services[0]?.name || 'Service', status: 'completed' },
      { time: '12:00 PM', customer: 'Jennifer Martinez', address: '111 Mission St', service: template.services[0]?.name || 'Service', status: 'completed' },
      { time: '3:00 PM', customer: 'William Chen', address: '222 Powell St', service: template.services[1]?.name || 'Service', status: 'scheduled' },
    ],
  },
  {
    id: 4,
    name: 'Robert Chen',
    email: 'robert.chen@businessflow.com',
    phone: '(555) 456-7890',
    status: 'inactive',
    rating: 4.7,
    totalJobs: 118,
    completedJobs: 115,
    cancelledJobs: 3,
    earnings: {
      today: 0,
      week: 980,
      month: 9440,
    },
    availability: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    },
    todaySchedule: [],
  },
  {
    id: 5,
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@businessflow.com',
    phone: '(555) 567-8901',
    status: 'active',
    rating: 4.8,
    totalJobs: 98,
    completedJobs: 96,
    cancelledJobs: 2,
    earnings: {
      today: 160,
      week: 1280,
      month: 7840,
    },
    availability: {
      mon: true,
      tue: false,
      wed: true,
      thu: true,
      fri: true,
      sat: true,
      sun: true,
    },
    todaySchedule: [
      { time: '11:00 AM', customer: 'James Wilson', address: '333 Bush St', service: template.services[0]?.name || 'Service', status: 'scheduled' },
      { time: '3:00 PM', customer: 'Patricia Moore', address: '444 Geary St', service: template.services[0]?.name || 'Service', status: 'scheduled' },
    ],
  },
];

export default function TechniciansPage() {
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { template } = useBusiness();

  // Generate technician data with dynamic services
  const techniciansData = generateTechnicianData(template);

  const filteredTechnicians = techniciansData.filter(technician => 
    statusFilter === 'all' || technician.status === statusFilter
  );

  const getAvailabilityDays = (availability: Record<string, boolean>) => {
    const availableDays = [];
    if (availability.mon) availableDays.push('Mon');
    if (availability.tue) availableDays.push('Tue');
    if (availability.wed) availableDays.push('Wed');
    if (availability.thu) availableDays.push('Thu');
    if (availability.fri) availableDays.push('Fri');
    if (availability.sat) availableDays.push('Sat');
    if (availability.sun) availableDays.push('Sun');
    return availableDays;
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{template.teamMemberPluralTitle} Management</h1>
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All {template.teamMemberPluralTitle}</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add New {template.teamMemberTitle}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active {template.teamMemberPluralTitle}</p>
              <p className="text-2xl font-bold text-gray-900">
                {techniciansData.filter(c => c.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {techniciansData.reduce((sum, c) => sum + c.todaySchedule.length, 0)}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${techniciansData.reduce((sum, c) => sum + c.earnings.today, 0)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {(techniciansData.reduce((sum, c) => sum + c.rating, 0) / techniciansData.length).toFixed(1)}
              </p>
            </div>
            <Star className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Technicians List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {template.teamMemberTitle}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Today&apos;s Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings (Month)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTechnicians.map((technician) => (
                <tr key={technician.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                      <div className="text-sm text-gray-500">{technician.email}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {technician.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      technician.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {technician.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm text-gray-900">{technician.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {technician.completedJobs}/{technician.totalJobs}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {technician.todaySchedule.length > 0 ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {technician.todaySchedule.length} appointments
                          </div>
                          <div className="text-gray-500">
                            {technician.todaySchedule[0].time} - {technician.todaySchedule[technician.todaySchedule.length - 1].time}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">No bookings today</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">${technician.earnings.month.toLocaleString()}</div>
                      <div className="text-gray-500">Today: ${technician.earnings.today}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getAvailabilityDays(technician.availability).join(', ') || 'Not available'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => setSelectedTechnician(technician.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Schedule
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {selectedTechnician && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {techniciansData.find(c => c.id === selectedTechnician)?.name}&apos;s Schedule
              </h3>
              <button 
                onClick={() => setSelectedTechnician(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {techniciansData.find(c => c.id === selectedTechnician)?.todaySchedule.map((appointment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {appointment.time}
                      </div>
                      <div className="font-medium text-gray-900">{appointment.customer}</div>
                      <div className="text-sm text-gray-600">{appointment.service}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {appointment.address}
                      </div>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )) || <p className="text-gray-500">No appointments scheduled for today.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}