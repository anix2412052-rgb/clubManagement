# 🎓 Smart College Event and Club Management System

A full-stack modern MERN web application built for colleges and universities to seamlessly discover events, join student clubs, manage attendance, collect feedback ratings, and oversee campus life from an administrative dashboard.

Built following the **3-Week Engineering Plan** for collaborative student project teams.

---

## 🌟 Key Features by User Role

### 🎓 1. Student
- **Authentication**: JWT-based secure signup and login.
- **Club Discovery**: Browse all approved campus clubs, filter by category (*Technical, Cultural, Sports, Literary, Social Service, Arts*), and search by keywords.
- **Club Membership**: One-click "Join Club" button with duplicate join prevention.
- **Campus Events**: Explore upcoming hackathons, workshops, and concerts with dynamic seat-availability counters.
- **Event Registration**: Reserve a seat instantly (prevents double registrations, decreases seat count in real time, displays "Event Full" when capacity is reached).
- **Personal Dashboard ("My Registrations")**: View all booked event tickets and attendance verification status (*Present / Absent / Pending*).
- **Interactive Calendar**: Visual monthly schedule showing campus activities by date.
- **Announcements Feed**: Personalized news feed aggregating notices from clubs the student has joined plus campus-wide circulars.
- **Ratings & Feedback**: Rate attended events from 1 to 5 stars and submit detailed reviews (restricted to verified attendees; one review per event).
- **Student Profile**: Editable profile displaying student name, department, year, and enrolled clubs.

### 🎯 2. Club Head
- **Club Proposal**: Create and submit new clubs (automatically set to `pending` status awaiting administrative moderation).
- **Event Management**: Create new events with titles, descriptions, dates, times, venues, poster URLs, and seat limits.
- **Event Editing & Cancellation**: Modify event parameters or cancel events when necessary.
- **Digital Attendance Register**: View all registered attendees for any hosted event; toggle individual *Present / Absent* status or use *Mark All Present*, saving records permanently.
- **Announcements**: Broadcast club-wide news and updates directly to members.

### 👑 3. College Administrator
- **Executive Analytics Dashboard**: Real-time counter metrics for:
  - Total Enrolled Students
  - Approved vs. Pending Clubs
  - Total Upcoming & Completed Events
  - Average Campus-Wide Event Rating
  - Total Event Registrations (Tickets Claimed)
- **Club Moderation**: Review pending club proposals and approve or reject them with a single click.
- **Campus Directory**: Complete administrative view of all clubs and registered users.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router DOM v6
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB / Mongoose with dual support (Remote MongoDB Atlas or local/in-memory fallback)
- **Security**: JSON Web Tokens (JWT) & bcryptjs password hashing

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Git**

### 2. Clone or Open Project
```bash
cd d:\project
```

### 3. Install All Dependencies
Install both backend and frontend packages with one command:
```bash
npm run install:all
```
*(Or run `npm install` inside both `./server` and `./client` folders)*

### 4. Database Setup & Seeding
The project comes with a dual database strategy:
- To use **MongoDB Atlas**, paste your connection string in `server/.env`:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/college_event_club
  ```
- If `MONGO_URI` is left blank, the server will automatically run using its built-in fast dev database with zero configuration needed!

Populate the database with realistic sample users, clubs, events, reviews, and announcements:
```bash
npm run seed
```

### 5. Running the Application
Open two terminal windows:

**Terminal 1 (Backend Server on Port 5000):**
```bash
npm run dev:server
```

**Terminal 2 (Frontend Client on Port 3000):**
```bash
npm run dev:client
```

Now open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Pre-Seeded Demo Accounts

All pre-seeded demo accounts share the password: `password123`

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | Dr. Robert Miller | `admin@college.edu` | `password123` |
| 🎯 **Club Head** | Alex Rivera | `alex.head@college.edu` | `password123` |
| 🎯 **Club Head** | Sophia Chen | `sophia.head@college.edu` | `password123` |
| 🎓 **Student** | Priya Patel | `priya.patel@college.edu` | `password123` |
| 🎓 **Student** | Liam Smith | `liam.smith@college.edu` | `password123` |
| 🎓 **Student** | Emma Watson | `emma.watson@college.edu` | `password123` |

> 💡 **Demo Tip:** The home screen features an **Instant Demo Switcher** bar at the top! You can switch between Student, Club Head, and Admin with a single click during live presentations without typing credentials.

---

## 🧪 Step-by-Step Demo Journey (Presentation Script)

Follow this exact walkthrough during your project demonstration (from Day 16 of the plan):

1. **Club Head Creates Club**:
   - Log in as **Alex Rivera** (`alex.head@college.edu`).
   - Go to **Clubs** and click **Create New Club**.
   - Fill in club details and submit. Note the notice stating it awaits administrator approval.
2. **Admin Approves Club**:
   - Switch to **Admin** (`admin@college.edu`).
   - Open **Admin Panel** → **Pending Approvals**.
   - See the newly submitted club and click **Approve Club**.
3. **Club Head Schedules Event**:
   - Switch back to **Alex Rivera**.
   - Open **Club Manager** → click **Create New Event** (e.g. "Web Design Hackathon", 50 seats).
4. **Student Browses & Registers**:
   - Switch to **Priya Patel** (`priya.patel@college.edu`).
   - Go to **Events**, locate the new event, and click **Quick Register**.
   - Observe the seat count decrease from 50 to 49.
   - Go to **My Registrations** to view the active booking confirmation ticket.
5. **Club Head Marks Attendance**:
   - Switch to **Alex Rivera** → **Club Manager** → **Take Attendance**.
   - Select the event; see Priya in the registered students list.
   - Toggle status to **Present** and click **Save Attendance**.
6. **Student Leaves Rating & Feedback**:
   - Switch back to **Priya Patel** → **My Registrations** → click on the completed event.
   - Click **Leave Feedback & Rating** → select 5 Stars and write a review.
7. **Admin Dashboard Live Update**:
   - Switch to **Admin** → **Admin Panel**.
   - Observe all counter boxes and the updated average rating.

---

## 📡 API Reference Overview

### Auth Endpoints (`/api/auth`)
- `POST /register` - Register a new Student or Club Head
- `POST /login` - Log in and obtain JWT token
- `GET /me` - Get current authenticated user profile
- `PUT /profile` - Update profile information

### Clubs Endpoints (`/api/clubs`)
- `GET /` - List all approved clubs (supports `?search=` and `?category=`)
- `GET /:id` - Get club details and hosted events
- `POST /` - Create a new club (status: pending)
- `POST /:id/join` - Join club as a member
- `GET /my/managed` - Get clubs managed by the logged-in club head

### Events Endpoints (`/api/events`)
- `GET /` - List events (supports `?status=`, `?category=`, `?club=`, `?search=`)
- `GET /:id` - Single event with attendee details
- `POST /` - Create event *(Club Head / Admin)*
- `PUT /:id` - Edit event *(Club Head / Admin)*
- `DELETE /:id` - Cancel event *(Club Head / Admin)*
- `POST /:id/register` - Register seat for event *(Student)*
- `POST /:id/attendance` - Save student attendance records *(Club Head / Admin)*
- `GET /my/registrations` - Student's registered events list

### Feedback & Reviews Endpoints (`/api/feedback`)
- `GET /event/:eventId` - Get event ratings and comments
- `POST /event/:eventId` - Submit star rating & review *(Attendee only, once per event)*

### Announcements Endpoints (`/api/announcements`)
- `GET /` - List all campus announcements
- `GET /feed` - Personalized announcements for joined clubs
- `POST /` - Post new announcement *(Club Head / Admin)*
- `DELETE /:id` - Remove announcement

### Admin Endpoints (`/api/admin`)
- `GET /stats` - Overview counts, average ratings, total registrations
- `GET /clubs` - Moderation view of all clubs
- `PUT /clubs/:id/status` - Approve or reject a club
- `GET /users` - Complete student and user directory

---

## 👥 Project Team Roles (3-Week Schedule)

- **Member 1**: Authentication, Roles, Profile, and Club creation & joining.
- **Member 2**: Events lifecycle, Seating capacity & registration, Search/Filter, and Calendar view.
- **Member 3**: Announcements, Attendance tracking, Star feedback & reviews, and Administrator dashboard.
