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
}

export interface ProjectInput {
  title: string;
  slug: string;
  description?: string; // Optional description
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
  role: string;
  photoUrl?: string;
  photoBase64?: string; // Base64 encoded image (takes priority over photoUrl)
  bio?: string;
  socials?: string; // JSON-encoded
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMemberInput {
  name: string;
  role: string;
  photoUrl?: string;
  photoBase64?: string;
  bio?: string;
  socials?: string;
  displayOrder?: number;
  active?: boolean;
}

// Parsed types for JSON fields
export interface ProjectLinks {
  website?: string;
  github?: string;
  demo?: string;
  paper?: string;
  [key: string]: string | undefined;
}

export interface MemberSocials {
  email?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  [key: string]: string | undefined;
} 