import express from 'express';
import { Feedback } from '../models/Feedback.js';
import { Event } from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/feedback/event/:eventId
// @desc    Get all feedback and average score for a particular event
router.get('/event/:eventId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('student', 'name department year avatar')
      .sort({ createdAt: -1 });

    const total = feedbacks.length;
    const avgRating = total > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1)
      : 0;

    return res.json({
      success: true,
      count: total,
      averageRating: Number(avgRating),
      feedbacks,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching feedbacks.',
    });
  }
});

// @route   POST /api/feedback/event/:eventId
// @desc    Submit feedback (Student rates 1-5 & writes comment; only once per event)
router.post('/event/:eventId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const eventId = req.params.eventId;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rating (1-5) and a written comment.',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check if user was registered for this event
    const userIdStr = req.user._id.toString();
    const isRegistered = event.registeredStudents.some((id) => id.toString() === userIdStr);
    if (!isRegistered) {
      return res.status(403).json({
        success: false,
        message: 'You can only leave feedback for events you registered for.',
      });
    }

    // Check if user already submitted feedback
    const existingFeedback = await Feedback.findOne({
      event: eventId,
      student: req.user._id,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event. Only one submission allowed per student.',
      });
    }

    const feedback = await Feedback.create({
      event: eventId,
      student: req.user._id,
      rating: numRating,
      comment: comment.trim(),
    });

    const populated = await Feedback.findById(feedback._id)
      .populate('student', 'name department year');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted.',
      feedback: populated,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event.',
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Error submitting feedback.',
    });
  }
});

export default router;
