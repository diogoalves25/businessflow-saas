'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({
    environment: {},
    supabase: { status: 'checking...' },
    auth: { status: 'checking...' },
    deployment: {},
    errors: []
  });

  useEffect(() => {
    const checkEnvironment = async () => {
      const info: any = {
        environment: {},
        supabase: {},
        auth: {},
        deployment: {},
        errors: []
      };

      try {
        // Check environment variables (masked for security)
        info.environment = {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '❌ Missing',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '❌ Missing',
          DATABASE_URL: process.env.DATABASE_URL ? '✓ Set' : '❌ Missing',
          DIRECT_URL: process.env.DIRECT_URL ? '✓ Set' : '❌ Missing',
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
          
          // Show actual values for debugging (remove in production!)
          _SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          _SUPABASE_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        };

        // Check Supabase connection
        const supabase = createClient();
        
        // Test Supabase connection
        try {
          const { data, error } = await supabase.from('Organization').select('count').limit(1);
          if (error) {
            info.supabase.status = '❌ Connection failed';
            info.supabase.error = error.message;
            info.errors.push(`Supabase: ${error.message}`);
          } else {
            info.supabase.status = '✓ Connected';
            info.supabase.canQueryDatabase = true;
          }
        } catch (e) {
          info.supabase.status = '❌ Connection error';
          info.supabase.error = e instanceof Error ? e.message : 'Unknown error';
          info.errors.push(`Supabase connection: ${e}`);
        }

        // Check authentication
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) {
            info.auth.status = '❌ Auth error';
            info.auth.error = error.message;
            info.errors.push(`Auth: ${error.message}`);
          } else if (user) {
            info.auth.status = '✓ Authenticated';
            info.auth.user = {
              id: user.id,
              email: user.email,
              created: user.created_at
            };
          } else {
            info.auth.status = '⚠️ Not authenticated';
          }

          // Check session
          const { data: { session } } = await supabase.auth.getSession();
          info.auth.hasSession = !!session;
          info.auth.sessionExpiry = session?.expires_at;
        } catch (e) {
          info.auth.status = '❌ Auth check failed';
          info.auth.error = e instanceof Error ? e.message : 'Unknown error';
          info.errors.push(`Auth check: ${e}`);
        }

        // Check deployment info
        info.deployment = {
          buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'Unknown',
          vercelEnv: process.env.VERCEL_ENV || 'Unknown',
          vercelUrl: process.env.VERCEL_URL || 'Unknown',
          gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || 'Unknown',
          gitBranch: process.env.VERCEL_GIT_COMMIT_REF || 'Unknown',
        };

        // Check API endpoints
        try {
          const orgResponse = await fetch('/api/organizations?demo=true');
          info.api = {
            organizationsEndpoint: orgResponse.ok ? '✓ Working' : `❌ Failed (${orgResponse.status})`,
          };
        } catch (e) {
          info.api = { organizationsEndpoint: '❌ Network error' };
          info.errors.push(`API check: ${e}`);
        }

      } catch (error) {
        info.errors.push(`Debug check failed: ${error}`);
      }

      setDebugInfo(info);
    };

    checkEnvironment();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      {/* Errors */}
      {debugInfo.errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h2 className="font-bold mb-2">Errors:</h2>
          <ul className="list-disc pl-5">
            {debugInfo.errors.map((error: string, i: number) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Environment Variables */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.environment, null, 2)}
          </pre>
        </div>
      </section>

      {/* Supabase Status */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Supabase Connection</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.supabase, null, 2)}
          </pre>
        </div>
      </section>

      {/* Auth Status */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.auth, null, 2)}
          </pre>
        </div>
      </section>

      {/* Deployment Info */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Deployment Information</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.deployment, null, 2)}
          </pre>
        </div>
      </section>

      {/* API Status */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo.api, null, 2)}
          </pre>
        </div>
      </section>

      {/* Test Actions */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login Page
          </button>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
          >
            Force Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}