import React, { useState } from 'react';
import { User, Phone, MapPin, Dumbbell, ShieldCheck, Check, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfilePage() {
  const { user, refreshUser, role } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    specialization: user?.specialization || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const res = await api.updateMe(payload);
      if (res.success) {
        setSuccess('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal contact details, security credentials, and preferences.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700">
              Role: {role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                New Password (Optional, min 6 chars)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {role === 'trainer' ? (
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Coaching Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Strength & Conditioning Specialist"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="City, State"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
