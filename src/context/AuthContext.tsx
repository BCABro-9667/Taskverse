
"use client";
import type { UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById, users as mockUsersArray } from '@/lib/mockAuth'; // Assuming direct import path is fine

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (userData: UserProfile) => void; // Kept for interface consistency, but will be no-op
  logout: () => void; // Kept for interface consistency, but will be no-op
  updateUserProfileContext: (updatedProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use the first user from mockAuth as the default user
const DEFAULT_USER_ID = mockUsersArray.length > 0 ? mockUsersArray[0].id : 'user1'; // Fallback if mockUsersArray is empty

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching the default user
    const fetchDefaultUser = async () => {
      setIsLoading(true);
      try {
        const fetchedUser = await getUserById(DEFAULT_USER_ID); 
        if (fetchedUser) {
          setUser(fetchedUser);
        } else {
          // Fallback if the default user is not found (e.g. mockAuth changed)
          // You might want to create a default mock user here if `getUserById` fails
          console.error("Default user not found in mockAuth.ts");
          setUser(mockUsersArray.length > 0 ? mockUsersArray[0] : null); 
        }
      } catch (error) {
        console.error("Failed to fetch default user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDefaultUser();
  }, []);

  const login = (userData: UserProfile) => {
    // No-op as user is now defaulted
    console.log("Login called, but authentication is currently disabled. User data:", userData);
  };

  const logout = () => {
    // No-op as user is now defaulted and cannot be logged out in this setup
    console.log("Logout called, but authentication is currently disabled.");
  };
  
  const updateUserProfileContext = (updatedProfile: UserProfile) => {
    // Only update if the updated profile matches the current default user's ID
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
