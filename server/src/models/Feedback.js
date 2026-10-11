import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write a feedback comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only leave one feedback per event
feedbackSchema.index({ event: 1, student: 1 }, { unique: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
