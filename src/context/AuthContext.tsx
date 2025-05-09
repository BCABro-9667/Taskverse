
"use client";
import type { UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById, loginUser as apiLoginUser } from '@/lib/mockAuth'; // mockAuth now uses MongoDB

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password_input: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  updateUserProfileContext: (updatedProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This can be an ID of a user you ensure exists in your MongoDB 'users' collection for demo purposes.
// Or, if you implement a full login/register, this won't be strictly necessary after first login.
const DEFAULT_USER_ID_FOR_NO_AUTH_MODE = "user1_mongo_default"; // Example ID, ensure this user exists or adjust logic

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          const fetchedUser = await getUserById(storedUserId);
          setUser(fetchedUser);
        } catch (error) {
          console.error("Failed to fetch session user:", error);
          localStorage.removeItem('userId'); // Clear invalid session
          setUser(null);
        }
      } else {
        // If no direct auth/login is implemented yet, you might load a default user for development
        // For now, we assume login is required or user session is managed by login/logout
        // console.log("No user session found. Consider loading a default user for development if needed.");
        // Example: const defaultUser = await getUserById(DEFAULT_USER_ID_FOR_NO_AUTH_MODE); setUser(defaultUser);
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = async (email: string, password_input: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await apiLoginUser(email, password_input);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('userId', loggedInUser.id);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: "Invalid credentials or user not found." };
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, error: "An error occurred during login." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    // Optionally redirect to login page or home page
    // router.push('/login'); 
  };
  
  const updateUserProfileContext = (updatedProfile: UserProfile) => {
    // Only update if the updated profile matches the current user's ID
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
