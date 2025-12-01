import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string; // Anonymous user ID
  sessionId?: string;
  state?: string;
  city?: string;
  ageGroup?: string;
  gender?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionId: {
    type: String,
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
  ageGroup: {
    type: String,
    enum: ['18-25', '26-35', '36-45', '46-55', '56+'],
    index: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Compound indexes for analytics
UserSchema.index({ state: 1, createdAt: -1 });
UserSchema.index({ ageGroup: 1, state: 1 });

export default mongoose.model<IUser>('User', UserSchema);