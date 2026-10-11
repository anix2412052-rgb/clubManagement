import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'college_event_club_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (Student or Club Head)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Default to student if invalid or not specified; admin accounts are created via seed/existing
    const validRoles = ['student', 'club_head'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      department: department || 'General',
      year: year || '1st Year',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        clubsJoined: user.clubsJoined,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('clubsJoined', 'name category bannerImage');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        clubsJoined: user.clubsJoined,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('clubsJoined', 'name category bannerImage status');

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching user.',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, department, year } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department) user.department = department;
    if (year) user.year = year;

    await user.save();

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        clubsJoined: user.clubsJoined,
      },
      message: 'Profile updated successfully!',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating profile.',
    });
  }
});

export default router;
