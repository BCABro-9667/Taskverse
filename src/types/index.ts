
export type Assignee = {
  id: string;
  name: string;
  designation?: string;
  status: 'active' | 'inactive';
};

export type Task = {
  id: string;
  title: string;
  assigneeId: string;
  dueDate: string; // Date string
  notes?: string;
  isCompleted: boolean;
  createdAt: string; // Date string
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
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
