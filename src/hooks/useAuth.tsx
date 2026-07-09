import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'supervisor';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await apiClient.get('/auth/me');
      setUser(data.user || data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setError(null);
  };

  return { user, loading, checkUser, signOut, error };
}
