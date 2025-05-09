
import type { UserProfile } from '@/types';

// Simulate a database of users
export const users: UserProfile[] = [
  {
    id: 'user1',
    name: 'Demo User',
    email: 'user@example.com',
    profileImageUrl: 'https://picsum.photos/seed/user1/200/200',
    companyName: 'TaskMaster Inc.',
    companyLogoUrl: '', // Example: 'https://picsum.photos/seed/logo1/100/40' data-ai-hint="company logo"
    companyAddress: '123 Main St, Anytown, USA',
  },
];

// Simulate a password store (highly insecure, for demo only)
const passwords: Record<string, string> = {
  'user@example.com': 'password123',
};

export async function loginUser(email: string, password_input: string): Promise<UserProfile | null> {
  const user = users.find((u) => u.email === email);
  if (user && passwords[email] === password_input) {
    return { ...user }; // Return a copy
  }
  return null;
}

export async function registerUser(userData: Omit<UserProfile, 'id'>, password_input: string): Promise<UserProfile | null> {
  if (users.some((u) => u.email === userData.email)) {
    return null; // User already exists
  }
  const newUser: UserProfile = {
    ...userData,
    id: `user${users.length + 1}`,
    profileImageUrl: userData.profileImageUrl || `https://picsum.photos/seed/user${users.length + 1}/200/200`,
  };
  users.push(newUser);
  passwords[newUser.email] = password_input;
  return { ...newUser };
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const user = users.find((u) => u.id === userId);
  return user ? { ...user } : null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    return { ...users[userIndex] };
  }
  return null;
}

export async function updateUserPassword(userId: string, newPassword_input: string): Promise<boolean> {
  const user = users.find((u) => u.id === userId);
  if (user) {
    passwords[user.email] = newPassword_input;
    return true;
  }
  return false;
}
