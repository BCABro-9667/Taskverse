
import type { ObjectId } from 'mongodb';

// Internal MongoDB document structure might use ObjectId for _id
interface MongoDocument {
  _id: ObjectId;
}

export type Assignee = {
  id: string; // Always string in application logic
  _id?: ObjectId | string; // Optional MongoDB ObjectId for internal use before mapping
  name: string;
  designation?: string;
  status: 'active' | 'inactive';
};

export type Task = {
  id: string; // Always string in application logic
  _id?: ObjectId | string; // Optional MongoDB ObjectId
  title: string;
  assigneeId: string; // Should be a string ID of an Assignee
  dueDate: string; // Date string (ISO format)
  notes?: string;
  isCompleted: boolean;
  createdAt: string; // Date string (ISO format)
  userId?: string; // To associate tasks with users
};

export type UserProfile = {
  id: string; // Always string in application logic
  _id?: ObjectId | string; // Optional MongoDB ObjectId
  name: string;
  email: string;
  password?: string; // For storing hashed password in DB, not sent to client unless necessary
  profileImageUrl?: string;
  companyName?: string;
  companyLogoUrl?: string;
  companyAddress?: string;
};

// Represents the structure for the company logo/name in the navbar
export type NavbarBranding = {
  companyName?: string;
  companyLogoUrl?: string;
};
