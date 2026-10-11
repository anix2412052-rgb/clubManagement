import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center">
          <Compass size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-xl font-bold text-slate-700">Page Not Found</h2>
        <p className="text-sm text-slate-500">
          The campus page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
