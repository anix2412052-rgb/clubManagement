import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailsPage } from './pages/ClubDetailsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { ClubHeadDashboardPage } from './pages/ClubHeadDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/clubs/:id" element={<ClubDetailsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-registrations"
                element={
                  <ProtectedRoute allowedRoles={['student', 'club_head', 'admin']}>
                    <MyRegistrationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/club-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['club_head', 'admin']}>
                    <ClubHeadDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
