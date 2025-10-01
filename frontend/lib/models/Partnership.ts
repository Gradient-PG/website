import mongoose, { Schema, Document } from 'mongoose';

export interface IPartnership extends Document {
  name: string;
  websiteUrl?: string; // Link to organization's website
  logoUrl?: string;
  logoBase64?: string; // Base64 encoded image (takes priority over logoUrl)
  yearFrom: number; // Starting year
  yearTo?: number; // Ending year (optional for ongoing partnerships)
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnershipSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  websiteUrl: {
    type: String,
    trim: true,
  },
  logoUrl: {
    type: String,
    trim: true,
  },
  logoBase64: {
    type: String,
    trim: true,
  },
  yearFrom: {
    type: Number,
    required: true,
    min: 1900,
    max: 2200,
  },
  yearTo: {
    type: Number,
    required: false,
    min: 1900,
    max: 2200,
    validate: {
      validator: function(this: IPartnership, v: number) {
        // If yearTo is provided, it must be >= yearFrom
        if (v !== undefined && v !== null) {
          return v >= this.yearFrom;
        }
        return true;
      },
      message: 'End year must be greater than or equal to start year'
    }
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
  timestamps: true,
});

// Clear any existing cached model to ensure schema updates are applied
if (mongoose.models.Partnership) {
  delete mongoose.models.Partnership;
}

export default mongoose.model<IPartnership>('Partnership', PartnershipSchema); 