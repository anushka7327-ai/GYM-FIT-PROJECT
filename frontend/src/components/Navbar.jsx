import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, LogOut, User as UserIcon, ShieldCheck, Award, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin
        </span>
      );
    }
    if (role === 'trainer') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Dumbbell className="w-3.5 h-3.5" /> Trainer
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <Award className="w-3.5 h-3.5" /> Member
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5 font-black text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Gym<span className="text-emerald-400">Fit</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-l border-slate-700 pl-2">
              Tracker & Club
            </span>
          </div>
        </Link>

        {/* User Status & Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-slate-800">
              <div className="text-right">
                <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-xs text-slate-400 leading-tight">{user.email}</div>
              </div>
              {getRoleBadge()}
            </div>

            <Link
              to="/profile"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="My Profile"
            >
              <UserIcon className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-semibold transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
            >
              Join GymFit
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
