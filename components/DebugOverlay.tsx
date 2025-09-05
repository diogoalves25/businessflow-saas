'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';

export function DebugOverlay() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [renderCount, setRenderCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    
    try {
      const supabase = createClient();
      supabase.auth.getUser()
        .then(({ data, error }) => {
          if (error) {
            setError(error.message);
          } else {
            setUser(data.user);
          }
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } catch (err) {
      setError('Failed to create Supabase client');
      setLoading(false);
    }
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'red',
      color: 'white',
      padding: '10px',
      zIndex: 9999999,
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold' }}>DEBUG INFO:</div>
      <div>Auth: {loading ? 'Loading...' : user ? 'Logged in' : 'Not logged in'}</div>
      <div>User: {user?.email || 'No user'}</div>
      <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</div>
      <div>Renders: {renderCount}</div>
      {error && <div style={{ color: 'yellow' }}>Error: {error}</div>}
      <div>Time: {new Date().toLocaleTimeString()}</div>
      <div style={{ marginTop: '5px', fontSize: '10px' }}>
        Body has content: {typeof document !== 'undefined' ? document.body.children.length : 'SSR'}
      </div>
    </div>
  );
}