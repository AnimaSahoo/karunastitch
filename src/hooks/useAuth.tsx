import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  otpVerified: boolean;
  isFullyAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendOTP: () => Promise<{ error: Error | null }>;
  verifyOTP: (code: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const isFullyAuthenticated = !!user && (!requires2FA || otpVerified);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        logger.error('checkAdminRole', error);
        return false;
      }

      return !!data;
    } catch (error) {
      logger.error('checkAdminRole', error);
      return false;
    }
  };

  const checkAndCreateProfile = async (userId: string, userMetadata?: Record<string, unknown>) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('two_fa_enabled')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('checkProfile', error);
        return false;
      }

      if (!profile) {
        // Create profile for first-time login
        await supabase.from('profiles').insert({
          user_id: userId,
          full_name: (userMetadata?.full_name as string) || null,
          terms_accepted_at: (userMetadata?.terms_accepted_at as string) || null,
        });
        return false; // New profile, 2FA not enabled
      }

      return profile.two_fa_enabled || false;
    } catch (error) {
      logger.error('checkAndCreateProfile', error);
      return false;
    }
  };

  const initializeUser = async (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      const [adminStatus, has2FA] = await Promise.all([
        checkAdminRole(currentSession.user.id),
        checkAndCreateProfile(currentSession.user.id, currentSession.user.user_metadata),
      ]);

      setIsAdmin(adminStatus);
      setRequires2FA(has2FA);

      if (has2FA) {
        const verified = sessionStorage.getItem(`otp_verified_${currentSession.user.id}`);
        setOtpVerified(verified === 'true');
      } else {
        setOtpVerified(true);
      }
    } else {
      setIsAdmin(false);
      setRequires2FA(false);
      setOtpVerified(false);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        // Use setTimeout to avoid race conditions with Supabase internals
        setTimeout(() => initializeUser(currentSession), 0);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      initializeUser(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Session timeout after 30 minutes of inactivity
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) {
      timeoutRef.current = setTimeout(() => {
        signOut();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, resetInactivityTimer]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          terms_accepted_at: new Date().toISOString(),
        },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (user) {
      sessionStorage.removeItem(`otp_verified_${user.id}`);
    }
    await supabase.auth.signOut();
    setIsAdmin(false);
    setRequires2FA(false);
    setOtpVerified(false);
  };

  const sendOTP = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp');

      if (error) {
        return { error: new Error('Failed to send verification code. Please try again.') };
      }

      if (data?.error) {
        return { error: new Error(data.error) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyOTP = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { code },
      });

      if (error) {
        return { error: new Error('Verification failed. Please try again.') };
      }

      if (data?.verified) {
        setOtpVerified(true);
        if (user) {
          sessionStorage.setItem(`otp_verified_${user.id}`, 'true');
        }
        return { error: null };
      }

      return { error: new Error(data?.error || 'Invalid verification code') };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        requires2FA,
        otpVerified,
        isFullyAuthenticated,
        signIn,
        signUp,
        signOut,
        sendOTP,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
