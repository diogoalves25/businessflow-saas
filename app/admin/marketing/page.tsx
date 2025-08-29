'use client';

import { useState } from 'react';
import { 
  Mail, MessageSquare, Users, TrendingUp, Send, Plus, Edit, 
  Eye, Copy, Filter, BarChart3
} from 'lucide-react';

// Types
type EmailCampaign = {
  id: number;
  name: string;
  subject: string;
  status: string;
  sentDate?: string;
  scheduledDate?: string | null;
  recipients: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
};

type SMSCampaign = {
  id: number;
  name: string;
  message: string;
  status: string;
  sentDate?: string;
  scheduledDate?: string | null;
  recipients: number;
  replies: number;
  conversions: number;
  revenue: number;
};

// Mock data for campaigns
const campaignsData = {
  emailCampaigns: [
    {
      id: 1,
      name: 'January Cleaning Special',
      subject: '🎉 New Year, Clean Home - 20% Off First Booking!',
      status: 'sent',
      sentDate: '2024-01-05',
      recipients: 3250,
      opened: 1853,
      clicked: 427,
      conversions: 89,
      revenue: 7120,
    },
    {
      id: 2,
      name: 'Spring Deep Clean Promo',
      subject: 'Spring into Savings - Book Your Deep Clean Today',
      status: 'scheduled',
      scheduledDate: '2024-03-15',
      recipients: 2800,
      opened: 0,
      clicked: 0,
      conversions: 0,
      revenue: 0,
    },
    {
      id: 3,
      name: 'Customer Win-Back',
      subject: 'We Miss You! Come Back for 30% Off',
      status: 'draft',
      scheduledDate: null,
      recipients: 450,
      opened: 0,
      clicked: 0,
      conversions: 0,
      revenue: 0,
    },
  ],
  smsCampaigns: [
    {
      id: 1,
      name: 'Last Minute Availability',
      message: 'BusinessFlow: We have a last-minute opening tomorrow at 2 PM. Reply YES to book!',
      status: 'sent',
      sentDate: '2024-01-14',
      recipients: 125,
      replies: 34,
      conversions: 28,
      revenue: 2240,
    },
    {
      id: 2,
      name: 'Appointment Reminder',
      message: 'BusinessFlow: Reminder - Your cleaning is scheduled for tomorrow at 10 AM. Reply CANCEL to cancel.',
      status: 'scheduled',
      scheduledDate: '2024-01-16',
      recipients: 45,
      replies: 0,
      conversions: 0,
      revenue: 0,
    },
  ],
  customerSegments: [
    {
      id: 1,
      name: 'VIP Customers',
      description: 'Customers with 10+ bookings',
      count: 234,
      avgLTV: 2850,
      lastUpdated: '2024-01-10',
    },
    {
      id: 2,
      name: 'New Customers',
      description: 'First booking in last 30 days',
      count: 89,
      avgLTV: 125,
      lastUpdated: '2024-01-15',
    },
    {
      id: 3,
      name: 'Inactive Customers',
      description: 'No booking in last 90 days',
      count: 456,
      avgLTV: 680,
      lastUpdated: '2024-01-15',
    },
    {
      id: 4,
      name: 'Commercial Clients',
      description: 'Business accounts',
      count: 45,
      avgLTV: 8900,
      lastUpdated: '2024-01-12',
    },
  ],
  leadAnalytics: {
    totalLeads: 1234,
    convertedLeads: 234,
    conversionRate: 19,
    avgTimeToConvert: '3.2 days',
    topSource: 'Website Form',
    leadsBySource: [
      { source: 'Website Form', count: 456, conversion: 22 },
      { source: 'Google Ads', count: 345, conversion: 18 },
      { source: 'Facebook', count: 234, conversion: 15 },
      { source: 'Referral', count: 123, conversion: 32 },
      { source: 'Direct', count: 76, conversion: 12 },
    ],
  },
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'segments' | 'analytics'>('campaigns');
  const [campaignType, setCampaignType] = useState<'email' | 'sms'>('email');
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Hub</h1>
        <button 
          onClick={() => setShowCampaignBuilder(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{campaignsData.leadAnalytics.totalLeads.toLocaleString()}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{campaignsData.leadAnalytics.conversionRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <Send className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Campaign Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$9,360</p>
            </div>
            <BarChart3 className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {(['campaigns', 'segments', 'analytics'] as const).map((tab) => (
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

      {activeTab === 'campaigns' && (
        <>
          {/* Campaign Type Selector */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCampaignType('email')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                campaignType === 'email' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Campaigns
            </button>
            <button
              onClick={() => setCampaignType('sms')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                campaignType === 'sms' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Campaigns
            </button>
          </div>

          {/* Campaign List */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    {campaignType === 'email' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Open Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Click Rate
                        </th>
                      </>
                    )}
                    {campaignType === 'sms' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reply Rate
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(campaignType === 'email' ? campaignsData.emailCampaigns : campaignsData.smsCampaigns).map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">
                            {campaignType === 'email' 
                              ? (campaign as EmailCampaign).subject 
                              : (campaign as SMSCampaign).message.substring(0, 40) + '...'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === 'sent' 
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.sentDate || campaign.scheduledDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.recipients.toLocaleString()}
                      </td>
                      {campaignType === 'email' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.status === 'sent' ? `${(((campaign as EmailCampaign).opened / campaign.recipients) * 100).toFixed(1)}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.status === 'sent' ? `${(((campaign as EmailCampaign).clicked / campaign.recipients) * 100).toFixed(1)}%` : '-'}
                          </td>
                        </>
                      )}
                      {campaignType === 'sms' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.status === 'sent' ? `${(((campaign as SMSCampaign).replies / campaign.recipients) * 100).toFixed(1)}%` : '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.conversions || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.revenue > 0 ? `$${campaign.revenue.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaignsData.customerSegments.map((segment) => (
            <div key={segment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{segment.name}</h4>
                  <p className="text-sm text-gray-500">{segment.description}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg LTV</p>
                  <p className="text-2xl font-bold text-gray-900">${segment.avgLTV.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-xs text-gray-500">Updated {segment.lastUpdated}</p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                    Export
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    Campaign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Capture Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{campaignsData.leadAnalytics.totalLeads}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-gray-900">{campaignsData.leadAnalytics.convertedLeads}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{campaignsData.leadAnalytics.conversionRate}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Avg Time to Convert</p>
                <p className="text-2xl font-bold text-gray-900">{campaignsData.leadAnalytics.avgTimeToConvert}</p>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-3">Leads by Source</h4>
            <div className="space-y-3">
              {campaignsData.leadAnalytics.leadsBySource.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{source.source}</span>
                      <span className="text-sm text-gray-500">{source.count} leads ({source.conversion}% conversion)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(source.count / campaignsData.leadAnalytics.totalLeads) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Builder Modal */}
      {showCampaignBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Campaign</h3>
              <button 
                onClick={() => setShowCampaignBuilder(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="type" defaultChecked className="mr-2" />
                    <Mail className="w-4 h-4 mr-2 text-gray-600" />
                    Email Campaign
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="type" className="mr-2" />
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                    SMS Campaign
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="Spring Cleaning Special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                  <option>All Customers</option>
                  {campaignsData.customerSegments.map(segment => (
                    <option key={segment.id}>{segment.name} ({segment.count} customers)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="🌸 Spring Cleaning Special - 25% Off Deep Clean!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  rows={8}
                  placeholder="Hi {FirstName},

Spring is here! Time to refresh your home with our professional deep service.

For a limited time, enjoy 25% off your first deep clean booking. Our expert technicians will make your home sparkle from top to bottom.

Book now and experience:
✓ Eco-friendly cleaning products
✓ Trained & insured professionals
✓ 100% satisfaction guarantee

Use code SPRING25 at checkout.

Book Your Deep Clean Today → [CTA Button]

Best regards,
The BusinessFlow Team"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900">
                    <option>Send Now</option>
                    <option>Schedule for Later</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowCampaignBuilder(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Save as Draft
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Schedule Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}