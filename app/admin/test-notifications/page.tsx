'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Bell, Send, CheckCircle, XCircle } from 'lucide-react';
import { useSubscription } from '@/src/hooks/useSubscription';

export default function TestNotificationsPage() {
  const { subscription, canAccess } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testResults, setTestResults] = useState<{
    email?: { success: boolean; message: string };
    sms?: { success: boolean; message: string };
  }>({});

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test-notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          email: { success: true, message: 'Email sent successfully!' }
        }));
        toast.success('Test email sent!');
      } else {
        setTestResults(prev => ({
          ...prev,
          email: { success: false, message: result.error || 'Failed to send email' }
        }));
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        email: { success: false, message: 'Network error' }
      }));
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!canAccess('hasMarketingTools')) {
      toast.error('SMS notifications require Growth plan or higher');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test-notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          sms: { success: true, message: 'SMS sent successfully!' }
        }));
        toast.success('Test SMS sent!');
      } else {
        setTestResults(prev => ({
          ...prev,
          sms: { success: false, message: result.error || 'Failed to send SMS' }
        }));
        toast.error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        sms: { success: false, message: 'Network error' }
      }));
      toast.error('Failed to send test SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleTestReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cron/send-reminders', {
        method: 'POST',
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Sent ${result.sent} reminders, ${result.failed} failed`);
      } else {
        toast.error('Failed to trigger reminder job');
      }
    } catch (error) {
      toast.error('Failed to trigger reminder job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Notifications</h1>
        <p className="text-gray-600">Test your email and SMS notification settings</p>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Test Email Notifications</CardTitle>
              <CardDescription>
                Send a test email to verify your Resend configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Button
                onClick={handleTestEmail}
                disabled={loading}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>

              {testResults.email && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  testResults.email.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {testResults.email.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      testResults.email.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResults.email.message}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Check your inbox for the test email
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Test SMS Notifications</CardTitle>
              <CardDescription>
                Send a test SMS to verify your Twilio configuration (Growth+ plans only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canAccess('hasMarketingTools') && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 font-medium">SMS notifications require Growth plan or higher</p>
                  <p className="text-sm text-yellow-700 mt-1">Upgrade your plan to enable SMS notifications</p>
                </div>
              )}

              <div>
                <Label htmlFor="test-phone">Test Phone Number</Label>
                <Input
                  id="test-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
              </div>

              <Button
                onClick={handleTestSMS}
                disabled={loading || !canAccess('hasMarketingTools')}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test SMS
              </Button>

              {testResults.sms && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  testResults.sms.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {testResults.sms.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      testResults.sms.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResults.sms.message}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Test Reminder Job</CardTitle>
              <CardDescription>
                Manually trigger the reminder job to send notifications for upcoming bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">About Reminder Notifications</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Reminders are sent 24 hours before appointments</li>
                  <li>• The job runs automatically every hour</li>
                  <li>• Email reminders are sent to all customers</li>
                  <li>• SMS reminders are sent to Growth+ customers only</li>
                </ul>
              </div>

              <Button
                onClick={handleTestReminders}
                disabled={loading}
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                Trigger Reminder Job Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Resend API Key</span>
              <span className={`font-medium ${
                process.env.NEXT_PUBLIC_APP_URL ? 'text-green-600' : 'text-red-600'
              }`}>
                {process.env.NEXT_PUBLIC_APP_URL ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Twilio Account</span>
              <span className={`font-medium ${
                process.env.NEXT_PUBLIC_APP_URL ? 'text-green-600' : 'text-red-600'
              }`}>
                {process.env.NEXT_PUBLIC_APP_URL ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">SMS Feature Access</span>
              <span className={`font-medium ${
                canAccess('hasMarketingTools') ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {canAccess('hasMarketingTools') ? 'Enabled' : 'Requires Growth+ plan'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}