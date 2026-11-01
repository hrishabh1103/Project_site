import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Dedicated Administrator Credentials
export const ADMIN_EMAIL = 'admin@hrishabhgupta.com';
export const ADMIN_PASSWORD = 'Manya@1103';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Supabase Session check if configured
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL) {
          setSession(session);
          setUser(session.user);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL) {
          setSession(session);
          setUser(session.user);
        } else if (!session) {
          setUser(null);
          setSession(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Standalone Production Mode: Validate saved session against authorized admin
      const savedUser = localStorage.getItem('projectvault_auth_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.email?.toLowerCase() === ADMIN_EMAIL) {
            setUser(parsed);
            setSession({
              access_token: 'pv-auth-token-active',
              token_type: 'bearer',
              expires_in: 86400 * 7,
              refresh_token: 'pv-refresh-token',
              user: parsed,
            } as any);
          } else {
            // Purge any unauthorized or legacy demo sessions
            localStorage.removeItem('projectvault_auth_user');
            localStorage.removeItem('projectvault_demo_user');
            setUser(null);
            setSession(null);
          }
        } catch {
          setUser(null);
          setSession(null);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check credentials against dedicated administrator ID & password
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: any = {
        id: 'owner-hrishabh-gupta',
        email: ADMIN_EMAIL,
        app_metadata: { provider: 'email', role: 'owner' },
        user_metadata: { full_name: 'Hrishabh Gupta' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      // Also authenticate with Supabase if configured
      if (isSupabaseConfigured) {
        const { error: supaError, data } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (!supaError && data.session) {
          setUser(data.session.user);
          setSession(data.session);
          return { error: null };
        }
      }

      // Grant standalone authorized session
      localStorage.setItem('projectvault_auth_user', JSON.stringify(adminUser));
      setUser(adminUser);
      setSession({
        access_token: 'pv-auth-token-' + Date.now(),
        token_type: 'bearer',
        expires_in: 86400 * 7,
        refresh_token: 'pv-refresh-token',
        user: adminUser,
      } as any);

      return { error: null };
    }

    // Try Supabase auth if configured and user entered different credentials
    if (isSupabaseConfigured) {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (!error && data.session?.user?.email?.toLowerCase() === ADMIN_EMAIL) {
        setUser(data.session.user);
        setSession(data.session);
        return { error: null };
      }
    }

    // Strictly reject any unauthorized access attempt
    return {
      error: new Error('Invalid email or password. Access is strictly restricted to the authorized administrator.'),
    };
  };

  const signUp = async (): Promise<{ error: Error | null }> => {
    return {
      error: new Error('Public registration is disabled. Only the system owner may access administrative controls.'),
    };
  };

  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('projectvault_auth_user');
    localStorage.removeItem('projectvault_demo_user');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
