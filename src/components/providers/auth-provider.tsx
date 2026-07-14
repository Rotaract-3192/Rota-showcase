'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { AuthUserProfile } from '@/services/auth.service';

interface AuthContextType {
  user: any | null; // Clerk user
  session: any | null;
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
  const { isLoaded, isSignedIn, user } = useUser();
  const { sessionId } = useClerkAuth();
  
  const [profileData, setProfileData] = useState<AuthUserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchProfileData = async (clerkUser: any) => {
    try {
      const res = await fetch('/api/profile/me');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      } else {
        console.error('Failed to fetch profile', await res.text());
        setProfileData(null);
      }
    } catch (err) {
      console.error('Failed to fetch/provision profile', err);
      setProfileData(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileData(user);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        fetchProfileData(user).finally(() => setIsProfileLoading(false));
      } else {
        setProfileData(null);
        setIsProfileLoading(false);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session: sessionId ? { id: sessionId } : null, 
        profileData, 
        isLoading: !isLoaded || isProfileLoading, 
        refreshProfile 
      }}
    >
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
