import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-bold text-slate-800">CampusHub</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              Smart College Event and Club Management System. Empowering student leadership, community engagement, and seamless campus activities.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/events" className="hover:text-indigo-600">Campus Events</a></li>
              <li><a href="/clubs" className="hover:text-indigo-600">Student Clubs</a></li>
              <li><a href="/calendar" className="hover:text-indigo-600">Activity Calendar</a></li>
              <li><a href="/announcements" className="hover:text-indigo-600">Announcements</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/login" className="hover:text-indigo-600">Student Login</a></li>
              <li><a href="/login" className="hover:text-indigo-600">Club Head Portal</a></li>
              <li><a href="/admin" className="hover:text-indigo-600">Administrator Panel</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampusHub System. Built with MERN Stack.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Designed for College Event & Club Management</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
