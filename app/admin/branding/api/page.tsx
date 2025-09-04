'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Code,
  Copy,
  Key,
  Globe,
  Terminal,
  Book,
  RefreshCw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export default function APIBrandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [whiteLabelSettings, setWhiteLabelSettings] = useState<any>(null);

  // Check if user has premium subscription
  useEffect(() => {
    // For now, allow all users to access API branding
    // In production, check subscription status from database
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/white-label');
      if (response.ok) {
        const settings = await response.json();
        setWhiteLabelSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const generateApiKey = () => {
    // In production, generate a secure API key
    const key = `${session?.user?.organizationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setApiKey(key);
    setShowApiKey(true);
    toast.success('API key generated successfully');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
      toast.success('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const organizationId = session?.user?.organizationId || 'YOUR_ORG_ID';
  const brandName = whiteLabelSettings?.brandName || 'BusinessFlow';
  const baseUrl = whiteLabelSettings?.removeBusinessFlowBranding
    ? `https://api.${brandName.toLowerCase().replace(/\s+/g, '')}.com`
    : `https://${organizationId}.api.businessflow.app`;

  const curlExamples = {
    getServices: `curl -X GET "${baseUrl}/v1/services" \\
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`,
    
    getBookings: `curl -X GET "${baseUrl}/v1/bookings" \\
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`,
    
    createBooking: `curl -X POST "${baseUrl}/v1/bookings" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "serviceId": "service_123",
    "customerId": "customer_456",
    "date": "2024-01-20",
    "time": "10:00 AM",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }'`,
    
    getAvailability: `curl -X GET "${baseUrl}/v1/availability" \\
  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`,
  };

  const jsExample = `// ${brandName} API Client
const ${brandName.replace(/\s+/g, '')}API = {
  baseUrl: '${baseUrl}',
  apiKey: '${apiKey || 'YOUR_API_KEY'}',
  
  async request(endpoint, options = {}) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }
    
    return response.json();
  },
  
  // Get all services
  async getServices() {
    return this.request('/v1/services');
  },
  
  // Create a booking
  async createBooking(bookingData) {
    return this.request('/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  
  // Get availability
  async getAvailability(date) {
    return this.request(\`/v1/availability?date=\${date}\`);
  }
};

// Usage example
${brandName.replace(/\s+/g, '')}API.getServices()
  .then(data => console.log(data))
  .catch(err => console.error(err));`;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API White Labeling</h1>
        <p className="text-muted-foreground">
          Provide a branded API experience for your developers
        </p>
      </div>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Your API is accessible at: <code className="font-mono">{baseUrl}</code>
          {whiteLabelSettings?.customDomain && (
            <span className="block mt-1">
              Custom domain API: <code className="font-mono">https://api.{whiteLabelSettings.customDomain}</code>
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>
            Generate and manage API keys for accessing your branded API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!apiKey ? (
            <Button onClick={generateApiKey}>
              <Key className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Your API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiKey, 'apikey')}
                  >
                    {copiedCode === 'apikey' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Keep this key secure. It provides full access to your API.
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> In production, API keys should be stored securely
                  in your database and never exposed in client-side code.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
              <CardDescription>
                RESTful API endpoints for your {brandName} platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/v1/services</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    List all available services
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/v1/bookings</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Retrieve all bookings
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>POST</Badge>
                    <code className="text-sm font-mono">/v1/bookings</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a new booking
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm font-mono">/v1/availability</code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check service availability
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(curlExamples).map(([key, example]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {key === 'getServices' && 'Get Services'}
                  {key === 'getBookings' && 'Get Bookings'}
                  {key === 'createBooking' && 'Create Booking'}
                  {key === 'getAvailability' && 'Get Availability'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{example}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(example, key)}
                  >
                    {copiedCode === key ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JavaScript SDK</CardTitle>
              <CardDescription>
                A simple JavaScript client for your {brandName} API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{jsExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(jsExample, 'js')}
                >
                  {copiedCode === 'js' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Comprehensive documentation for your branded API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Book className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Getting Started Guide</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Learn how to authenticate and make your first API call
                    </p>
                    <Button variant="outline" size="sm">
                      View Guide
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Terminal className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">API Reference</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detailed documentation for all endpoints
                    </p>
                    <Button variant="outline" size="sm">
                      View Reference
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertDescription>
                  Your branded API documentation is available at:{' '}
                  <a
                    href={`${baseUrl}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono underline"
                  >
                    {baseUrl}/docs
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}