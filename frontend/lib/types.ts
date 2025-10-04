// Data model types for the Gradient Science Club website

export interface Project {
  id: string; // MongoDB ObjectId as string
  title: string;
  slug: string;
  description?: string; // Optional description
  imageUrl?: string;
  imageBase64?: string; // Base64 encoded image (takes priority over imageUrl)
  tags?: string; // JSON or comma-separated
  status: 'planned' | 'active' | 'completed';
  links?: string; // JSON-encoded
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMemberAssignment[]; // Associated members
}

export interface ProjectInput {
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageBase64?: string;
  tags?: string;
  status?: 'planned' | 'active' | 'completed';
  links?: string;
  displayOrder?: number;
}

export interface BoardMember {
  id: string; // MongoDB ObjectId as string
  name: string;
  role?: string; // Optional role - required for board_member and coordinator, optional for member
  roleType: 'board_member' | 'coordinator' | 'member'; // Flag to distinguish between board members, coordinators, and regular members
  photoUrl?: string;
  photoBase64?: string; // Base64 encoded image (takes priority over photoUrl)
  bio?: string;
  socials?: string; // JSON-encoded
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  projects?: ProjectMemberAssignment[]; // Associated projects
}

export interface BoardMemberInput {
  name: string;
  role?: string; // Optional role - required for board_member and coordinator, optional for member
  roleType: 'board_member' | 'coordinator' | 'member';
  photoUrl?: string;
  photoBase64?: string;
  bio?: string;
  socials?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface Partnership {
  id: string; // MongoDB ObjectId as string
  name: string;
  websiteUrl?: string; // Link to organization's website
  logoUrl?: string;
  logoBase64?: string; // Base64 encoded image (takes priority over logoUrl)
  yearFrom: number;
  yearTo?: number; // Optional for ongoing partnerships
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnershipInput {
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  logoBase64?: string;
  yearFrom: number;
  yearTo?: number;
  displayOrder?: number;
  active?: boolean;
}

// Project role enum for members working on projects
export type ProjectRole = 'member' | 'coordinator';

// Junction table type for project-member relationships
export interface ProjectMemberAssignment {
  id: string;
  projectId: string;
  memberId: string;
  role: ProjectRole; // Required project role: member or coordinator
  joinedAt: string;
  // Populated fields
  project?: Project;
  member?: BoardMember;
}

export interface ProjectMemberInput {
  projectId: string;
  memberId: string;
  role: ProjectRole; // Required project role
}

// Parsed types for JSON fields
export interface ProjectLinks {
  website?: string;
  github?: string;
  documentation?: string;
}

export interface MemberSocials {
  twitter?: string;
  linkedin?: string;
  github?: string;
  email?: string;
} 