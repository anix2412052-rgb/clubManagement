import express from 'express';
import { Club } from '../models/Club.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/clubs
// @desc    Get all approved clubs (with optional search and category filter)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: 'approved' };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

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
      message: err.message || 'Error fetching clubs.',
    });
  }
});

// @route   GET /api/clubs/my/managed
// @desc    Get clubs managed by currently logged in club head
router.get('/my/managed', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { clubHead: req.user._id };
    const clubs = await Club.find(filter)
      .populate('clubHead', 'name email')
      .populate('members', 'name email department year');

    return res.json({
      success: true,
      clubs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching managed clubs.',
    });
  }
});

// @route   GET /api/clubs/:id
// @desc    Get club details by ID along with its events
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('clubHead', 'name email department')
      .populate('members', 'name email department year');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    const events = await Event.find({ club: club._id }).sort({ date: 1 });

    return res.json({
      success: true,
      club,
      events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching club details.',
    });
  }
});

// @route   POST /api/clubs
// @desc    Create a new club (status starts as 'pending' awaiting Admin approval)
router.post('/', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const { name, description, category, bannerImage, contactEmail } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Club name and description are required.',
      });
    }

    const existingClub = await Club.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'A club with this name already exists.',
      });
    }

    // Admins can auto-approve; Club Heads require Admin moderation
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const club = await Club.create({
      name: name.trim(),
      description: description.trim(),
      category: category || 'Technical',
      clubHead: req.user._id,
      members: [req.user._id], // creator is also member
      status: initialStatus,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
      contactEmail: contactEmail || req.user.email,
    });

    // Also link club to user's joined list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { clubsJoined: club._id },
    });

    return res.status(201).json({
      success: true,
      club,
      message: req.user.role === 'admin'
        ? 'Club created and approved successfully!'
        : 'Club submitted successfully! Waiting for Admin approval.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating club.',
    });
  }
});

// @route   POST /api/clubs/:id/join
// @desc    Join a club (student or user) - prevents duplicate joining
router.post('/:id/join', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    if (club.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join a club that is not approved yet.',
      });
    }

    const userIdStr = req.user._id.toString();
    const alreadyJoined = club.members.some((m) => m.toString() === userIdStr);

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this club.',
      });
    }

    club.members.push(req.user._id);
    await club.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { clubsJoined: club._id },
    });

    return res.json({
      success: true,
      message: `Welcome! You have successfully joined ${club.name}.`,
      club,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error joining club.',
    });
  }
});

export default router;
