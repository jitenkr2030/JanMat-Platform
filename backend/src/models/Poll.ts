import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
  id: string;
  text: string;
  votes?: number;
}

export interface IPoll extends Document {
  title: string;
  description?: string;
  type: 'yes_no' | 'multiple_choice' | 'rating' | 'emoji';
  options: IOption[];
  category: 'national' | 'local' | 'social' | 'economic' | 'political';
  state?: string;
  city?: string;
  tags: string[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  totalVotes: number;
  createdBy: mongoose.Types.ObjectId;
  results?: {
    optionId: string;
    votes: number;
    percentage: number;
  }[];
  metadata?: {
    adminNotes?: string;
    priority?: 'low' | 'medium' | 'high';
    featured?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema: Schema = new Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
}, { _id: false });

const PollSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['yes_no', 'multiple_choice', 'rating', 'emoji'],
    required: true
  },
  options: {
    type: [OptionSchema],
    required: true,
    validate: {
      validator: function(options: IOption[]) {
        if (this.type === 'yes_no') {
          return options.length === 2;
        }
        return options.length >= 2 && options.length <= 6;
      },
      message: 'Poll options validation failed'
    }
  },
  category: {
    type: String,
    enum: ['national', 'local', 'social', 'economic', 'political'],
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
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  results: [{
    optionId: String,
    votes: Number,
    percentage: Number
  }],
  metadata: {
    adminNotes: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    featured: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'polls'
});

// Indexes for performance
PollSchema.index({ category: 1, isActive: 1, endDate: 1 });
PollSchema.index({ state: 1, isActive: 1 });
PollSchema.index({ createdAt: -1 });
PollSchema.index({ 'metadata.featured': 1, isActive: 1 });

// Virtual for time remaining
PollSchema.virtual('timeRemaining').get(function() {
  return this.endDate.getTime() - Date.now();
});

export default mongoose.model<IPoll>('Poll', PollSchema);