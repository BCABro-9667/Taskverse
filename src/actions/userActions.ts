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
  loginUser as dbLoginUser // Renamed from apiLoginUser if previously aliased
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
