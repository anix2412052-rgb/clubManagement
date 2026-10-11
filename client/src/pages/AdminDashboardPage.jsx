import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  Calendar,
  Award,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Search,
  AlertCircle,
  Ticket,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'allClubs', 'users'

  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });
  const [actionLoading, setActionLoading] = useState({});

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, clubsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/clubs'),
        api.get('/admin/users'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (clubsRes.success) setClubs(clubsRes.clubs);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateClubStatus = async (clubId, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [clubId]: true }));
    try {
      const res = await api.put(`/admin/clubs/${clubId}/status`, { status: newStatus });
      setToastMsg({ text: res.message || `Club ${newStatus}!`, type: 'success' });
      fetchAdminData();
    } catch (err) {
      setToastMsg({ text: err.message || 'Status update failed.', type: 'error' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [clubId]: false }));
      setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
    }
  };

  const pendingClubs = clubs.filter((c) => c.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Administrator Panel
          </h1>
          <p className="text-sm text-slate-500">
            High-level campus analytics, student clubs moderation, and ecosystem management.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading campus analytics..." />
      ) : (
        <>
          {/* Numbers in simple boxes (Day 12 & 13 requirement) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Students</span>
              <p className="text-2xl font-black text-slate-800">{stats?.totalStudents || 0}</p>
              <span className="text-[11px] text-emerald-600 font-medium">Active Enrolled</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Approved Clubs</span>
              <p className="text-2xl font-black text-indigo-600">{stats?.approvedClubs || 0}</p>
              <span className="text-[11px] text-amber-600 font-medium">
                {stats?.pendingClubs || 0} Pending Approvals
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Events</span>
              <p className="text-2xl font-black text-slate-800">{stats?.totalEvents || 0}</p>
              <span className="text-[11px] text-indigo-600 font-medium">
                {stats?.upcomingEvents || 0} Upcoming
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Average Rating</span>
              <p className="text-2xl font-black text-amber-500 flex items-center space-x-1">
                <span>{stats?.averageRating || 0}</span>
                <span className="text-xs text-slate-400 font-normal">/ 5</span>
              </p>
              <span className="text-[11px] text-slate-400">
                {stats?.totalFeedbacks || 0} Reviews
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
              <span className="text-xs text-slate-500 font-medium">Total Registrations</span>
              <p className="text-2xl font-black text-emerald-600">{stats?.totalRegistrations || 0}</p>
              <span className="text-[11px] text-slate-400">Tickets Claimed</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === 'pending'
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              ⏳ Pending Approvals ({pendingClubs.length})
              {pendingClubs.length > 0 && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-rose-600 inline-block align-middle"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('allClubs')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'allClubs'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              🏛️ All Clubs ({clubs.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              👥 Registered Users ({users.length})
            </button>
          </div>

          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
            pendingClubs.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <CheckCircle size={36} className="mx-auto text-emerald-500" />
                <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
                <p className="text-xs text-slate-500">
                  There are no pending club approval requests at this moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClubs.map((club) => (
                  <div
                    key={club._id}
                    className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          Pending Moderation
                        </span>
                        <span className="text-xs font-semibold text-indigo-600">
                          {club.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{club.name}</h3>
                      <p className="text-xs text-slate-600 max-w-xl">{club.description}</p>
                      <p className="text-xs text-slate-400 pt-1">
                        Submitted by: <strong className="text-slate-700">{club.clubHead?.name}</strong> ({club.clubHead?.email})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleUpdateClubStatus(club._id, 'approved')}
                        disabled={actionLoading[club._id]}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <CheckCircle size={15} />
                        <span>Approve Club</span>
                      </button>
                      <button
                        onClick={() => handleUpdateClubStatus(club._id, 'rejected')}
                        disabled={actionLoading[club._id]}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1"
                      >
                        <XCircle size={15} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* All Clubs Tab */}
          {activeTab === 'allClubs' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Club Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Club Head</th>
                      <th className="py-3.5 px-4">Members</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clubs.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{c.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{c.category}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {c.clubHead?.name || 'Assigned Lead'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">
                          {c.members?.length || 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : c.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          {c.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateClubStatus(c._id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg"
                            >
                              Approve
                            </button>
                          )}
                          {c.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateClubStatus(c._id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Directory Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4">Clubs Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : u.role === 'club_head'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{u.department || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-600">{u.year || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {u.clubsJoined?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
