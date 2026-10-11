import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Clock3,
  Star,
  ExternalLink,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const MyRegistrationsPage = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/events/my/registrations');
        if (res.success) {
          setRegistrations(res.events);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAttendanceStatus = (event) => {
    if (!event.attendance || event.attendance.length === 0) {
      return { label: 'Pending Attendance', color: 'bg-slate-100 text-slate-700' };
    }
    const myRecord = event.attendance.find(
      (a) => (typeof a.student === 'string' ? a.student : a.student?._id) === user?._id
    );
    if (!myRecord) {
      return { label: 'Pending Attendance', color: 'bg-slate-100 text-slate-700' };
    }
    return myRecord.present
      ? { label: 'Attended (Present)', color: 'bg-emerald-100 text-emerald-800' }
      : { label: 'Absent', color: 'bg-rose-100 text-rose-800' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Registered Events</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your campus event tickets, attendance records, and review attended sessions.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching your registrations..." />
      ) : registrations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Ticket size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No event registrations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't signed up for any events yet. Check out the campus schedule and grab your seat!
          </p>
          <Link
            to="/events"
            className="inline-block mt-3 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            Explore Events →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((evt) => {
            const attendance = getAttendanceStatus(evt);

            return (
              <div
                key={evt._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-600">
                      {evt.club?.name || 'College Event'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${attendance.color}`}>
                      {attendance.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(evt.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-slate-400" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle size={15} />
                    <span>Seat Confirmed</span>
                  </div>

                  <Link
                    to={`/events/${evt._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>View Ticket & Review</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
