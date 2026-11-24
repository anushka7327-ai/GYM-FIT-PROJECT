import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuickLoginBadges from '../components/QuickLoginBadges';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-8 h-8 font-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome to GymFit</h1>
          <p className="text-sm text-slate-400 mt-1">
            Membership management & workout routine tracking
          </p>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        <QuickLoginBadges onSelect={() => navigate('/dashboard')} />

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. member@gymfit.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In to GymFit'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
            Register as Member or Trainer
          </Link>
        </p>
      </div>
    </div>
  );
}
