import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  CalendarClock,
  Dumbbell,
  ActivitySquare,
  LineChart,
  BarChart3,
  Users,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, role } = useAuth();

  if (!user) return null;

  const getNavLinks = () => {
    const common = [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
    ];

    if (role === 'admin') {
      return [
        ...common,
        {
          to: '/plans',
          label: 'Plan Management (CRUD)',
          icon: CreditCard,
        },
        {
          to: '/subscriptions',
          label: 'Expiring & Subscriptions',
          icon: CalendarClock,
          highlight: true,
        },
        {
          to: '/revenue',
          label: 'Revenue Analytics (Agg.)',
          icon: BarChart3,
          badge: 'Aggregation',
        },
        {
          to: '/routines',
          label: 'Workout Routines',
          icon: Dumbbell,
        },
        {
          to: '/progress',
          label: 'Member Progress Reports',
          icon: LineChart,
        },
        {
          to: '/users',
          label: 'User & Role Directory',
          icon: Users,
        },
      ];
    }

    if (role === 'trainer') {
      return [
        ...common,
        {
          to: '/routines',
          label: 'Assign Routines',
          icon: Dumbbell,
          badge: 'Trainer',
        },
        {
          to: '/workout-logs',
          label: 'Member Logs & History',
          icon: ActivitySquare,
        },
        {
          to: '/progress',
          label: 'Member Progress Report',
          icon: LineChart,
        },
        {
          to: '/plans',
          label: 'Gym Plans',
          icon: CreditCard,
        },
      ];
    }

    // Member
    return [
      ...common,
      {
        to: '/plans',
        label: 'Gym Membership Plans',
        icon: CreditCard,
      },
      {
        to: '/subscriptions',
        label: 'My Subscription',
        icon: CalendarClock,
      },
      {
        to: '/routines',
        label: 'My Assigned Routine',
        icon: Dumbbell,
      },
      {
        to: '/workout-logs',
        label: 'Log Workout & Body',
        icon: ActivitySquare,
        badge: 'Daily',
      },
      {
        to: '/progress',
        label: 'My Progress Report',
        icon: LineChart,
      },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Pill Header */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 capitalize tracking-wide">
              Role: <span className="text-emerald-400 font-semibold">{user.role}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation Menu
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 text-[11px] text-slate-400 text-center">
        <span>GymFit Pro v1.0.0</span>
        <div className="text-[10px] text-emerald-400/80 mt-0.5">MongoDB Aggregation Engine</div>
      </div>
    </aside>
  );
}
