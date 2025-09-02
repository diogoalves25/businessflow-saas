'use client';

import { useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutUtility() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const clearAllAuth = async () => {
    setLoading(true);
    setStatus('Clearing authentication...');

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setStatus(`Supabase signout error: ${error.message}`);
      } else {
        setStatus('Successfully signed out from Supabase');
      }

      // Clear all cookies (client-side)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();

      setTimeout(() => {
        setStatus('All authentication cleared! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }, 1000);

    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (session || user) {
        setStatus(`Active session found: ${user?.email || 'Unknown user'}`);
      } else {
        setStatus('No active session found');
      }
    } catch (error) {
      setStatus(`Error checking auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Utility</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Clear All Authentication</h2>
          <p className="text-gray-600 mb-4">
            This will sign you out of Supabase and clear all cookies, localStorage, and sessionStorage.
          </p>
          <button
            onClick={clearAllAuth}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Clear All Authentication'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Check Authentication Status</h2>
          <button
            onClick={checkAuthStatus}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Auth Status'}
          </button>
        </div>

        {status && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Status:</h3>
            <pre className="text-sm">{status}</pre>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-500">
          <p>Debug URLs:</p>
          <ul className="list-disc pl-5 mt-2">
            <li><a href="/debug" className="text-blue-600 hover:underline">/debug</a> - General debug info</li>
            <li><a href="/api/auth-debug" className="text-blue-600 hover:underline">/api/auth-debug</a> - Auth debug API</li>
            <li><a href="/login" className="text-blue-600 hover:underline">/login</a> - Login page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}