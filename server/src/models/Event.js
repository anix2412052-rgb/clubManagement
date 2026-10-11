import mongoose from 'mongoose';

const attendanceItemSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  present: {
    type: Boolean,
    default: true,
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
      trim: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide event time'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Please provide event venue'],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please provide total seat capacity'],
      min: [1, 'Must have at least 1 seat'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
    posterImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attendance: [attendanceItemSchema],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    category: {
      type: String,
      default: 'Technical',
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model('Event', eventSchema);
