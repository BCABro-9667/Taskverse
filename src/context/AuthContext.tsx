
"use client";
import type { UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById } from '@/lib/mockAuth'; // Assuming direct import path is fine

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updateUserProfileContext: (updatedProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const storedUserId = localStorage.getItem('taskmaster_userid');
        if (storedUserId) {
          const fetchedUser = await getUserById(storedUserId); // Use mockAuth function
          if (fetchedUser) {
            setUser(fetchedUser);
          } else {
            localStorage.removeItem('taskmaster_userid'); // Clear invalid stored ID
          }
        }
      } catch (error) {
        console.error("Failed to check session:", error);
        localStorage.removeItem('taskmaster_userid');
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('taskmaster_userid', userData.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskmaster_userid');
    // Optionally, redirect to login page via router if needed outside of middleware
  };
  
  const updateUserProfileContext = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
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
