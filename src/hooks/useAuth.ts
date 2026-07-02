import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/providers/auth-provider';

export function useAuth() {
  const { user, session, profileData, isLoading } = useAuthContext();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardRoute = (primaryRole: string | undefined): string => {
    switch (primaryRole) {
      case 'Super Admin':
      case 'District':
        return '/district/dashboard';
      case 'President':
      case 'Board Member':
      case 'General Member':
        return '/portal/dashboard';
      default:
        return '/'; // Public showcase for non-rotaractors
    }
  };

  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) throw signInError;
      
      // The onAuthStateChange in AuthProvider will fetch the profile automatically.
      // But we need the profile immediately to route the user correctly.
      if (data.user) {
        // Simple artificial delay or immediate query to route
        // A robust way is to just route to /portal and let middleware/dashboards redirect further,
        // but since we want role-based routing immediately:
        const { data: profile } = await supabase.from('member_profiles').select('id').eq('auth_id', data.user.id).single();
        if (profile) {
          const { data: roles } = await supabase.from('member_roles').select('role').eq('member_id', profile.id);
          const roleNames = (roles || []).map(r => r.role);
          let primaryRole = 'General Member';
          if (roleNames.includes('District')) primaryRole = 'District';
          else if (roleNames.includes('President')) primaryRole = 'President';
          
          router.push(getDashboardRoute(primaryRole));
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (email: string, password: string, additionalData: any = {}) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      });
      if (signUpError) throw signUpError;
      // Usually require email verification
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err: any) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading: isLoading || authLoading,
    error,
    login,
    signup,
    logout,
    resetPassword
  };
}
