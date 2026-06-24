'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { currentAdmin, setCredentials, role, toggleRole } = useAdminStore();

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.authenticated) {
        setCredentials(data.user, data.user.role);
      } else {
        // Clear local state if unauthenticated
        setCredentials(
          { id: '', name: 'Guest', email: '', role: 'MANAGER', avatar: 'G', status: 'INACTIVE', lastLogin: '' },
          'MANAGER'
        );
      }
    } catch (error) {
      console.error('Failed to verify session:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setCredentials(
          { id: '', name: 'Guest', email: '', role: 'MANAGER', avatar: 'G', status: 'INACTIVE', lastLogin: '' },
          'MANAGER'
        );
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    user: currentAdmin,
    role,
    loading,
    logout,
    checkSession,
    toggleRole,
  };
}
