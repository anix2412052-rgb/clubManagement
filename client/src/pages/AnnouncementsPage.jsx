import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bell,
  Plus,
  Calendar,
  Building2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Megaphone,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const AnnouncementsPage = () => {
  const { user, isAuthenticated, isClubHead, isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedMode, setFeedMode] = useState('all'); // 'all' or 'feed'

  // Post announcement modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    clubId: '',
    category: 'General',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const endpoint = feedMode === 'feed' && isAuthenticated ? '/announcements/feed' : '/announcements';
      const res = await api.get(endpoint);
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagedClubs = async () => {
    if (isClubHead || isAdmin) {
      try {
        const res = await api.get('/clubs/my/managed');
        if (res.success) {
          setMyClubs(res.clubs);
          if (res.clubs.length > 0) {
            setFormData((prev) => ({ ...prev, clubId: res.clubs[0]._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
      }
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [feedMode]);

  useEffect(() => {
    fetchManagedClubs();
  }, [isAuthenticated, isClubHead, isAdmin]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/announcements', formData);
      setToastMsg({ text: res.message || 'Announcement posted successfully!', type: 'success' });
      setIsModalOpen(false);
      setFormData({ title: '', message: '', clubId: myClubs[0]?._id || '', category: 'General' });
      fetchAnnouncements();
    } catch (err) {
      setToastMsg({ text: err.message || 'Failed to post announcement.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      setToastMsg({ text: 'Announcement deleted.', type: 'success' });
      fetchAnnouncements();
    } catch (err) {
      setToastMsg({ text: err.message || 'Failed to delete announcement.', type: 'error' });
    } finally {
      setTimeout(() => setToastMsg({ text: '', type: '' }), 3000);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Alert */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates, club notices, deadline reminders, and campus circulars.
          </p>
        </div>

        {(isClubHead || isAdmin) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Feed Toggle */}
      {isAuthenticated && (
        <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit text-xs font-semibold">
          <button
            onClick={() => setFeedMode('all')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              feedMode === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Campus Notices
          </button>
          <button
            onClick={() => setFeedMode('feed')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              feedMode === 'feed'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Clubs Feed ⭐
          </button>
        </div>
      )}

      {/* Announcements List */}
      {loading ? (
        <LoadingSpinner text="Fetching announcements..." />
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Bell size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No announcements found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {feedMode === 'feed'
              ? 'Join campus clubs to receive their exclusive announcements in your personalized feed!'
              : 'There are no active announcements posted right now.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => {
            const isAuthor =
              user &&
              (isAdmin ||
                (typeof item.createdBy === 'string'
                  ? item.createdBy
                  : item.createdBy?._id) === user._id);

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {item.club ? item.club.name : 'College-Wide Notice'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  </div>

                  {isAuthor && (
                    <button
                      onClick={() => handleDeleteAnnouncement(item._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.message}
                </p>

                <div className="pt-2 text-xs text-slate-400 flex items-center space-x-1">
                  <span>Posted by:</span>
                  <strong className="text-slate-600">{item.createdBy?.name || 'Authorized Member'}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post an Announcement"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Club or Scope
            </label>
            <select
              value={formData.clubId}
              onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            >
              {isAdmin && <option value="">College-Wide Announcement</option>}
              {myClubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule Change for Workshop 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write the details of this announcement clearly..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              {submitting ? 'Posting...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
