import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an announcement title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide an announcement message'],
      trim: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: false, // null or undefined means college-wide
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
