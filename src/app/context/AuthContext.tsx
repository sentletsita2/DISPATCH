import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  idNumber: string;
  role: 'DRIVER' | 'PASSENGER' | 'ADMIN';
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  wallet?: { balance: number | string };
  driverProfile?: {
    isClockedIn: boolean;
    isVerified: boolean;
    vehicleMake?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    vehicleColor?: string;
    documents?: { docType: string; status: string; fileUrl: string }[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updates: Partial<User>) => void;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  dob: string;
  idNumber: string;
  role: 'DRIVER' | 'PASSENGER';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('dispatch_token');
    const storedUser  = localStorage.getItem('dispatch_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('dispatch_token', t);
    localStorage.setItem('dispatch_user', JSON.stringify(u));
  };

  const login = async (identifier: string, password: string) => {
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error ?? 'Login failed' };
      persistSession(data.user, data.accessToken);
      if (data.refreshToken) localStorage.setItem('dispatch_refresh', data.refreshToken);
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to server' };
    }
  };

  const register = async (formData: RegisterData) => {
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        // Zod flatten error or plain string
        const msg = typeof data.error === 'string'
          ? data.error
          : data.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().join(', ')
            : 'Registration failed';
        return { success: false, error: msg };
      }
      persistSession(data.user, data.accessToken);
      if (data.refreshToken) localStorage.setItem('dispatch_refresh', data.refreshToken);
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to server' };
    }
  };

  const logout = () => {
    const refresh = localStorage.getItem('dispatch_refresh');
    if (refresh) {
      fetch(`${API}/auth/logout`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken: refresh }),
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('dispatch_token');
    localStorage.removeItem('dispatch_user');
    localStorage.removeItem('dispatch_refresh');
  };

  const refreshUser = useCallback(async () => {
    const t = token ?? localStorage.getItem('dispatch_token');
    if (!t) return;
    try {
      const res  = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
      localStorage.setItem('dispatch_user', JSON.stringify(data));
    } catch {}
  }, [token]);

  const updateLocalUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('dispatch_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
