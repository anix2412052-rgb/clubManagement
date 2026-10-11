import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Calendar,
  Users,
  Bell,
  Ticket,
  Shield,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isStudent, isClubHead, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const roleBadgeColor = {
    admin: 'bg-rose-100 text-rose-800 border-rose-200',
    club_head: 'bg-purple-100 text-purple-800 border-purple-200',
    student: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  const roleName = {
    admin: 'Admin',
    club_head: 'Club Head',
    student: 'Student',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-transparent">
                CampusHub
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Events & Clubs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/events"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/events')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass size={16} />
              <span>Events</span>
            </Link>

            <Link
              to="/clubs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/clubs')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users size={16} />
              <span>Clubs</span>
            </Link>

            <Link
              to="/calendar"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/calendar')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar size={16} />
              <span>Calendar</span>
            </Link>

            <Link
              to="/announcements"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/announcements')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bell size={16} />
              <span>Announcements</span>
            </Link>

            {/* Role-Specific Shortcuts */}
            {isAuthenticated && isStudent && (
              <Link
                to="/my-registrations"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/my-registrations')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Ticket size={16} />
                <span>My Registrations</span>
              </Link>
            )}

            {isAuthenticated && isClubHead && (
              <Link
                to="/club-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/club-dashboard')
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-purple-700 bg-purple-50/50 hover:bg-purple-100/70'
                }`}
              >
                <Briefcase size={16} />
                <span>Club Manager</span>
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-rose-700 bg-rose-50/50 hover:bg-rose-100/70'
                }`}
              >
                <Shield size={16} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* User Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.slice(0, 2) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-none">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-medium border px-1.5 py-0.5 rounded-full mt-0.5 ${
                        roleBadgeColor[user?.role] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {roleName[user?.role] || user?.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Events
          </Link>
          <Link
            to="/clubs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clubs
          </Link>
          <Link
            to="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Calendar
          </Link>
          <Link
            to="/announcements"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Announcements
          </Link>

          {isAuthenticated && isStudent && (
            <Link
              to="/my-registrations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50"
            >
              My Registrations
            </Link>
          )}

          {isAuthenticated && isClubHead && (
            <Link
              to="/club-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50"
            >
              Club Manager
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-700 bg-rose-50"
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200 mt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} />
                  <span>My Profile ({user?.name})</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
