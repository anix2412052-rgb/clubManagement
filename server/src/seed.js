import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Club } from './models/Club.js';
import { Event } from './models/Event.js';
import { Announcement } from './models/Announcement.js';
import { Feedback } from './models/Feedback.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database records...');
    await Feedback.deleteMany({});
    await Announcement.deleteMany({});
    await Event.deleteMany({});
    await Club.deleteMany({});
    await User.deleteMany({});

    console.log('👤 Seeding Users (Admin, Club Heads, Students)...');
    const defaultPassword = 'password123'; // Hash handled by User pre-save hook

    const admin = await User.create({
      name: 'Dr. Robert Miller (Admin)',
      email: 'admin@college.edu',
      password: defaultPassword,
      role: 'admin',
      department: 'Administration',
      year: 'Faculty',
    });

    const clubHead1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.head@college.edu',
      password: defaultPassword,
      role: 'club_head',
      department: 'Computer Science',
      year: '4th Year',
    });

    const clubHead2 = await User.create({
      name: 'Sophia Chen',
      email: 'sophia.head@college.edu',
      password: defaultPassword,
      role: 'club_head',
      department: 'Robotics & Mechatronics',
      year: '3rd Year',
    });

    const clubHead3 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus.head@college.edu',
      password: defaultPassword,
      role: 'club_head',
      department: 'Media & Performing Arts',
      year: '4th Year',
    });

    const student1 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@college.edu',
      password: defaultPassword,
      role: 'student',
      department: 'Computer Science',
      year: '3rd Year',
    });

    const student2 = await User.create({
      name: 'Liam Smith',
      email: 'liam.smith@college.edu',
      password: defaultPassword,
      role: 'student',
      department: 'Information Technology',
      year: '2nd Year',
    });

    const student3 = await User.create({
      name: 'Emma Watson',
      email: 'emma.watson@college.edu',
      password: defaultPassword,
      role: 'student',
      department: 'Computer Science',
      year: '4th Year',
    });

    const student4 = await User.create({
      name: 'Noah Brown',
      email: 'noah.brown@college.edu',
      password: defaultPassword,
      role: 'student',
      department: 'Mechanical Engineering',
      year: '1st Year',
    });

    const student5 = await User.create({
      name: 'Chloe Davis',
      email: 'chloe.davis@college.edu',
      password: defaultPassword,
      role: 'student',
      department: 'Electronics & Communication',
      year: '2nd Year',
    });

    const student6 = await User.create({
      name: 'Aravind Kumar',
      email: 'aravind.k@college.edu',
      password: defaultPassword,
      role: 'student',
      department: 'Computer Science',
      year: '3rd Year',
    });

    console.log('🏛️ Seeding Clubs...');
    const codingClub = await Club.create({
      name: 'ByteCraft Coding Club',
      description: 'The premier software engineering, competitive programming, and web development community on campus. We host hackathons, code reviews, and tech workshops.',
      category: 'Technical',
      clubHead: clubHead1._id,
      members: [clubHead1._id, student1._id, student2._id, student3._id, student6._id],
      status: 'approved',
      bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      contactEmail: 'bytecraft@college.edu',
    });

    const roboticsClub = await Club.create({
      name: 'Robotics & Automation Society',
      description: 'Hands-on hardware, microcontrollers, IoT devices, ROS, and competitive drone racing. Building the machines of tomorrow today!',
      category: 'Technical',
      clubHead: clubHead2._id,
      members: [clubHead2._id, student1._id, student4._id, student5._id],
      status: 'approved',
      bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      contactEmail: 'robotics@college.edu',
    });

    const musicClub = await Club.create({
      name: 'Harmony Music & Cultural Club',
      description: 'Celebrating rhythm, acoustics, instrumental mastery, and vocal arts. From classical acoustics to modern fusion and campus festivals.',
      category: 'Cultural',
      clubHead: clubHead3._id,
      members: [clubHead3._id, student2._id, student3._id, student5._id],
      status: 'approved',
      bannerImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      contactEmail: 'harmony@college.edu',
    });

    const debateClub = await Club.create({
      name: 'Literary & Parliamentary Debate Guild',
      description: 'Fostering critical discourse, eloquence, model united nations, and literary creativity. Open to all students passionate about debate.',
      category: 'Literary',
      clubHead: clubHead2._id,
      members: [clubHead2._id, student4._id, student6._id],
      status: 'approved',
      bannerImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      contactEmail: 'debate@college.edu',
    });

    // A Pending Club for the Admin demo journey!
    const greenClub = await Club.create({
      name: 'Green Earth Environmental Society',
      description: 'Dedicated to campus sustainability, tree plantation drives, e-waste recycling, and environmental awareness seminars.',
      category: 'Social Service',
      clubHead: clubHead1._id,
      members: [clubHead1._id],
      status: 'pending',
      bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      contactEmail: 'greenearth@college.edu',
    });

    // Update users' joined club references
    await User.findByIdAndUpdate(student1._id, { $addToSet: { clubsJoined: [codingClub._id, roboticsClub._id] } });
    await User.findByIdAndUpdate(student2._id, { $addToSet: { clubsJoined: [codingClub._id, musicClub._id] } });
    await User.findByIdAndUpdate(student3._id, { $addToSet: { clubsJoined: [codingClub._id, musicClub._id] } });
    await User.findByIdAndUpdate(student4._id, { $addToSet: { clubsJoined: [roboticsClub._id, debateClub._id] } });
    await User.findByIdAndUpdate(student5._id, { $addToSet: { clubsJoined: [roboticsClub._id, musicClub._id] } });
    await User.findByIdAndUpdate(student6._id, { $addToSet: { clubsJoined: [codingClub._id, debateClub._id] } });

    console.log('📅 Seeding Events...');
    const hackathonDate = new Date();
    hackathonDate.setDate(hackathonDate.getDate() + 7);

    const hackathon = await Event.create({
      title: 'Annual 24-Hour College Hackathon 2026',
      description: 'Build innovative web, AI, and mobile solutions to solve real-world campus and social challenges. Mentorship and prizes up to $2,000!',
      club: codingClub._id,
      date: hackathonDate,
      time: '09:00 AM - Next Day 09:00 AM',
      venue: 'Auditorium Hall B & Innovation Center',
      totalSeats: 50,
      availableSeats: 47,
      posterImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      category: 'Technical',
      registeredStudents: [student1._id, student2._id, student3._id],
      status: 'upcoming',
    });

    const aiWorkshopDate = new Date();
    aiWorkshopDate.setDate(aiWorkshopDate.getDate() + 12);

    const aiWorkshop = await Event.create({
      title: 'Hands-on AI & Deep Learning Masterclass',
      description: 'Explore neural networks, computer vision, and prompt engineering with hands-on PyTorch code labs. Laptop required.',
      club: roboticsClub._id,
      date: aiWorkshopDate,
      time: '02:00 PM - 05:30 PM',
      venue: 'Computer Science Lab 4',
      totalSeats: 30,
      availableSeats: 28,
      posterImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
      category: 'Technical',
      registeredStudents: [student1._id, student4._id],
      status: 'upcoming',
    });

    const musicNightDate = new Date();
    musicNightDate.setDate(musicNightDate.getDate() + 15);

    const musicNight = await Event.create({
      title: 'Acoustic Sunset: Live Campus Unplugged',
      description: 'An evening of live instruments, vocal duets, and open mic performances under the campus canopy. Free refreshments provided.',
      club: musicClub._id,
      date: musicNightDate,
      time: '05:30 PM - 08:30 PM',
      venue: 'Campus Open Air Amphitheatre',
      totalSeats: 100,
      availableSeats: 98,
      posterImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      category: 'Cultural',
      registeredStudents: [student2._id, student5._id],
      status: 'upcoming',
    });

    // Completed event with attendance and feedback for realistic presentation!
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const completedEvent = await Event.create({
      title: 'Modern Web Development with MERN: Workshop 1',
      description: 'Introductory session covering REST APIs, React state management, and MongoDB schema design.',
      club: codingClub._id,
      date: pastDate,
      time: '10:00 AM - 01:00 PM',
      venue: 'Seminar Hall 1',
      totalSeats: 40,
      availableSeats: 36,
      posterImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      category: 'Technical',
      registeredStudents: [student1._id, student2._id, student3._id, student6._id],
      attendance: [
        { student: student1._id, present: true, markedAt: pastDate },
        { student: student2._id, present: true, markedAt: pastDate },
        { student: student3._id, present: false, markedAt: pastDate },
        { student: student6._id, present: true, markedAt: pastDate },
      ],
      status: 'completed',
    });

    console.log('⭐ Seeding Feedback & Reviews...');
    await Feedback.create([
      {
        event: completedEvent._id,
        student: student1._id,
        rating: 5,
        comment: 'Amazing hands-on session! Learned how React components communicate with Express APIs so clearly.',
      },
      {
        event: completedEvent._id,
        student: student2._id,
        rating: 4,
        comment: 'Great explanations and well organized. Looking forward to the next hackathon!',
      },
      {
        event: completedEvent._id,
        student: student6._id,
        rating: 5,
        comment: 'Super helpful resources and instructors. Would love more deep-dive workshops like this!',
      },
    ]);

    console.log('📢 Seeding Announcements...');
    await Announcement.create([
      {
        title: 'Hackathon 2026 Registration is Now Open!',
        message: 'Seats are filling up quickly! Form teams of 2 to 4 students and register before slots run out. Food and swag packs provided.',
        club: codingClub._id,
        createdBy: clubHead1._id,
        category: 'Technical',
      },
      {
        title: 'Acoustic Night Auditions Open',
        message: 'Want to sing or play an instrument at the upcoming amphitheatre concert? Drop by the Music Room this Thursday at 4 PM.',
        club: musicClub._id,
        createdBy: clubHead3._id,
        category: 'Cultural',
      },
      {
        title: 'Robotics Workshop Kit Distribution Notice',
        message: 'Registered participants can collect their hardware kits from CS Lab 4 from 1 PM onwards on event day.',
        club: roboticsClub._id,
        createdBy: clubHead2._id,
        category: 'Technical',
      },
      {
        title: 'Campus Central Library Weekend Extended Hours',
        message: 'The central library will remain open until midnight during preparation weeks for all clubs and project teams.',
        club: null,
        createdBy: admin._id,
        category: 'General',
      },
    ]);

    console.log(`
======================================================
🎉 SUCCESS: Database populated with rich demo data!
======================================================
Login Credentials:
------------------------------------------------------
👑 ADMIN:
   Email:    admin@college.edu
   Password: password123

🎯 CLUB HEADS:
   1) alex.head@college.edu    (ByteCraft Coding Club)
   2) sophia.head@college.edu  (Robotics & Automation)
   3) marcus.head@college.edu  (Harmony Music Club)
   Password for all: password123

🎓 STUDENTS:
   1) priya.patel@college.edu
   2) liam.smith@college.edu
   3) emma.watson@college.edu
   4) noah.brown@college.edu
   5) chloe.davis@college.edu
   6) aravind.k@college.edu
   Password for all: password123
======================================================
    `);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
