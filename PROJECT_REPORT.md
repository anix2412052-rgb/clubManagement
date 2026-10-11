# 📑 Comprehensive Project Report
## Smart College Event and Club Management System

**Academic Project Report & System Architecture Specification**

---

### 1. Introduction & Problem Statement
In modern colleges and universities, extracurricular activities, technical symposiums, hackathons, and student-run clubs represent a fundamental pillar of personal growth and professional preparation. However, traditional campus management suffers from several critical bottlenecks:
1. **Scattered Information**: Event announcements are posted across fragmented social media groups, physical pinboards, or buried in bulk emails, causing low participation.
2. **Manual & Inefficient Registration**: Event coordinators struggle with overbooking, duplicate registrations, and lack of real-time seat tracking.
3. **Paper-Based Attendance**: Physical sign-in sheets at venues cause bottlenecks, inaccuracies, and proxy attendances.
4. **Lack of Feedback Loops**: Clubs cannot easily measure student satisfaction or pinpoint areas for improvement after workshops.
5. **Decentralized Administration**: College management lacks a central real-time view of student involvement, active clubs, and event quality.

---

### 2. Proposed Solution
The **Smart College Event and Club Management System** is a unified, full-stack MERN application that streamlines the entire campus activity lifecycle for all three principal stakeholders:
- **Students**: An intuitive self-service portal to browse approved clubs, join organizations, reserve seats for events in real time, view an interactive activities calendar, read announcements, and submit ratings and feedback.
- **Club Heads**: An operations workspace to schedule events, manage capacity limits, broadcast announcements to members, and record digital attendance for registered attendees.
- **College Administrators**: An executive governance dashboard providing moderation oversight for new club proposals and high-level analytical counters (student enrollment, active clubs, event frequency, and average ratings).

---

### 3. System Architecture & Tech Stack

```
+-----------------------------------------------------------+
|                     Client (Frontend)                     |
|           React 18 + Vite + Tailwind CSS + Router         |
+-----------------------------------------------------------+
                             |
                   HTTP / REST APIs (JSON)
                   Authorization: Bearer <JWT>
                             |
+-----------------------------------------------------------+
|                     Server (Backend)                      |
|             Node.js + Express.js + Middleware             |
|   [Auth & JWT]  [Role Guards]  [Validation & Logging]     |
+-----------------------------------------------------------+
                             |
                      Mongoose ODM
                             |
+-----------------------------------------------------------+
|                    Database (MongoDB)                     |
|    Users  |  Clubs  |  Events  |  Announcements  | Reviews|
+-----------------------------------------------------------+
```

#### Technology Stack Components
- **Frontend Framework**: React 18 with Vite for lightning-fast HMR and optimized builds.
- **Styling**: Tailwind CSS with custom responsive typography and utility palettes.
- **Icons**: Lucide React for modern, scalable SVG icons.
- **Backend Runtime**: Node.js v24 with ES Modules (`import/export`).
- **REST Framework**: Express.js with JSON body parsing, CORS headers, and Morgan logging.
- **Database Layer**: MongoDB (Atlas cloud cluster or local) with Mongoose object modeling.
- **Security Protocols**:
  - Salting and hashing of passwords with `bcryptjs` (pre-save middleware).
  - Stateless authentication tokens via JSON Web Tokens (`jsonwebtoken`).
  - Role-based authorization middleware restricting admin and club head capabilities.

---

### 4. Database Schema Design

#### 4.1 User Schema (`User.js`)
- `name`: String (Required)
- `email`: String (Required, Unique, Lowercase)
- `password`: String (Hashed with bcrypt, hidden from default selects)
- `role`: Enum `['student', 'club_head', 'admin']` (Default: `'student'`)
- `department`: String (e.g. `'Computer Science'`)
- `year`: String (e.g. `'3rd Year'`)
- `clubsJoined`: Array of `ObjectId` references to `Club`

#### 4.2 Club Schema (`Club.js`)
- `name`: String (Required, Unique)
- `description`: String (Required)
- `category`: Enum `['Technical', 'Cultural', 'Sports', 'Literary', 'Social Service', 'Arts & Media', 'Other']`
- `clubHead`: `ObjectId` reference to `User` (Required)
- `members`: Array of `ObjectId` references to `User`
- `status`: Enum `['pending', 'approved', 'rejected']` (Default: `'pending'`)
- `bannerImage`: String URL
- `contactEmail`: String

#### 4.3 Event Schema (`Event.js`)
- `title`: String (Required)
- `description`: String (Required)
- `club`: `ObjectId` reference to `Club` (Required)
- `date`: Date (Required)
- `time`: String (Required)
- `venue`: String (Required)
- `totalSeats`: Number (Required)
- `availableSeats`: Number (Required, with validation prevent negative values)
- `registeredStudents`: Array of `ObjectId` references to `User`
- `attendance`: Array of `{ student: ObjectId, present: Boolean, markedAt: Date }`
- `status`: Enum `['upcoming', 'ongoing', 'completed', 'cancelled']`
- `posterImage`: String URL

#### 4.4 Announcement Schema (`Announcement.js`)
- `title`: String (Required)
- `message`: String (Required)
- `club`: `ObjectId` reference to `Club` (Optional; null indicates campus-wide)
- `createdBy`: `ObjectId` reference to `User` (Required)
- `category`: String

#### 4.5 Feedback Schema (`Feedback.js`)
- `event`: `ObjectId` reference to `Event` (Required)
- `student`: `ObjectId` reference to `User` (Required)
- `rating`: Number (1 to 5, Required)
- `comment`: String (Required)
- **Compound Unique Index**: `{ event: 1, student: 1 }` prevents duplicate student submissions for the same event.

---

### 5. Division of Work (3-Week Implementation Summary)

| Team Member | Module Responsibilities | Implemented Features |
| :--- | :--- | :--- |
| **Member 1** | Authentication, User Profiles, Club Creation & Membership | - User Model with bcrypt password encryption<br>- JWT Token issuing & route guard middleware<br>- Signup, Login, and Profile screens<br>- Club schema and creation workflow (pending admin review)<br>- "Join Club" logic with duplicate prevention |
| **Member 2** | Events Management, Capacity Engine, Calendar & Filtering | - Event Schema & CRUD endpoints<br>- Real-time seat reservation engine<br>- "All Events" gallery with search & category filters<br>- "My Registrations" student dashboard<br>- Interactive monthly & daily calendar schedule |
| **Member 3** | Announcements, Attendance, Feedback Engine & Admin Dashboard | - Club and college-wide announcements feed<br>- Digital Attendance register for registered attendees<br>- 5-Star rating and reviews submission with duplicate check<br>- Executive Admin Dashboard with metric cards<br>- Club proposal approval & rejection workflows |

---

### 6. Verification & Test Journey

The application was validated end-to-end against the test scenario specified in the project plan:
1. **Sign up / Log in as Club Head**: Successfully registered/authenticated as `alex.head@college.edu`.
2. **Submit Club Proposal**: Created "Green Earth Environmental Society"; confirmed state initialized to `pending`.
3. **Admin Moderation**: Logged in as `admin@college.edu`, inspected the pending list, and approved the club.
4. **Create Event**: Created "Annual Hackathon" with seat capacity set to 50.
5. **Student Registration**: Authenticated as `priya.patel@college.edu`, registered for the event; confirmed available seat counter decremented from 50 to 49 and prevented double registration.
6. **Mark Attendance**: Switched to Club Head workspace; marked registered student as Present; confirmed record saved.
7. **Feedback Submission**: Student submitted a 5-star rating and comment; verified average rating updated in database.
8. **Admin Metrics Verification**: Confirmed Admin Panel reflected updated student counts, club approvals, and average ratings in real time.

---

### 7. Conclusion
The **Smart College Event and Club Management System** delivers a robust, scalable, and responsive solution for university activity coordination. By automating registrations, digitizing attendance, and providing administrative visibility, the system reduces manual overhead and elevates student campus engagement.
