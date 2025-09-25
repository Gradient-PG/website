import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description?: string; // Optional description
  imageUrl?: string;
  imageBase64?: string; // Base64 encoded image (takes priority over imageUrl)
  tags?: string;
  status: 'planned' | 'active' | 'completed';
  links?: string; // JSON string
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: false, // Made optional
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  imageBase64: {
    type: String,
    trim: true,
  },
  tags: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned',
  },
  links: {
    type: String, // JSON string
    trim: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create indexes
ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ displayOrder: 1 });

// Prevent re-compilation during development
export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 