import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectMember extends Document {
  projectId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  role: 'member' | 'coordinator'; // Required project role enum
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'BoardMember',
    required: true,
  },
  role: {
    type: String,
    enum: ['member', 'coordinator'],
    required: true,
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create compound index to prevent duplicate assignments
ProjectMemberSchema.index({ projectId: 1, memberId: 1 }, { unique: true });

// Create indexes for efficient queries
ProjectMemberSchema.index({ projectId: 1 });
ProjectMemberSchema.index({ memberId: 1 });

const ProjectMember = mongoose.models.ProjectMember || mongoose.model<IProjectMember>('ProjectMember', ProjectMemberSchema);

export default ProjectMember; 