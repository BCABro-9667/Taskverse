
// This file would typically contain server actions.
// Due to the complexity of setting up Server Actions with mocked data
// and revalidation in this environment, these functions will be called directly
// from client components or simulated as if they were server actions.
// In a real Next.js app with a database, these would be 'use server' functions.

'use server';

import { revalidatePath } from 'next/cache';
import { 
  updateUserProfile as dbUpdateUserProfile,
  updateUserPassword as dbUpdateUserPassword,
  getUserById as dbGetUserById,
  loginUser as dbLoginUser, 
  registerUser as dbRegisterUser
} from '@/lib/mockAuth';
import type { UserProfile } from '@/types';

export async function updateUserProfileAction(userId: string, updates: Partial<Pick<UserProfile, 'name' | 'companyName' | 'companyLogoUrl' | 'companyAddress' | 'profileImageUrl'>>) {
  try {
    const updatedUser = await dbUpdateUserProfile(userId, updates);
    if (!updatedUser) throw new Error('User not found');
    revalidatePath('/profile');
    revalidatePath('/dashboard'); // For navbar updates
    return { success: true, user: updatedUser };
  } catch (error) {
    let message = 'Failed to update profile.';
    if (error instanceof Error) {
        message = error.message;
    }
    return { success: false, error: message };
  }
}

export async function changePasswordAction(userId: string, newPassword_input: string) {
  try {
    const success = await dbUpdateUserPassword(userId, newPassword_input);
    if (!success) throw new Error('Failed to update password.');
    // No revalidation needed as password change doesn't directly affect UI data display
    return { success: true };
  } catch (error) {
    let message = 'Failed to change password.';
    if (error instanceof Error) {
        message = error.message;
    }
    return { success: false, error: message };
  }
}

// New action to get user by ID, specifically for session restoration or general fetch
export async function getUserByIdAction(userId: string): Promise<UserProfile | null> {
  try {
    const user = await dbGetUserById(userId);
    return user || null;
  } catch (error) {
    console.error('Error in getUserByIdAction:', error);
    return null;
  }
}

// New action for user login
export async function loginUserByCredentialsAction(email: string, password_input: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const user = await dbLoginUser(email, password_input);
    if (user) {
      return { success: true, user };
    } else {
      return { success: false, error: "Invalid credentials or user not found." };
    }
  } catch (error) {
    console.error('Error in loginUserByCredentialsAction:', error);
    return { success: false, error: "An error occurred during login." };
  }
}

export async function registerUserAction(userData: Omit<UserProfile, 'id' | 'password'> & { password?: string }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    if (!userData.password) {
        return { success: false, error: "Password is required for registration." };
    }
    // The dbRegisterUser function now expects the plain password as second argument
    const newUser = await dbRegisterUser({
      email: userData.email,
      name: userData.name,
      // Optional fields, can be set to empty or default if not provided
      profileImageUrl: userData.profileImageUrl || '', 
      companyName: userData.companyName || '',
      companyLogoUrl: userData.companyLogoUrl || '',
      companyAddress: userData.companyAddress || '',
    }, userData.password);

    if (newUser) {
      // No revalidation needed here as it's a new user, not affecting existing displays for other users.
      // Login will handle session creation.
      return { success: true, user: newUser };
    } else {
      return { success: false, error: "User already exists or registration failed." };
    }
  } catch (error) {
    console.error('Error in registerUserAction:', error);
    let message = "An error occurred during registration.";
    if (error instanceof Error && error.message.includes('User already exists')) {
        message = 'A user with this email already exists.';
    }
    return { success: false, error: message };
  }
}

