import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/events');
        if (res.success) {
          setEvents(res.events);
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents([]);
    setSelectedDateStr('');
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents([]);
    setSelectedDateStr('');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getEventsForDay = (day) => {
    return events.filter((evt) => {
      const evtDate = new Date(evt.date);
      return (
        evtDate.getFullYear() === year &&
        evtDate.getMonth() === month &&
        evtDate.getDate() === day
      );
    });
  };

  const handleSelectDay = (day) => {
    const dayEvts = getEventsForDay(day);
    setSelectedDayEvents(dayEvts);
    setSelectedDateStr(`${monthNames[month]} ${day}, ${year}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Calendar</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore the schedule of college workshops, competitions, cultural events, and seminars by date.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading events calendar..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days tiles */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50"></div>
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvts = getEventsForDay(day);
                const hasEvents = dayEvts.length > 0;
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => handleSelectDay(day)}
                    className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      hasEvents
                        ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer'
                    } ${isToday ? 'ring-2 ring-indigo-600' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]'
                            : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                      {hasEvents && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>

                    {hasEvents && (
                      <div className="space-y-1 overflow-hidden">
                        {dayEvts.slice(0, 2).map((e) => (
                          <div
                            key={e._id}
                            className="text-[10px] truncate bg-white px-1.5 py-0.5 rounded font-medium text-indigo-700 border border-indigo-100 shadow-2xs"
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvts.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-semibold block text-right">
                            +{dayEvts.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail & Agenda Sidebar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {selectedDateStr ? `Events for ${selectedDateStr}` : 'Selected Date Schedule'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedDateStr
                  ? `${selectedDayEvents.length} event(s) scheduled`
                  : 'Click any date on the calendar to view scheduled activities'}
              </p>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CalendarIcon size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-medium">No events on this date</p>
                <p className="text-xs text-slate-400">Click a day highlighted in blue to see events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors"
                  >
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {evt.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Clock size={12} className="text-slate-400" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>

                    <Link
                      to={`/events/${evt._id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:underline pt-1"
                    >
                      <span>View Event & Register</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
