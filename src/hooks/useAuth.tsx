
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (username: string, password: string, role: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string, role: string) => {
    try {
      // First check if user exists with correct role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('role', role)
        .single();

      if (userError || !userData) {
        return { error: { message: 'Invalid credentials or role' } };
      }

      // Create a mock session for our custom authentication
      const mockUser = {
        id: userData.user_id,
        email: `${username}@accosight.local`,
        user_metadata: {
          username: userData.username,
          role: userData.role,
          user_id: userData.user_id
        }
      } as User;

      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        refresh_token: 'mock-refresh'
      } as Session;

      setUser(mockUser);
      setSession(mockSession);
      
      // Store in localStorage for persistence
      localStorage.setItem('accosight_user', JSON.stringify(mockUser));
      localStorage.setItem('accosight_session', JSON.stringify(mockSession));

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('accosight_user');
    localStorage.removeItem('accosight_session');
  };

  // Check localStorage on mount for persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('accosight_user');
    const storedSession = localStorage.getItem('accosight_session');
    
    if (storedUser && storedSession) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedSession = JSON.parse(storedSession);
        setUser(parsedUser);
        setSession(parsedSession);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>
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
