import mongoose, { Schema, Document } from 'mongoose';

export interface IBoardMember extends Document {
  name: string;
  role: string;
  roleType: 'board_member' | 'coordinator'; // Flag to distinguish between board members and coordinators
  photoUrl?: string;
  photoBase64?: string; // Base64 encoded image (takes priority over photoUrl)
  bio?: string;
  socials?: string; // JSON string
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BoardMemberSchema = new Schema<IBoardMember>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  roleType: {
    type: String,
    enum: ['board_member', 'coordinator'],
    required: true,
    default: 'board_member',
  },
  photoUrl: {
    type: String,
    trim: true,
  },
  photoBase64: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  socials: {
    type: String, // JSON string
    trim: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create indexes
BoardMemberSchema.index({ active: 1 });
BoardMemberSchema.index({ displayOrder: 1 });
BoardMemberSchema.index({ role: 1 });
BoardMemberSchema.index({ roleType: 1 });
BoardMemberSchema.index({ roleType: 1, active: 1 });

// Prevent re-compilation during development
export default mongoose.models.BoardMember || mongoose.model<IBoardMember>('BoardMember', BoardMemberSchema); 