'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';

export function DebugOverlay() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
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
      fontFamily: 'monospace'
    }}>
      <div>DEBUG INFO:</div>
      <div>Auth: {loading ? 'Loading...' : user ? 'Logged in' : 'Not logged in'}</div>
      <div>User: {user?.email || 'No user'}</div>
      <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'Loading'}</div>
      <div>Rendered at: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}