import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a club name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a club description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Technical', 'Cultural', 'Sports', 'Literary', 'Social Service', 'Arts & Media', 'Other'],
      default: 'Technical',
    },
    clubHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Club = mongoose.model('Club', clubSchema);
