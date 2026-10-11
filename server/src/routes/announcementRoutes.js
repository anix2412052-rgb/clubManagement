import express from 'express';
import { Announcement } from '../models/Announcement.js';
import { Club } from '../models/Club.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get announcements:
//          - If logged in student: returns announcements from their joined clubs + general announcements
//          - If club filter provided: returns announcements for that club
//          - If admin/guest: returns all or general announcements
router.get('/', async (req, res) => {
  try {
    const { clubId } = req.query;
    let query = {};

    if (clubId) {
      query.club = clubId;
    }

    const announcements = await Announcement.find(query)
      .populate('club', 'name category bannerImage')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching announcements.',
    });
  }
});

// @route   GET /api/announcements/feed
// @desc    Get customized feed for logged in user (joined clubs + college-wide)
router.get('/feed', protect, async (req, res) => {
  try {
    const userClubIds = req.user.clubsJoined || [];

    const announcements = await Announcement.find({
      $or: [
        { club: { $in: userClubIds } },
        { club: null },
        { club: { $exists: false } },
      ],
    })
      .populate('club', 'name category bannerImage')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching feed.',
    });
  }
});

// @route   POST /api/announcements
// @desc    Create announcement (Club Head for their club, Admin for any)
router.post('/', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const { title, message, clubId, category } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.',
      });
    }

    let club = null;
    if (clubId) {
      club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Specified club not found.',
        });
      }

      if (req.user.role !== 'admin' && club.clubHead.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only post announcements for clubs you manage.',
        });
      }
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      club: club ? club._id : null,
      createdBy: req.user._id,
      category: category || (club ? club.category : 'General'),
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('club', 'name category bannerImage')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Announcement posted successfully!',
      announcement: populated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error posting announcement.',
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
router.delete('/:id', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement.',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error deleting announcement.',
    });
  }
});

export default router;
