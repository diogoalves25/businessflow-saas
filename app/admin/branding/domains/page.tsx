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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'active' | 'failed';
  verifiedAt?: string;
  sslStatus: 'pending' | 'active' | 'expired' | 'error';
  cnameVerified: boolean;
  txtVerified: boolean;
}

export default function CustomDomainsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  // Check if user has premium subscription
  useEffect(() => {
    // For now, allow all users to access domain management
    // In production, check subscription status from database
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/admin/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const addDomain = async () => {
    if (!newDomain) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (response.ok) {
        const domain = await response.json();
        setDomains([...domains, domain]);
        setNewDomain('');
        toast.success('Domain added successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add domain');
      }
    } catch (error) {
      toast.error('Failed to add domain');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    setIsVerifying(domainId);
    try {
      const response = await fetch(`/api/admin/domains/${domainId}/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.verified) {
          toast.success('Domain verified successfully!');
          fetchDomains();
        } else {
          const errors = result.errors?.join(', ') || 'Verification failed';
          toast.error(errors);
        }
      }
    } catch (error) {
      toast.error('Failed to verify domain');
    } finally {
      setIsVerifying(null);
    }
  };

  const removeDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to remove this domain?')) return;

    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDomains(domains.filter(d => d.id !== domainId));
        toast.success('Domain removed successfully');
      }
    } catch (error) {
      toast.error('Failed to remove domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const organizationId = session?.user?.organizationId || 'YOUR_ORG_ID';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Custom Domains</h1>
        <p className="text-muted-foreground">
          Use your own domain for a fully white-labeled experience
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All custom domains are automatically secured with SSL certificates via Let's Encrypt.
          DNS changes may take up to 48 hours to propagate.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Add Custom Domain</CardTitle>
          <CardDescription>
            Enter your domain name without http:// or https://
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="booking.yourbusiness.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={addDomain} disabled={isLoading || !newDomain}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Add Domain
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {domains.map((domain) => (
        <Card key={domain.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {domain.domain}
                  <Badge variant={domain.status === 'active' ? 'success' : 'secondary'}>
                    {domain.status}
                  </Badge>
                  {domain.sslStatus === 'active' && (
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      SSL
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {domain.verifiedAt
                    ? `Verified on ${new Date(domain.verifiedAt).toLocaleDateString()}`
                    : 'Pending verification'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {domain.status !== 'active' && (
                  <Button
                    variant="outline"
                    onClick={() => verifyDomain(domain.id)}
                    disabled={isVerifying === domain.id}
                  >
                    {isVerifying === domain.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Verify
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDomain(domain.id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dns" className="w-full">
              <TabsList>
                <TabsTrigger value="dns">DNS Configuration</TabsTrigger>
                <TabsTrigger value="status">Verification Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dns" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. CNAME Record</h4>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono">Type: CNAME</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('CNAME')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono">Host: {domain.domain}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(domain.domain)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono">
                          Value: {organizationId}.businessflow.app
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${organizationId}.businessflow.app`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. TXT Record (for verification)</h4>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono">Type: TXT</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('TXT')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono">
                          Host: _businessflow.{domain.domain}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`_businessflow.${domain.domain}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono">
                          Value: businessflow-verify={organizationId}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`businessflow-verify=${organizationId}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {domain.cnameVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>CNAME Record</span>
                    </div>
                    <Badge variant={domain.cnameVerified ? 'success' : 'destructive'}>
                      {domain.cnameVerified ? 'Verified' : 'Not Found'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {domain.txtVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>TXT Verification</span>
                    </div>
                    <Badge variant={domain.txtVerified ? 'success' : 'destructive'}>
                      {domain.txtVerified ? 'Verified' : 'Not Found'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {domain.sslStatus === 'active' ? (
                        <Shield className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span>SSL Certificate</span>
                    </div>
                    <Badge
                      variant={
                        domain.sslStatus === 'active'
                          ? 'success'
                          : domain.sslStatus === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {domain.sslStatus}
                    </Badge>
                  </div>
                </div>

                {domain.status !== 'active' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Complete all verification steps above, then click "Verify" to activate your domain.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}

      {domains.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No custom domains yet</h3>
            <p className="text-muted-foreground">
              Add your first custom domain to start using your own branding
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}