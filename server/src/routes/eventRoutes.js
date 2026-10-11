import express from 'express';
import { Event } from '../models/Event.js';
import { Club } from '../models/Club.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with search & filters (club, category, date, search term)
router.get('/', async (req, res) => {
  try {
    const { search, club, category, startDate, endDate, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    if (club && club !== 'All') {
      query.club = club;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate('club', 'name category bannerImage clubHead')
      .sort({ date: 1 });

    return res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching events.',
    });
  }
});

// @route   GET /api/events/my/registrations
// @desc    Get all events registered by the current logged-in student
router.get('/my/registrations', protect, async (req, res) => {
  try {
    const events = await Event.find({
      registeredStudents: req.user._id,
    })
      .populate('club', 'name category bannerImage')
      .sort({ date: 1 });

    return res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching user registrations.',
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID with attendees and attendance
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name category bannerImage clubHead')
      .populate('registeredStudents', 'name email department year')
      .populate('attendance.student', 'name email department year');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    return res.json({
      success: true,
      event,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching event details.',
    });
  }
});

// @route   POST /api/events
// @desc    Create a new event (Club Head or Admin)
router.post('/', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const { title, description, clubId, date, time, venue, totalSeats, posterImage, category } = req.body;

    if (!title || !description || !clubId || !date || !time || !venue || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details.',
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Associated club not found.',
      });
    }

    // Verify user is head of this club (or admin)
    if (req.user.role !== 'admin' && club.clubHead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the club head of this club or an admin can create events for it.',
      });
    }

    const seats = Number(totalSeats);
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      club: club._id,
      date: new Date(date),
      time: time.trim(),
      venue: venue.trim(),
      totalSeats: seats,
      availableSeats: seats,
      posterImage: posterImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      category: category || club.category || 'Technical',
      registeredStudents: [],
      attendance: [],
      status: 'upcoming',
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating event.',
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Edit an existing event
router.put('/:id', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Authorization check
    if (req.user.role !== 'admin' && event.club.clubHead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this event.',
      });
    }

    const { title, description, date, time, venue, totalSeats, posterImage, category, status } = req.body;

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (date) event.date = new Date(date);
    if (time) event.time = time.trim();
    if (venue) event.venue = venue.trim();
    if (posterImage) event.posterImage = posterImage;
    if (category) event.category = category;
    if (status) event.status = status;

    if (totalSeats !== undefined) {
      const newTotal = Number(totalSeats);
      const registeredCount = event.registeredStudents.length;
      event.totalSeats = newTotal;
      event.availableSeats = Math.max(0, newTotal - registeredCount);
    }

    await event.save();

    return res.json({
      success: true,
      message: 'Event updated successfully!',
      event,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error updating event.',
    });
  }
});

// @route   DELETE /api/events/:id (or cancel)
// @desc    Cancel or delete an event
router.delete('/:id', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (req.user.role !== 'admin' && event.club.clubHead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this event.',
      });
    }

    // Toggle status to cancelled or delete
    event.status = 'cancelled';
    await event.save();

    return res.json({
      success: true,
      message: 'Event has been marked as cancelled.',
      event,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error cancelling event.',
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event (seats decrement, prevent duplicate registration)
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a cancelled event.',
      });
    }

    // Check if already registered
    const userIdStr = req.user._id.toString();
    const alreadyRegistered = event.registeredStudents.some((id) => id.toString() === userIdStr);

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
      });
    }

    // Check seat availability
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this event is completely full! No seats left.',
      });
    }

    // Register user and decrement available seats
    event.registeredStudents.push(req.user._id);
    event.availableSeats = Math.max(0, event.availableSeats - 1);
    await event.save();

    return res.json({
      success: true,
      message: 'Successfully registered for the event! See you there!',
      event,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error registering for event.',
    });
  }
});

// @route   POST /api/events/:id/attendance
// @desc    Mark attendance for an event (Club Head / Admin)
//          Body: { attendance: [{ studentId: "...", present: true/false }] }
router.post('/:id/attendance', protect, authorize('club_head', 'admin'), async (req, res) => {
  try {
    const { attendanceRecords } = req.body; // array of { studentId, present }
    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (req.user.role !== 'admin' && event.club.clubHead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the event host or admin can mark attendance.',
      });
    }

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({
        success: false,
        message: 'attendanceRecords array is required.',
      });
    }

    const regStudentSet = new Set(event.registeredStudents.map((id) => id.toString()));

    // Verify all students are indeed registered
    const newAttendance = [];
    for (const record of attendanceRecords) {
      if (!regStudentSet.has(record.studentId)) {
        return res.status(400).json({
          success: false,
          message: `Student ${record.studentId} was not registered for this event. Only registered students can be marked.`,
        });
      }
      newAttendance.push({
        student: record.studentId,
        present: Boolean(record.present),
        markedAt: new Date(),
      });
    }

    event.attendance = newAttendance;
    // Mark status as completed if marking attendance
    event.status = 'completed';
    await event.save();

    return res.json({
      success: true,
      message: 'Attendance saved successfully!',
      attendance: event.attendance,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error saving attendance.',
    });
  }
});

export default router;
