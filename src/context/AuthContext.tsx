
"use client";
import type { UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Import server actions instead of direct mockAuth functions
import { getUserByIdAction, loginUserByCredentialsAction } from '@/actions/userActions'; 

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password_input: string) => Promise<{success: boolean, user?: UserProfile, error?: string}>;
  logout: () => void;
  updateUserProfileContext: (updatedProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          // Use server action to fetch user data
          const fetchedUser = await getUserByIdAction(storedUserId);
          setUser(fetchedUser);
        } catch (error) {
          console.error("Failed to fetch session user via action:", error);
          localStorage.removeItem('userId'); // Clear invalid session
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email: string, password_input: string) => {
    setIsLoading(true);
    try {
      // Use server action for login
      const result = await loginUserByCredentialsAction(email, password_input);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('userId', result.user.id);
        setIsLoading(false);
        return { success: true, user: result.user };
      } else {
        setIsLoading(false);
        return { success: false, error: result.error || "Login failed." };
      }
    } catch (error) {
      console.error("Login action error:", error);
      setIsLoading(false);
      return { success: false, error: "An error occurred during login." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };
  
  const updateUserProfileContext = (updatedProfile: UserProfile) => {
    if (user && updatedProfile.id === user.id) {
        setUser(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserProfileContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

