import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Building2, Calendar, Award, CheckCircle, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    year: user?.year || '',
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        year: user.year || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      await updateProfile(formData);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 shadow-md">
        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-extrabold uppercase shadow-inner">
          {user?.name?.slice(0, 2) || 'U'}
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
          <p className="text-indigo-100 text-sm mt-1">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-indigo-200">
            <span>🏛️ {user?.department}</span>
            <span>🎓 {user?.year}</span>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
        >
          <Edit3 size={14} />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <CheckCircle size={18} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Edit Form or Information Card */}
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
            Edit Profile Details
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Current Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Clubs Joined Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clubs You've Joined</h2>
            <p className="text-xs text-slate-500">Communities and student societies you are an active member of</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
            {user?.clubsJoined?.length || 0} Clubs
          </span>
        </div>

        {(!user?.clubsJoined || user.clubsJoined.length === 0) ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Award size={32} className="mx-auto text-slate-300" />
            <p className="text-sm">You haven't joined any clubs yet.</p>
            <Link
              to="/clubs"
              className="inline-block mt-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Explore and join campus clubs →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.clubsJoined.map((club) => (
              <div
                key={typeof club === 'string' ? club : club._id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {club.name || 'Student Club'}
                  </h4>
                  <span className="inline-block text-[11px] font-medium text-slate-500">
                    Category: {club.category || 'General'}
                  </span>
                </div>
                <Link
                  to={`/clubs/${club._id || club}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View Club →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
