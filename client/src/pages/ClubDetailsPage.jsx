import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Calendar,
  Mail,
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ClubDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clubs/${id}`);
      if (res.success) {
        setClub(res.club);
        setEvents(res.events || []);
      }
    } catch (err) {
      console.error('Error fetching club details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [id]);

  const isMember = Boolean(
    user &&
      club &&
      club.members?.some(
        (m) => (typeof m === 'string' ? m : m._id) === user._id
      )
  );

  const handleJoinClub = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setJoining(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const res = await api.post(`/clubs/${id}/join`);
      setFeedbackMsg({ type: 'success', text: res.message || 'You joined the club!' });
      await refreshUser();
      fetchClubData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to join club.' });
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner text="Loading club details..." />;
  if (!club) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Club Not Found</h2>
        <Link to="/clubs" className="text-indigo-600 text-sm font-semibold hover:underline">
          ← Back to Clubs Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/clubs"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to All Clubs</span>
      </Link>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-64 relative bg-slate-100">
          <img
            src={club.bannerImage}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                {club.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">{club.name}</h1>
            </div>

            <div>
              {isMember ? (
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center space-x-2 shadow-md cursor-default"
                >
                  <CheckCircle size={18} />
                  <span>Member of Club ✓</span>
                </button>
              ) : (
                <button
                  onClick={handleJoinClub}
                  disabled={joining}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center space-x-2 shadow-md shadow-indigo-500/30 transition-all"
                >
                  <Sparkles size={18} />
                  <span>{joining ? 'Joining...' : 'Join Club'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {feedbackMsg.text && (
          <div
            className={`m-6 p-4 rounded-xl text-sm flex items-center space-x-2.5 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Club</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {club.description}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 text-xs text-slate-600">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Club Leadership</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-indigo-600" />
                <span>Head: <strong className="text-slate-800">{club.clubHead?.name}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-indigo-600" />
                <span className="truncate">{club.contactEmail || club.clubHead?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-indigo-600" />
                <span>Total Active Members: <strong className="text-slate-800">{club.members?.length || 0}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Hosted by this Club */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Events Hosted by {club.name}</h2>
        {events.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            No events currently scheduled for this club.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-indigo-600">{formatDate(evt.date)}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.status === 'upcoming'
                          ? 'bg-blue-50 text-blue-700'
                          : evt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{evt.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <MapPin size={14} />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <Link
                    to={`/events/${evt._id}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
