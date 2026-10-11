import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  // Registration state
  const [registering, setRegistering] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  // Feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const [evtRes, feedRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/feedback/event/${id}`),
      ]);

      if (evtRes.success) setEvent(evtRes.event);
      if (feedRes.success) {
        setFeedbacks(feedRes.feedbacks || []);
        setAvgRating(feedRes.averageRating || 0);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const userIdStr = user?._id?.toString();
  const isRegistered = Boolean(
    event &&
      event.registeredStudents?.some(
        (st) => (typeof st === 'string' ? st : st._id)?.toString() === userIdStr
      )
  );

  const hasGivenFeedback = Boolean(
    feedbacks.some(
      (f) => (typeof f.student === 'string' ? f.student : f.student?._id)?.toString() === userIdStr
    )
  );

  const isFull = Boolean(event && event.availableSeats <= 0);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setToastMsg({ text: '', type: '' });

    try {
      const res = await api.post(`/events/${id}/register`);
      setToastMsg({ text: res.message || 'Successfully registered for this event!', type: 'success' });
      fetchEventData();
    } catch (err) {
      setToastMsg({ text: err.message || 'Registration failed.', type: 'error' });
    } finally {
      setRegistering(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setSubmittingFeedback(true);

    try {
      await api.post(`/feedback/event/${id}`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      setIsFeedbackModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      setToastMsg({ text: 'Thank you for your rating & feedback!', type: 'success' });
      fetchEventData();
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner text="Loading event details..." />;
  if (!event) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <Link to="/events" className="text-indigo-600 text-sm font-semibold hover:underline">
          ← Back to Events List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMsg.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center space-x-2.5 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      <Link
        to="/events"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to All Events</span>
      </Link>

      {/* Main Event Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-72 relative bg-slate-100">
          <img
            src={event.posterImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                  {event.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    event.status === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : event.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {event.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{event.title}</h1>
              <p className="text-sm text-indigo-200 mt-1">
                Hosted by {event.club?.name || 'College Society'}
              </p>
            </div>

            {/* RSVP Button */}
            <div>
              {isRegistered ? (
                <div className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center space-x-2 shadow-md cursor-default">
                  <CheckCircle size={18} />
                  <span>You Are Registered ✓</span>
                </div>
              ) : isFull ? (
                <div className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm flex items-center space-x-2 shadow-md cursor-default">
                  <AlertCircle size={18} />
                  <span>Event Full</span>
                </div>
              ) : event.status === 'upcoming' ? (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center space-x-2 shadow-md shadow-indigo-500/30 transition-all"
                >
                  <Sparkles size={18} />
                  <span>{registering ? 'Registering...' : 'Register for Event'}</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">About this Event</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Seating Availability */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Seating Capacity</span>
                <span
                  className={`font-bold ${
                    isFull ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {isFull
                    ? '0 Seats Left (Full)'
                    : `${event.availableSeats} of ${event.totalSeats} seats remaining`}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100
                      )
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Logistics Box */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 text-xs text-slate-600">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Event Logistics
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2.5">
                  <Calendar size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium">Date</span>
                    <strong className="text-slate-800">{formatDate(event.date)}</strong>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Clock size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium">Time</span>
                    <strong className="text-slate-800">{event.time}</strong>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <MapPin size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium">Location</span>
                    <strong className="text-slate-800">{event.venue}</strong>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Users size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-slate-400 font-medium">Registered Attendees</span>
                    <strong className="text-slate-800">
                      {event.registeredStudents?.length || 0} students
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {event.club && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Organizing Club
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{event.club.name}</h4>
                <Link
                  to={`/clubs/${event.club._id}`}
                  className="inline-block text-indigo-600 font-semibold hover:underline"
                >
                  View Club Profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ratings & Feedback Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-900">Attendee Reviews & Feedback</h2>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-800 text-xs font-bold">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{avgRating} / 5</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Based on {feedbacks.length} participant {feedbacks.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Show review button only if user registered and hasn't left feedback yet */}
          {isRegistered && !hasGivenFeedback && (
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
            >
              <MessageSquare size={16} />
              <span>Leave Feedback & Rating</span>
            </button>
          )}

          {hasGivenFeedback && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              ✓ You submitted feedback
            </span>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm space-y-1">
            <p>No reviews yet for this event.</p>
            {isRegistered && !hasGivenFeedback && (
              <p className="text-xs text-indigo-600 font-medium">
                Be the first to share your experience!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {item.student?.name?.slice(0, 2) || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {item.student?.name || 'Verified Student'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.student?.department || 'Student'}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={item.rating} size={14} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Rate & Review Event"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {feedbackError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{feedbackError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center space-x-3">
              <StarRating
                rating={reviewRating}
                interactive={true}
                onRatingChange={(newVal) => setReviewRating(newVal)}
                size={28}
              />
              <span className="text-sm font-bold text-slate-700">
                {reviewRating} of 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Your Comments & Feedback
            </label>
            <textarea
              required
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you learn? How was the organization and speaker?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
