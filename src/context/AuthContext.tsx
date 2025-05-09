
"use client";
import type { UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Import server actions instead of direct mockAuth functions
import { getUserByIdAction, loginUserByCredentialsAction } from '@/actions/userActions'; 
import Cookies from 'js-cookie'; // Import js-cookie

const AUTH_COOKIE_NAME = 'userId'; // Consistent with middleware

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
      const storedUserId = Cookies.get(AUTH_COOKIE_NAME); // Check cookie first
      if (storedUserId) {
        try {
          // Use server action to fetch user data
          const fetchedUser = await getUserByIdAction(storedUserId);
          if (fetchedUser) {
            setUser(fetchedUser);
            localStorage.setItem('userId', fetchedUser.id); // Sync localStorage if cookie was source
          } else {
            // User ID in cookie is invalid or user deleted
            localStorage.removeItem('userId');
            Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch session user via action:", error);
          localStorage.removeItem('userId');
          Cookies.remove(AUTH_COOKIE_NAME, { path: '/' }); // Clear invalid session
          setUser(null);
        }
      } else {
        // No cookie, check localStorage as a fallback (e.g., if cookie was session-only and expired but user kept tab open)
        const lsUserId = localStorage.getItem('userId');
        if (lsUserId) {
            try {
                 const fetchedUser = await getUserByIdAction(lsUserId);
                 if (fetchedUser) {
                    setUser(fetchedUser);
                    Cookies.set(AUTH_COOKIE_NAME, fetchedUser.id, { path: '/' }); // Re-set cookie
                 } else {
                    localStorage.removeItem('userId');
                    setUser(null);
                 }
            } catch (error) {
                console.error("Failed to fetch session user from localStorage backup:", error);
                localStorage.removeItem('userId');
                setUser(null);
            }
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
        Cookies.set(AUTH_COOKIE_NAME, result.user.id, { path: '/' }); // Set cookie
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
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' }); // Remove cookie
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      // Wait for state to clear before redirecting to give react a chance to unmount things
      // router.push itself might be enough if used from a component, but this is a direct call.
      setTimeout(() => {
        window.location.href = '/login';
      }, 0);
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

