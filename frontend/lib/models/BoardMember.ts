import mongoose, { Schema, Document } from 'mongoose';

export interface IBoardMember extends Document {
  name: string;
  role: string;
  photoUrl?: string;
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
  photoUrl: {
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

// Prevent re-compilation during development
export default mongoose.models.BoardMember || mongoose.model<IBoardMember>('BoardMember', BoardMemberSchema); 