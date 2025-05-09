
import { getDb, toObjectId, mapMongoId } from './mongodb';
import type { UserProfile } from '@/types';
import type { Collection, ObjectId } from 'mongodb';
// It's a good practice to hash passwords. Import a library like bcrypt or use Node.js crypto.
// For this example, we'll store passwords as plain text, which is NOT secure for production.
// import bcrypt from 'bcryptjs'; 

const USERS_COLLECTION = 'users';

// In a real app, use a secure password hashing library like bcrypt
// const hashPassword = async (password: string): Promise<string> => {
//   const salt = await bcrypt.genSalt(10);
//   return bcrypt.hash(password, salt);
// };

// const comparePassword = async (password: string, hash: string): Promise<boolean> => {
//   return bcrypt.compare(password, hash);
// };

export async function loginUser(email: string, password_input: string): Promise<UserProfile | null> {
  const db = await getDb();
  const collection: Collection<Omit<UserProfile, 'id'> & { _id: ObjectId, password?: string }> = db.collection(USERS_COLLECTION);
  const userFromDb = await collection.findOne({ email: email });

  if (!userFromDb) {
    return null; // User not found
  }

  // In a real app, compare hashed passwords:
  // const passwordMatch = await comparePassword(password_input, userFromDb.password);
  // For this example, direct comparison (INSECURE):
  const passwordMatch = userFromDb.password === password_input;

  if (passwordMatch) {
    const { password, ...userWithoutPassword } = userFromDb;
    return mapMongoId(userWithoutPassword as Omit<UserProfile, 'id'> & { _id: ObjectId });
  }
  return null;
}

export async function registerUser(userData: Omit<UserProfile, 'id' | 'password'>, password_input: string): Promise<UserProfile | null> {
  const db = await getDb();
  const collection: Collection<Omit<UserProfile, 'id'> & { _id: ObjectId, password?: string }> = db.collection(USERS_COLLECTION);
  
  const existingUser = await collection.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User already exists'); // Or return null and handle in action
  }

  // In a real app, hash the password:
  // const hashedPassword = await hashPassword(password_input);
  const hashedPassword = password_input; // INSECURE: Store as plain text for example

  const newUserDocument = {
    ...userData,
    profileImageUrl: userData.profileImageUrl || `https://picsum.photos/seed/user${Date.now()}/200/200`,
    password: hashedPassword, // Store the hashed password
  };

  const result = await collection.insertOne(newUserDocument as any); // `any` because _id is generated
  const insertedUserFromDb = await collection.findOne({ _id: result.insertedId });

  if (!insertedUserFromDb) {
    throw new Error('Failed to retrieve registered user');
  }
  const { password, ...userWithoutPassword } = insertedUserFromDb;
  return mapMongoId(userWithoutPassword as Omit<UserProfile, 'id'> & { _id: ObjectId });
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const db = await getDb();
  const collection: Collection<Omit<UserProfile, 'id'> & { _id: ObjectId, password?: string }> = db.collection(USERS_COLLECTION);
  try {
    const userFromDb = await collection.findOne({ _id: toObjectId(userId) });
    if (userFromDb) {
      const { password, ...userWithoutPassword } = userFromDb;
      return mapMongoId(userWithoutPassword as Omit<UserProfile, 'id'> & { _id: ObjectId });
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user by ID ${userId}:`, error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const db = await getDb();
  const collection: Collection<Omit<UserProfile, 'id'> & { _id: ObjectId, password?: string }> = db.collection(USERS_COLLECTION);
  // Prevent password from being updated through this general profile update function
  const { password, ...safeUpdates } = updates; 

  try {
    const result = await collection.updateOne(
      { _id: toObjectId(userId) },
      { $set: safeUpdates }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      const existingUser = await collection.findOne({_id: toObjectId(userId)});
      if(!existingUser) return null; // User not found
      const { password: _, ...userWithoutPassword } = existingUser;
      return mapMongoId(userWithoutPassword as Omit<UserProfile, 'id'> & { _id: ObjectId }); // No changes made
    }
    const updatedUserFromDb = await collection.findOne({ _id: toObjectId(userId) });
    if (updatedUserFromDb) {
        const { password: _, ...userWithoutPassword } = updatedUserFromDb;
        return mapMongoId(userWithoutPassword as Omit<UserProfile, 'id'> & { _id: ObjectId });
    }
    return null;
  } catch (error) {
    console.error(`Error updating user profile ${userId}:`, error);
    return null;
  }
}

export async function updateUserPassword(userId: string, newPassword_input: string): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection(USERS_COLLECTION);
  // In a real app, hash the new password:
  // const hashedPassword = await hashPassword(newPassword_input);
  const hashedPassword = newPassword_input; // INSECURE
  try {
    const result = await collection.updateOne(
      { _id: toObjectId(userId) },
      { $set: { password: hashedPassword } }
    );
    return result.modifiedCount === 1;
  } catch (error) {
    console.error(`Error updating password for user ${userId}:`, error);
    return false;
  }
}

