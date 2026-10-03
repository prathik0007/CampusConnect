import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { appStorage } from '@/utils/storage';
import { authApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string, forceRole?: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    department?: string;
    rollNumber?: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;

  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const STORAGE_KEYS = {
  USER: 'campusconnect_user',
  TOKEN: 'campusconnect_token',
};

// Default fallback password for quick demo access buttons
const DEMO_PASSWORD = 'Campus@123';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on startup with backend validation via GET /api/auth/me
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await appStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedToken) {
          // Validate stored token against the real backend
          const res = await authApi.getMe(storedToken);

          if (res.success && res.data?.user) {
            setUser(res.data.user);
            setToken(storedToken);
            await appStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
          } else {
            // Token is invalid, expired, or user deleted: clear local session
            console.log('[AuthContext] Session expired or invalid; clearing stored session.');
            await appStorage.removeItem(STORAGE_KEYS.USER);
            await appStorage.removeItem(STORAGE_KEYS.TOKEN);
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Error validating stored session:', err);
        // Fallback: If network is offline, check cached user
        const storedUser = await appStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = await appStorage.getItem(STORAGE_KEYS.TOKEN);
        if (storedUser && storedToken) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch {
            // Ignore parse errors
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = async (
    email: string,
    password?: string,
    forceRole?: UserRole
  ): Promise<{ success: boolean; user?: User; error?: string }> => {

    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      // If user clicked quick demo access, resolve standard demo password
      const resolvedPassword =
        password && password.trim()
          ? password
          : trimmedEmail === 'student@campus.edu' ||
            trimmedEmail === 'organizer@campus.edu' ||
            forceRole
          ? DEMO_PASSWORD
          : '';

      if (!resolvedPassword) {
        return { success: false, error: 'Password is required to sign in' };
      }

      const res = await authApi.login({
        email: trimmedEmail,
        password: resolvedPassword,
      });

      if (res.success && res.data) {
        const { user: authenticatedUser, token: authToken } = res.data;

        await appStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authenticatedUser));
        await appStorage.setItem(STORAGE_KEYS.TOKEN, authToken);

        setUser(authenticatedUser);
        setToken(authToken);
        return { success: true, user: authenticatedUser };
      } else {
        return { success: false, error: res.message || 'Invalid email or password' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check network connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password?: string;
    department?: string;
    rollNumber?: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password?.trim() || DEMO_PASSWORD,
        role: userData.role || 'student',
        department: userData.department?.trim(),
        rollNumber: userData.rollNumber?.trim().toUpperCase(),
        phone: userData.phone?.trim(),
      });

      if (res.success && res.data) {
        const { user: newUser, token: authToken } = res.data;

        await appStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        await appStorage.setItem(STORAGE_KEYS.TOKEN, authToken);

        setUser(newUser);
        setToken(authToken);
        return { success: true, user: newUser };
      } else {
        return { success: false, error: res.message || 'Registration failed' };
      }

    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await appStorage.removeItem(STORAGE_KEYS.USER);
      await appStorage.removeItem(STORAGE_KEYS.TOKEN);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole): Promise<void> => {
    if (!user) return;
    const switchedUser: User = {
      ...user,
      role,
    };
    await appStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(switchedUser));
    setUser(switchedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
