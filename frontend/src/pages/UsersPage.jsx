import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Dumbbell,
  Award,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { api } from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchTrainers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = roleFilter ? `?role=${roleFilter}` : '';
      const res = await api.getAllUsers(query);
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.getTrainers();
      if (res.success) {
        setTrainers(res.data || []);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAssignTrainer = async (memberId, trainerId) => {
    setError('');
    setSuccessMsg('');
    try {
      await api.assignTrainer({ memberId, trainerId: trainerId || null });
      setSuccessMsg('Trainer assignment updated successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to assign trainer');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            User & Role Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            GymFit Member & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign trainers to members, monitor staff accounts, and view registration dates.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRoleFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === ''
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('member')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === 'member'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setRoleFilter('trainer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === 'trainer'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            Trainers
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              roleFilter === 'admin'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            Admins
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone / Contact</th>
                  <th className="py-3 px-4">Assigned Personal Trainer</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : u.role === 'trainer'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {u.phone || 'Not provided'}
                    </td>
                    <td className="py-3 px-4">
                      {u.role === 'member' ? (
                        <select
                          value={u.assignedTrainer?._id || ''}
                          onChange={(e) => handleAssignTrainer(u._id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500 font-medium"
                        >
                          <option value="">-- No Trainer Assigned --</option>
                          {trainers.map((t) => (
                            <option key={t._id} value={t._id}>
                              Coach {t.name} ({t.specialization || 'Trainer'})
                            </option>
                          ))}
                        </select>
                      ) : u.role === 'trainer' ? (
                        <span className="text-cyan-400 font-medium">
                          {u.specialization || 'Fitness Coach'}
                        </span>
                      ) : (
                        <span className="text-slate-500">System Admin</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
