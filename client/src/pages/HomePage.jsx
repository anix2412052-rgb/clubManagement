import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Compass,
  Users,
  Award,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
  Bell,
  Star,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HomePage = () => {
  const { user, login } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [popularClubs, setPopularClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [eventsRes, clubsRes, announceRes] = await Promise.all([
          api.get('/events?status=upcoming'),
          api.get('/clubs'),
          api.get('/announcements'),
        ]);

        if (eventsRes.success) setUpcomingEvents(eventsRes.events.slice(0, 3));
        if (clubsRes.success) setPopularClubs(clubsRes.clubs.slice(0, 4));
        if (announceRes.success) setAnnouncements(announceRes.announcements.slice(0, 3));
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleQuickLogin = async (email) => {
    setDemoLoginLoading(true);
    try {
      await login(email, 'password123');
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setDemoLoginLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold shadow-xs">
              <Sparkles size={14} />
              <span>Smart College Event & Club Hub</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Discover Campus Life,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Join Clubs & Events
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A unified campus platform for students, club leaders, and faculty. Browse upcoming hackathons, workshops, cultural fests, and manage club memberships in one place.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-200 transition-all flex items-center space-x-2"
              >
                <span>Explore Events</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/clubs"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm border border-slate-200 shadow-xs transition-all flex items-center space-x-2"
              >
                <Users size={16} />
                <span>Browse Clubs</span>
              </Link>
            </div>
          </div>

          {/* Quick Demo Login Bar for Presentations */}
          <div className="mt-12 max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-sm p-4 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              ⚡ Instant Demo Switcher (Click to Test Any Role)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleQuickLogin('priya.patel@college.edu')}
                disabled={demoLoginLoading}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium border border-indigo-200 transition-colors"
              >
                🎓 Login as Student (Priya)
              </button>
              <button
                onClick={() => handleQuickLogin('alex.head@college.edu')}
                disabled={demoLoginLoading}
                className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200 transition-colors"
              >
                🎯 Login as Club Head (Alex)
              </button>
              <button
                onClick={() => handleQuickLogin('admin@college.edu')}
                disabled={demoLoginLoading}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200 transition-colors"
              >
                👑 Login as Admin (Dr. Miller)
              </button>
            </div>
            {user && (
              <p className="text-[11px] text-emerald-600 font-medium mt-2">
                ✓ Currently logged in as: <span className="font-bold">{user.name}</span> ({user.role})
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">25+</p>
              <p className="text-xs text-slate-500 font-medium">Campus Events</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">12+</p>
              <p className="text-xs text-slate-500 font-medium">Student Clubs</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">1,500+</p>
              <p className="text-xs text-slate-500 font-medium">Active Students</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">4.8 / 5</p>
              <p className="text-xs text-slate-500 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Events</h2>
            <p className="text-sm text-slate-500">Upcoming workshops, hackathons, and gatherings</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading events..." />
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-slate-500">No upcoming events scheduled right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <img
                    src={evt.posterImage}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-indigo-700 shadow-xs">
                    {evt.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 mb-1">
                      {evt.club?.name || 'College Event'}
                    </p>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(evt.date)} • {evt.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        evt.availableSeats > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {evt.availableSeats > 0 ? `${evt.availableSeats} seats left` : 'Event Full'}
                    </span>
                    <Link
                      to={`/events/${evt._id}`}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Details & RSVP
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Clubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Student Clubs</h2>
            <p className="text-sm text-slate-500">Find your community and explore passions</p>
          </div>
          <Link
            to="/clubs"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All Clubs</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularClubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-slate-100 overflow-hidden relative">
                <img
                  src={club.bannerImage}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900/70 text-white">
                  {club.category}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{club.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{club.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {club.members?.length || 0} members
                  </span>
                  <Link
                    to={`/clubs/${club._id}`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    View Club →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Bell className="text-amber-400" size={20} />
                <h3 className="text-lg font-bold">Latest Campus Announcements</h3>
              </div>
              <Link
                to="/announcements"
                className="text-xs font-semibold text-indigo-200 hover:text-white"
              >
                All Announcements →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {item.club?.name || 'Campus Wide'}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-1 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
