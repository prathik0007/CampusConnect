import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { appStorage } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string, forceRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; department?: string; rollNumber?: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const STORAGE_KEYS = {
  USER: 'campusconnect_user',
  TOKEN: 'campusconnect_token',
};

// Preset mock accounts for demonstration & development
export const MOCK_USERS = {
  student: {
    id: 'usr_student_01',
    name: 'Prathik Kumar',
    email: 'student@campus.edu',
    role: 'student' as UserRole,
    department: 'Computer Applications (MCA)',
    rollNumber: 'MCA2024042',
    phone: '+91 9876543210',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString(),
  },
  organizer: {
    id: 'usr_organizer_01',
    name: 'Tech & Cultural Council',
    email: 'organizer@campus.edu',
    role: 'organizer' as UserRole,
    department: 'Department of Computer Applications',
    phone: '+91 9876500000',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    createdAt: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on startup
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedUser = await appStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = await appStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = async (
    email: string,
    _password?: string,
    forceRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Mock auth logic:
      // If email includes 'organizer' or forced role is 'organizer', authenticate as organizer
      const isOrganizer = forceRole === 'organizer' || email.toLowerCase().includes('organizer');
      const authenticatedUser: User = isOrganizer
        ? {
            ...MOCK_USERS.organizer,
            email: email.trim().toLowerCase() || MOCK_USERS.organizer.email,
          }
        : {
            ...MOCK_USERS.student,
            email: email.trim().toLowerCase() || MOCK_USERS.student.email,
          };

      const mockToken = `mock_jwt_token_${authenticatedUser.role}_${Date.now()}`;

      await appStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authenticatedUser));
      await appStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

      setUser(authenticatedUser);
      setToken(mockToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    department?: string;
    rollNumber?: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        role: userData.role || 'student',
        department: userData.department || 'Computer Applications (MCA)',
        rollNumber: userData.rollNumber || `MCA${Math.floor(1000 + Math.random() * 9000)}`,
        phone: userData.phone || '',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=2563EB&color=fff`,
        createdAt: new Date().toISOString(),
      };

      const mockToken = `mock_jwt_token_${newUser.role}_${Date.now()}`;

      await appStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await appStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

      setUser(newUser);
      setToken(mockToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
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
    const switchedUser: User = role === 'organizer' ? MOCK_USERS.organizer : MOCK_USERS.student;
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
