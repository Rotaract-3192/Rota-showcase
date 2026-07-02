'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase';
import { authService, AuthUserProfile } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profileData: AuthUserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profileData: null,
  isLoading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profileData, setProfileData] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = async (authId: string) => {
    const data = await authService.getFullUserProfile(authId);
    setProfileData(data);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileData(user.id);
    }
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
        setUser(activeSession?.user ?? null);
        
        if (activeSession?.user) {
          await fetchProfileData(activeSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        if (event === 'SIGNED_IN') {
          await fetchProfileData(currentSession.user.id);
        }
      } else {
        setProfileData(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, profileData, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
