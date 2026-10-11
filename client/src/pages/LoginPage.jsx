import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500">
            Sign in to access events, clubs, and college activities
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </form>

        {/* Demo Fast Fill Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-700">Quick Test Accounts (Password: <code className="bg-slate-200 px-1 py-0.5 rounded">password123</code>):</p>
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => fillCredentials('priya.patel@college.edu')}
              className="text-left py-1 px-2 rounded bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
            >
              🎓 <strong>Student:</strong> priya.patel@college.edu
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('alex.head@college.edu')}
              className="text-left py-1 px-2 rounded bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-colors"
            >
              🎯 <strong>Club Head:</strong> alex.head@college.edu
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@college.edu')}
              className="text-left py-1 px-2 rounded bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            >
              👑 <strong>Admin:</strong> admin@college.edu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
