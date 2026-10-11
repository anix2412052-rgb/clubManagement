import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Plus,
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Clock,
  MapPin,
  ClipboardCheck,
  Building2,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const ClubHeadDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'attendance', 'clubs'
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    clubId: '',
    date: '',
    time: '10:00 AM - 01:00 PM',
    venue: '',
    totalSeats: 50,
    category: 'Technical',
    posterImage: '',
  });

  // Attendance management state
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsRes, eventsRes] = await Promise.all([
        api.get('/clubs/my/managed'),
        api.get('/events'),
      ]);

      if (clubsRes.success) {
        setClubs(clubsRes.clubs);
        if (clubsRes.clubs.length > 0 && !eventForm.clubId) {
          setEventForm((prev) => ({ ...prev, clubId: clubsRes.clubs[0]._id }));
        }
      }

      if (eventsRes.success) {
        // Filter events belonging to managed clubs
        const managedClubIds = new Set(clubsRes.clubs.map((c) => c._id));
        const myEvts = eventsRes.events.filter((e) =>
          managedClubIds.has(typeof e.club === 'string' ? e.club : e.club?._id)
        );
        setEvents(myEvts);
      }
    } catch (err) {
      console.error('Error fetching club head data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      description: '',
      clubId: clubs[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM',
      venue: '',
      totalSeats: 50,
      category: 'Technical',
      posterImage: '',
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt) => {
    setEditingEventId(evt._id);
    const dateFormatted = evt.date ? new Date(evt.date).toISOString().split('T')[0] : '';
    setEventForm({
      title: evt.title,
      description: evt.description,
      clubId: typeof evt.club === 'string' ? evt.club : evt.club?._id,
      date: dateFormatted,
      time: evt.time,
      venue: evt.venue,
      totalSeats: evt.totalSeats,
      category: evt.category || 'Technical',
      posterImage: evt.posterImage || '',
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, eventForm);
        setToastMsg({ text: 'Event updated successfully!', type: 'success' });
      } else {
        await api.post('/events', eventForm);
        setToastMsg({ text: 'Event created successfully!', type: 'success' });
      }
      setIsEventModalOpen(false);
      fetchData();
    } catch (err) {
      setToastMsg({ text: err.message || 'Error saving event.', type: 'error' });
    } finally {
      setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setToastMsg({ text: 'Event cancelled.', type: 'success' });
      fetchData();
    } catch (err) {
      setToastMsg({ text: err.message || 'Error cancelling event.', type: 'error' });
    }
  };

  // Start marking attendance for an event
  const handleSelectEventForAttendance = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}`);
      if (res.success) {
        const fullEvt = res.event;
        setSelectedEventForAttendance(fullEvt);

        // Prepopulate records based on registered students and any existing attendance
        const existingMap = new Map();
        if (fullEvt.attendance) {
          fullEvt.attendance.forEach((a) => {
            const sid = typeof a.student === 'string' ? a.student : a.student?._id;
            existingMap.set(sid, a.present);
          });
        }

        const initialList = (fullEvt.registeredStudents || []).map((student) => {
          const sid = student._id;
          return {
            studentId: sid,
            name: student.name,
            department: student.department,
            present: existingMap.has(sid) ? existingMap.get(sid) : true,
          };
        });

        setAttendanceRecords(initialList);
        setActiveTab('attendance');
      }
    } catch (err) {
      setToastMsg({ text: err.message || 'Failed to load attendee list.', type: 'error' });
    }
  };

  const toggleAttendanceStatus = (studentId) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, present: !r.present } : r
      )
    );
  };

  const markAll = (presentVal) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, present: presentVal }))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedEventForAttendance) return;
    setSavingAttendance(true);

    try {
      const payload = {
        attendanceRecords: attendanceRecords.map((r) => ({
          studentId: r.studentId,
          present: r.present,
        })),
      };

      await api.post(`/events/${selectedEventForAttendance._id}/attendance`, payload);
      setToastMsg({ text: 'Attendance recorded successfully!', type: 'success' });
      fetchData();
    } catch (err) {
      setToastMsg({ text: err.message || 'Failed to save attendance.', type: 'error' });
    } finally {
      setSavingAttendance(false);
      setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast */}
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Club Head Management Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize campus events, monitor seat capacities, and mark student attendance.
          </p>
        </div>

        <button
          onClick={handleOpenCreateEvent}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'events'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📅 My Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'attendance'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📋 Mark Attendance {selectedEventForAttendance && `(${selectedEventForAttendance.title.slice(0, 20)}...)`}
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'clubs'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏛️ Managed Clubs ({clubs.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading dashboard..." />
      ) : activeTab === 'events' ? (
        /* Events Tab */
        events.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Calendar size={40} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No events created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Create New Event" button to schedule your club's first campus workshop or competition.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Event Title</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Venue</th>
                    <th className="py-3.5 px-4">Registrations</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((evt) => (
                    <tr key={evt._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {evt.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(evt.date).toLocaleDateString()} • {evt.time}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{evt.venue}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">
                          {evt.registeredStudents?.length || 0} / {evt.totalSeats}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            evt.status === 'upcoming'
                              ? 'bg-blue-50 text-blue-700'
                              : evt.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleSelectEventForAttendance(evt._id)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg"
                          title="Mark Attendance"
                        >
                          Take Attendance
                        </button>
                        <button
                          onClick={() => handleOpenEditEvent(evt)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleCancelEvent(evt._id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Cancel Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : activeTab === 'attendance' ? (
        /* Attendance Tab */
        !selectedEventForAttendance ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <ClipboardCheck size={40} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No event selected</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please choose an event from the "My Events" tab and click "Take Attendance".
            </p>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Attendance Tracker
                </span>
                <h2 className="text-xl font-bold text-slate-900">{selectedEventForAttendance.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total Registered Students: {attendanceRecords.length}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => markAll(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  {savingAttendance ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>

            {attendanceRecords.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs">
                No students registered for this event yet. Attendance can only be taken for registered students.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendanceRecords.map((item) => (
                  <div
                    key={item.studentId}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.department || 'Student'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAttendanceStatus(item.studentId)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        item.present
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {item.present ? '✓ Present' : '✗ Absent'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        /* Clubs Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clubs.map((c) => (
            <div
              key={c._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {c.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    c.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Total Members: <strong>{c.members?.length || 0}</strong></span>
                <span>Contact: {c.contactEmail || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEventId ? 'Edit Event Details' : 'Schedule a New Event'}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Club
            </label>
            <select
              required
              value={eventForm.clubId}
              onChange={(e) => setEventForm({ ...eventForm, clubId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            >
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="e.g. AI Prompt Engineering Hack Night"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Explain the itinerary, target audience, and perks..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Time
              </label>
              <input
                type="text"
                required
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                placeholder="10:00 AM - 01:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Venue
              </label>
              <input
                type="text"
                required
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                placeholder="Auditorium / Lab 3"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Total Seat Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={eventForm.totalSeats}
                onChange={(e) => setEventForm({ ...eventForm, totalSeats: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Poster Image URL (Optional)
            </label>
            <input
              type="url"
              value={eventForm.posterImage}
              onChange={(e) => setEventForm({ ...eventForm, posterImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
