import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg hover:shadow-slate-900/50">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border`}>
            <Icon className={`w-5 h-5 ${scheme.text}`} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className={`px-2 py-0.5 rounded-full font-medium ${scheme.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
