'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for authenticated user in session/local storage
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setAuthState({
            user: JSON.parse(storedUser),
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      router.push('/dashboard');
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = authState.user?.role === 'admin';

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!authState.user,
  };
}