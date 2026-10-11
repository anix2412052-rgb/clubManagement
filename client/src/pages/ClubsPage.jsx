import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, Search, Plus, Filter, CheckCircle, ShieldAlert } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Literary',
  'Social Service',
  'Arts & Media',
];

export const ClubsPage = () => {
  const { user, isAuthenticated, isClubHead, isAdmin } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Create club modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    category: 'Technical',
    contactEmail: '',
    bannerImage: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState({ error: '', success: '' });

  const fetchClubs = async () => {
    try {
      setLoading(true);
      let query = `?category=${selectedCategory}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(`/clubs${query}`);
      if (res.success) {
        setClubs(res.clubs);
      }
    } catch (err) {
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setModalFeedback({ error: '', success: '' });
    setSubmitting(true);

    try {
      const res = await api.post('/clubs', clubForm);
      setModalFeedback({ success: res.message || 'Club submitted successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        setClubForm({ name: '', description: '', category: 'Technical', contactEmail: '', bannerImage: '' });
        setModalFeedback({ error: '', success: '' });
        fetchClubs();
      }, 1500);
    } catch (err) {
      setModalFeedback({ error: err.message || 'Failed to submit club.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Clubs & Societies</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse campus clubs, explore leadership opportunities, and connect with like-minded peers.
          </p>
        </div>

        {(isClubHead || isAdmin) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create New Club</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name or keywords..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
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

      {/* Clubs Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching campus clubs..." />
      ) : clubs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Users size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No clubs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or explore another category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={club.bannerImage}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-indigo-700 shadow-xs">
                  {club.category}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900/80 text-white">
                  {club.members?.length || 0} Members
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">
                    {club.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 truncate">
                    Lead: <span className="font-semibold text-slate-700">{club.clubHead?.name || 'Club Head'}</span>
                  </div>
                  <Link
                    to={`/clubs/${club._id}`}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Club Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register a New Student Club"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          {modalFeedback.error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
              <ShieldAlert size={16} />
              <span>{modalFeedback.error}</span>
            </div>
          )}
          {modalFeedback.success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>{modalFeedback.success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Club Name
            </label>
            <input
              type="text"
              required
              value={clubForm.name}
              onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
              placeholder="e.g. CyberSecurity & Ethical Hacking Guild"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Category
            </label>
            <select
              value={clubForm.category}
              onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            >
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Literary">Literary</option>
              <option value="Social Service">Social Service</option>
              <option value="Arts & Media">Arts & Media</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description & Objectives
            </label>
            <textarea
              required
              rows={3}
              value={clubForm.description}
              onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
              placeholder="Explain the mission, typical events, and goals of this club..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              value={clubForm.bannerImage}
              onChange={(e) => setClubForm({ ...clubForm, bannerImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800">
            ℹ️ <strong>Note:</strong> Club submissions require approval by a College Administrator before appearing on the public clubs directory.
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
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
