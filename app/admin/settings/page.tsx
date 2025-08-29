'use client';

import { useState } from 'react';
import { 
  Building2, MapPin, Bell, Shield, 
  Users, Globe, Smartphone, Mail, Save, Plus, Trash2, 
  CheckCircle, AlertCircle, Phone
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('locations');
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: 'San Francisco Main',
      address: '123 Main St, San Francisco, CA 94102',
      phone: '(555) 100-1000',
      email: 'sf@businessflow.com',
      serviceArea: 'San Francisco, South San Francisco, Daly City',
      active: true,
      manager: 'John Smith',
      technicians: 12,
    },
    {
      id: 2,
      name: 'Oakland Branch',
      address: '456 Broadway, Oakland, CA 94607',
      phone: '(555) 100-2000',
      email: 'oakland@businessflow.com',
      serviceArea: 'Oakland, Berkeley, Alameda',
      active: true,
      manager: 'Maria Garcia',
      technicians: 8,
    },
    {
      id: 3,
      name: 'San Jose Office',
      address: '789 Market St, San Jose, CA 95113',
      phone: '(555) 100-3000',
      email: 'sj@businessflow.com',
      serviceArea: 'San Jose, Sunnyvale, Santa Clara',
      active: false,
      manager: 'Anna Lee',
      technicians: 4,
    },
  ]);

  const [businessSettings, setBusinessSettings] = useState({
    companyName: 'BusinessFlow Services',
    businessEmail: 'info@businessflow.com',
    businessPhone: '(555) 100-0000',
    website: 'https://businessflow.com',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    bookingBuffer: '30',
    cancellationPolicy: '24',
    autoConfirm: true,
    requireDeposit: false,
    depositAmount: '25',
  });

  const [integrations] = useState({
    stripe: { connected: true, key: 'sk_test_••••••••••••' },
    twilio: { connected: false, key: '' },
    google: { connected: true, key: 'AIza••••••••••••' },
    mailchimp: { connected: false, key: '' },
    quickbooks: { connected: true, key: 'qb_••••••••••••' },
    slack: { connected: false, key: '' },
  });

  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailCancellation: true,
    emailReminder: true,
    smsReminder: false,
    smsConfirmation: false,
    pushNotifications: true,
    dailyReport: true,
    weeklyReport: false,
    monthlyReport: true,
  });

  const tabs = [
    { id: 'locations', name: 'Locations', icon: Building2 },
    { id: 'business', name: 'Business Info', icon: Globe },
    { id: 'integrations', name: 'Integrations', icon: Smartphone },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const handleAddLocation = () => {
    const newLocation = {
      id: locations.length + 1,
      name: 'New Location',
      address: '',
      phone: '',
      email: '',
      serviceArea: '',
      active: false,
      manager: '',
      technicians: 0,
    };
    setLocations([...locations, newLocation]);
  };

  const handleDeleteLocation = (id: number) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button 
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'locations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Location Management</h3>
              <button 
                onClick={handleAddLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </button>
            </div>

            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{location.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        location.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {location.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <input
                          type="text"
                          value={location.address}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                          placeholder="Location address"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <input
                          type="text"
                          value={location.phone}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <input
                          type="email"
                          value={location.email}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                          placeholder="Location email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <input
                          type="text"
                          value={location.manager}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                          placeholder="Manager name"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                      <input
                        type="text"
                        value={location.serviceArea}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                        placeholder="Cities and neighborhoods served"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>{location.technicians} technicians assigned</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={location.active}
                        className="mr-2"
                        onChange={() => {}}
                      />
                      Active Location
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={businessSettings.companyName}
                  onChange={(e) => setBusinessSettings({...businessSettings, companyName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                <input
                  type="email"
                  value={businessSettings.businessEmail}
                  onChange={(e) => setBusinessSettings({...businessSettings, businessEmail: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                <input
                  type="tel"
                  value={businessSettings.businessPhone}
                  onChange={(e) => setBusinessSettings({...businessSettings, businessPhone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={businessSettings.website}
                  onChange={(e) => setBusinessSettings({...businessSettings, website: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={businessSettings.timezone}
                  onChange={(e) => setBusinessSettings({...businessSettings, timezone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/New_York">Eastern Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={businessSettings.currency}
                  onChange={(e) => setBusinessSettings({...businessSettings, currency: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>
            </div>

            <h4 className="text-md font-semibold text-gray-900 mt-8 mb-4">Booking Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Buffer Time (minutes)</label>
                <input
                  type="number"
                  value={businessSettings.bookingBuffer}
                  onChange={(e) => setBusinessSettings({...businessSettings, bookingBuffer: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy (hours)</label>
                <input
                  type="number"
                  value={businessSettings.cancellationPolicy}
                  onChange={(e) => setBusinessSettings({...businessSettings, cancellationPolicy: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConfirm"
                  checked={businessSettings.autoConfirm}
                  onChange={(e) => setBusinessSettings({...businessSettings, autoConfirm: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="autoConfirm" className="text-sm font-medium text-gray-700">
                  Auto-confirm bookings
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireDeposit"
                  checked={businessSettings.requireDeposit}
                  onChange={(e) => setBusinessSettings({...businessSettings, requireDeposit: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="requireDeposit" className="text-sm font-medium text-gray-700">
                  Require deposit for bookings
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Third-party Integrations</h3>
            <div className="space-y-4">
              {Object.entries(integrations).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        value.connected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {value.connected ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{key}</h4>
                        <p className="text-sm text-gray-500">
                          {value.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg ${
                      value.connected 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {value.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                  {value.connected && value.key && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={value.key}
                        readOnly
                        className="w-full border border-gray-300 rounded-md bg-gray-50 px-3 py-2 text-gray-900"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.emailNewBooking}
                      onChange={(e) => setNotifications({...notifications, emailNewBooking: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">New booking notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.emailCancellation}
                      onChange={(e) => setNotifications({...notifications, emailCancellation: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">Cancellation notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.emailReminder}
                      onChange={(e) => setNotifications({...notifications, emailReminder: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">Booking reminders</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">SMS Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.smsReminder}
                      onChange={(e) => setNotifications({...notifications, smsReminder: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">SMS booking reminders</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.smsConfirmation}
                      onChange={(e) => setNotifications({...notifications, smsConfirmation: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">SMS booking confirmations</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Reports</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.dailyReport}
                      onChange={(e) => setNotifications({...notifications, dailyReport: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">Daily summary report</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReport}
                      onChange={(e) => setNotifications({...notifications, weeklyReport: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">Weekly performance report</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.monthlyReport}
                      onChange={(e) => setNotifications({...notifications, monthlyReport: e.target.checked})}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">Monthly financial report</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Password Requirements</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-3" />
                    <span className="text-sm text-gray-700">Minimum 8 characters</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-3" />
                    <span className="text-sm text-gray-700">Require uppercase and lowercase letters</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-3" />
                    <span className="text-sm text-gray-700">Require numbers</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-3" />
                    <span className="text-sm text-gray-700">Require special characters</span>
                  </label>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enable 2FA
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Device</p>
                      <p className="text-sm text-gray-500">Chrome on Windows - San Francisco, CA</p>
                    </div>
                    <span className="text-xs text-green-600">Active now</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">iPhone 12</p>
                      <p className="text-sm text-gray-500">Safari on iOS - San Francisco, CA</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}