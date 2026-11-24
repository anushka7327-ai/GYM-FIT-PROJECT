import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, UserPlus, AlertCircle, Award, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    phone: '',
    address: '',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-6 h-6 font-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create GymFit Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose your role and start your fitness transformation today
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'member' })}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  formData.role === 'member'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Award className={`w-5 h-5 ${formData.role === 'member' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Gym Member</div>
                  <div className="text-[10px] text-slate-400">Log workouts & buy plans</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'trainer' })}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  formData.role === 'trainer'
                    ? 'bg-cyan-500/15 border-cyan-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Briefcase className={`w-5 h-5 ${formData.role === 'trainer' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Fitness Trainer</div>
                  <div className="text-[10px] text-slate-400">Build & assign routines</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password (min 6 chars)
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {formData.role === 'trainer' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Trainer Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Strength & Conditioning, HIIT, Functional Hypertrophy"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Home Address / Location
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Los Angeles, CA"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : `Register as ${formData.role === 'trainer' ? 'Trainer' : 'Member'}`}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
