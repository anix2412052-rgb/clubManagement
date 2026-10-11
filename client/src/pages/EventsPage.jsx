import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Filter,
  Users,
  Compass,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Literary',
  'Social Service',
];

export const EventsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');
  const [statusFilter, setStatusFilter] = useState('upcoming');

  // Quick RSVP state
  const [rsvpLoading, setRsvpLoading] = useState({});
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = `?status=${statusFilter}`;
      if (selectedCategory !== 'All') query += `&category=${selectedCategory}`;
      if (selectedClub !== 'All') query += `&club=${selectedClub}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(`/events${query}`);
      if (res.success) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubsList = async () => {
    try {
      const res = await api.get('/clubs');
      if (res.success) setClubs(res.clubs);
    } catch (err) {
      console.error('Error fetching clubs list:', err);
    }
  };

  useEffect(() => {
    fetchClubsList();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedClub, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));
    setToastMsg({ text: '', type: '' });

    try {
      const res = await api.post(`/events/${eventId}/register`);
      setToastMsg({ text: res.message || 'Registered successfully!', type: 'success' });
      fetchEvents();
    } catch (err) {
      setToastMsg({ text: err.message || 'Registration failed.', type: 'error' });
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
      setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Alert */}
      {toastMsg.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-medium transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse hackathons, technical workshops, festivals, and activities happening across campus.
          </p>
        </div>

        {/* Status Toggle (Upcoming vs Completed) */}
        <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'upcoming'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, venue, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
            >
              <option value="All">All Clubs</option>
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
          >
            Filter
          </button>
        </form>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Grid */}
      {loading ? (
        <LoadingSpinner text="Loading events..." />
      ) : events.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Compass size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or check back later for newly announced activities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const userIdStr = user?._id?.toString();
            const isRegistered = evt.registeredStudents?.some(
              (id) => (typeof id === 'string' ? id : id._id)?.toString() === userIdStr
            );
            const isFull = evt.availableSeats <= 0;

            return (
              <div
                key={evt._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                <div className="h-44 relative bg-slate-100 overflow-hidden">
                  <img
                    src={evt.posterImage}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-indigo-700 shadow-xs">
                    {evt.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white">
                    {evt.club?.name || 'Campus Wide'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Timing & Venue details */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-indigo-500 shrink-0" />
                      <span>{formatDate(evt.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-indigo-500 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} className="text-indigo-500 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Seating Progress */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500">Available Seats:</span>
                      <span
                        className={
                          isFull
                            ? 'text-red-600 font-bold'
                            : 'text-emerald-600 font-bold'
                        }
                      >
                        {isFull ? 'Event Full' : `${evt.availableSeats} of ${evt.totalSeats}`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-red-500' : 'bg-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((evt.totalSeats - evt.availableSeats) / evt.totalSeats) * 100
                            )
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Link
                      to={`/events/${evt._id}`}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Details →
                    </Link>

                    {evt.status === 'upcoming' && (
                      isRegistered ? (
                        <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                          Registered ✓
                        </span>
                      ) : isFull ? (
                        <span className="px-3.5 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">
                          Full
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(evt._id)}
                          disabled={rsvpLoading[evt._id]}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                        >
                          {rsvpLoading[evt._id] ? 'Registering...' : 'Quick Register'}
                        </button>
                      )
                    )}

                    {evt.status === 'completed' && (
                      <Link
                        to={`/events/${evt._id}`}
                        className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl"
                      >
                        Reviews & Attendance
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
