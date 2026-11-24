import React from 'react';
import { ShieldCheck, Dumbbell, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function QuickLoginBadges({ onSelect }) {
  const { login } = useAuth();

  const handleQuickLogin = async (email, password) => {
    if (onSelect) onSelect();
    await login(email, password);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 my-4">
      <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3 text-center">
        ⚡ Demo 1-Click Fast Login
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => handleQuickLogin('admin@gymfit.com', 'password123')}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all group"
        >
          <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="font-bold text-white">Admin Demo</div>
            <div className="text-[10px] text-purple-300/70">Full System Control</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin('trainer@gymfit.com', 'password123')}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all group"
        >
          <Dumbbell className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="font-bold text-white">Trainer Demo</div>
            <div className="text-[10px] text-cyan-300/70">Assign Routines</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin('member@gymfit.com', 'password123')}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all group"
        >
          <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="font-bold text-white">Member Demo</div>
            <div className="text-[10px] text-emerald-300/70">Track Workouts</div>
          </div>
        </button>
      </div>
    </div>
  );
}
