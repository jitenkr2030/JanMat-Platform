import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  userId: string;
  pollId: mongoose.Types.ObjectId;
  selectedOption: string;
  rating?: number;
  emoji?: string;
  metadata: {
    state?: string;
    city?: string;
    ageGroup?: string;
    gender?: string;
    timestamp: Date;
  };
  isValid: boolean;
  createdAt: Date;
}

const VoteSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },
  selectedOption: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  emoji: {
    type: String
  },
  metadata: {
    state: String,
    city: String,
    ageGroup: {
      type: String,
      enum: ['18-25', '26-35', '36-45', '46-55', '56+']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'votes'
});

// Compound indexes for analytics
VoteSchema.index({ pollId: 1, 'metadata.state': 1 });
VoteSchema.index({ pollId: 1, 'metadata.ageGroup': 1 });
VoteSchema.index({ pollId: 1, 'metadata.gender': 1 });
VoteSchema.index({ createdAt: -1 });

// Prevent duplicate votes from same user for same poll
VoteSchema.index({ userId: 1, pollId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);