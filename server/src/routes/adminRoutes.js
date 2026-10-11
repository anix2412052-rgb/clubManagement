import express from 'express';
import { User } from '../models/User.js';
import { Club } from '../models/Club.js';
import { Event } from '../models/Event.js';
import { Feedback } from '../models/Feedback.js';
import { Announcement } from '../models/Announcement.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin-only restriction to all admin routes
router.use(protect, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get system overview stats for Admin Dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClubHeads = await User.countDocuments({ role: 'club_head' });
    const totalClubs = await Club.countDocuments();
    const approvedClubs = await Club.countDocuments({ status: 'approved' });
    const pendingClubs = await Club.countDocuments({ status: 'pending' });
    const rejectedClubs = await Club.countDocuments({ status: 'rejected' });
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const totalAnnouncements = await Announcement.countDocuments();

    // Calculate overall average feedback rating across all events
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
        },
      },
    ]);

    const averageRating = feedbackStats.length > 0
      ? Number(feedbackStats[0].avgRating.toFixed(1))
      : 0;
    const totalFeedbacks = feedbackStats.length > 0 ? feedbackStats[0].totalFeedbacks : 0;

    // Calculate total registrations across all events
    const eventStats = await Event.aggregate([
      {
        $project: {
          regCount: { $size: '$registeredStudents' },
        },
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: '$regCount' },
        },
      },
    ]);

    const totalRegistrations = eventStats.length > 0 ? eventStats[0].totalRegistrations : 0;

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalClubHeads,
        totalClubs,
        approvedClubs,
        pendingClubs,
        rejectedClubs,
        totalEvents,
        upcomingEvents,
        completedEvents,
        averageRating,
        totalFeedbacks,
        totalRegistrations,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching admin stats.',
    });
  }
});

// @route   GET /api/admin/clubs
// @desc    Get all clubs (approved, pending, rejected) for moderation
router.get('/clubs', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const clubs = await Club.find(query)
      .populate('clubHead', 'name email department')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching clubs for admin.',
    });
  }
});

// @route   PUT /api/admin/clubs/:id/status
// @desc    Approve or reject a club
router.put('/clubs/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending.',
      });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    club.status = status;
    if (rejectionReason) club.rejectionReason = rejectionReason;
    await club.save();

    return res.json({
      success: true,
      message: `Club has been ${status} successfully.`,
      club,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error updating club status.',
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users list
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('clubsJoined', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching users list.',
    });
  }
});

export default router;
