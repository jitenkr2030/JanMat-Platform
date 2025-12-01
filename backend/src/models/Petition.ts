import mongoose, { Schema, Document } from 'mongoose';

export interface IPetition extends Document {
  title: string;
  description: string;
  category: 'local' | 'state' | 'national';
  state?: string;
  city?: string;
  targetAuthority: string; // MLA, MP, Government Department, etc.
  createdBy: string; // Anonymous user ID
  signatures: number;
  signaturesRequired: number;
  status: 'active' | 'submitted' | 'resolved' | 'rejected';
  tags: string[];
  isUrgent: boolean;
  supporters: {
    userId: string;
    signedAt: Date;
    message?: string;
  }[];
  timeline: {
    event: string;
    date: Date;
    details?: string;
  }[];
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PetitionSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['local', 'state', 'national'],
    required: true,
    index: true
  },
  state: {
    type: String,
    index: true
  },
  city: {
    type: String,
    index: true
  },
  targetAuthority: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: String,
    required: true,
    index: true
  },
  signatures: {
    type: Number,
    default: 0
  },
  signaturesRequired: {
    type: Number,
    default: 1000
  },
  status: {
    type: String,
    enum: ['active', 'submitted', 'resolved', 'rejected'],
    default: 'active',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isUrgent: {
    type: Boolean,
    default: false,
    index: true
  },
  supporters: [{
    userId: {
      type: String,
      required: true
    },
    signedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      maxlength: 500
    }
  }],
  timeline: [{
    event: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  adminNotes: String
}, {
  timestamps: true,
  collection: 'petitions'
});

// Indexes for performance and discovery
PetitionSchema.index({ category: 1, status: 1, createdAt: -1 });
PetitionSchema.index({ state: 1, city: 1, status: 1 });
PetitionSchema.index({ isUrgent: 1, status: 1 });
PetitionSchema.index({ signatures: -1 });
PetitionSchema.index({ createdAt: -1 });

// Virtual for completion percentage
PetitionSchema.virtual('completionPercentage').get(function() {
  return Math.round((this.signatures / this.signaturesRequired) * 100);
});

// Method to check if petition is achieved
PetitionSchema.methods.isAchieved = function() {
  return this.signatures >= this.signaturesRequired;
};

export default mongoose.model<IPetition>('Petition', PetitionSchema);