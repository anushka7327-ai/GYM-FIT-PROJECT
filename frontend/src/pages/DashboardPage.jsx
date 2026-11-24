import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Dumbbell,
  CreditCard,
  CalendarClock,
  DollarSign,
  TrendingUp,
  ActivitySquare,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { user, role, isAdmin, isTrainer, isMember } = useAuth();
  const [stats, setStats] = useState(null);
  const [expiringSubs, setExpiringSubs] = useState([]);
  const [memberProgress, setMemberProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [role]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getDashboardStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      if (isAdmin) {
        // Fetch memberships expiring in the next 7 days
        const expiringRes = await api.getExpiringSubscriptions(7, 'upcoming');
        if (expiringRes.success) {
          setExpiringSubs(expiringRes.data || []);
        }
      }

      if (isMember) {
        // Fetch member's own progress report summary
        const progressRes = await api.getMemberProgressReport();
        if (progressRes.success) {
          setMemberProgress(progressRes);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-slate-900 rounded-lg w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> GymFit Performance Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              {isAdmin && 'Gym administration portal: Monitor subscriptions, expiry timelines, and revenue aggregation in real-time.'}
              {isTrainer && 'Coach hub: Build tailored routines, track assigned members, and review workout performance.'}
              {isMember && 'Track your fitness journey: Log daily sessions, review body measurements, and stay on top of your plan.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isMember && (
              <>
                <Link
                  to="/workout-logs"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  <ActivitySquare className="w-4 h-4" /> Log Today's Workout
                </Link>
                <Link
                  to="/plans"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700"
                >
                  Browse Plans
                </Link>
              </>
            )}

            {isTrainer && (
              <Link
                to="/routines"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                <Dumbbell className="w-4 h-4" /> Assign Workout Routine
              </Link>
            )}

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  to="/subscriptions"
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <CalendarClock className="w-4 h-4" /> Expiring Memberships
                </Link>
                <Link
                  to="/revenue"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <DollarSign className="w-4 h-4" /> Revenue Report
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {isAdmin && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
              subtitle="All-time membership sales"
              icon={DollarSign}
              color="emerald"
            />
            <StatCard
              title="Active Subscriptions"
              value={stats?.activeSubscriptions || 0}
              subtitle="Current active gym members"
              icon={CheckCircle2}
              color="cyan"
            />
            <StatCard
              title="Expiring Soon (7d)"
              value={stats?.expiringSoonSubscriptions || 0}
              subtitle="Requires renewal follow-up"
              icon={AlertTriangle}
              color={stats?.expiringSoonSubscriptions > 0 ? 'amber' : 'emerald'}
              trend={stats?.expiringSoonSubscriptions > 0 ? 'Action Needed' : 'Good'}
            />
            <StatCard
              title="Total Members & Staff"
              value={`${stats?.totalMembers || 0} Members / ${stats?.totalTrainers || 0} Trainers`}
              subtitle="Registered user accounts"
              icon={Users}
              color="purple"
            />
          </div>

          {/* Expiring Memberships Date Query Preview Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-400" />
                  Expiring-Membership Alert List (Date Query)
                </h3>
                <p className="text-xs text-slate-400">
                  Showing active subscriptions expiring within the next 7 days
                </p>
              </div>
              <Link
                to="/subscriptions"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
              >
                View Complete Expiring Query Tool <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {expiringSubs.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                No memberships expiring in the next 7 days.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Plan Name</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4">Days Left</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {expiringSubs.map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          <div className="font-semibold">{sub.user?.name || 'Unknown'}</div>
                          <div className="text-[11px] text-slate-400">{sub.user?.email}</div>
                        </td>
                        <td className="py-3 px-4">{sub.plan?.name || 'Plan'}</td>
                        <td className="py-3 px-4 text-amber-300 font-medium">
                          {new Date(sub.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {sub.daysRemaining} {sub.daysRemaining === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/subscriptions`}
                            className="text-xs text-emerald-400 hover:underline font-medium"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRAINER DASHBOARD VIEW */}
      {isTrainer && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Assigned Members"
              value={stats?.assignedMembersCount || 0}
              subtitle="Athletes under your mentorship"
              icon={Users}
              color="cyan"
            />
            <StatCard
              title="Active Workout Routines"
              value={stats?.activeRoutinesCount || 0}
              subtitle="Currently assigned to members"
              icon={Dumbbell}
              color="emerald"
            />
            <StatCard
              title="Total Routines Created"
              value={stats?.routinesCount || 0}
              subtitle="Routine templates in your library"
              icon={ActivitySquare}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" /> Quick Routine Builder
              </h3>
              <p className="text-xs text-slate-400">
                Design custom day-by-day training splits with target muscle groups, sets, reps, and coach notes.
              </p>
              <Link
                to="/routines"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-all"
              >
                Create & Assign Routine <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Member Progress & Measurements
              </h3>
              <p className="text-xs text-slate-400">
                Inspect your assigned athletes' weight tracking, waist/chest measurements, and workout consistency over time.
              </p>
              <Link
                to="/progress"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all"
              >
                View Athlete Reports <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DASHBOARD VIEW */}
      {isMember && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Membership Status"
              value={stats?.hasActiveSubscription ? stats.activePlanName : 'Inactive'}
              subtitle={
                stats?.hasActiveSubscription
                  ? `${stats.daysLeft} days remaining (${new Date(stats.subscriptionEndDate).toLocaleDateString()})`
                  : 'Subscribe to access gym & coaching'
              }
              icon={Award}
              color={stats?.hasActiveSubscription ? 'emerald' : 'amber'}
            />
            <StatCard
              title="Workouts Logged"
              value={stats?.totalWorkoutsLogged || 0}
              subtitle="Daily workout records"
              icon={Flame}
              color="cyan"
            />
            <StatCard
              title="Assigned Routine"
              value={stats?.hasAssignedRoutine ? stats.routineTitle : 'Not Assigned'}
              subtitle="Personalized training schedule"
              icon={Dumbbell}
              color="purple"
            />
          </div>

          {/* Quick Log & Routine Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Routine Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-emerald-400" /> Your Current Routine
                </h3>
                <Link to="/routines" className="text-xs text-emerald-400 hover:underline">
                  Full Schedule &rarr;
                </Link>
              </div>

              {memberProgress?.activeRoutine ? (
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {memberProgress.activeRoutine.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                      {memberProgress.activeRoutine.goal || 'General Fitness'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Coach: <span className="text-white font-medium">{memberProgress.activeRoutine.trainer?.name}</span>
                  </p>
                  <div className="pt-2 flex gap-2">
                    <Link
                      to="/workout-logs"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Log Workout
                    </Link>
                    <Link
                      to="/routines"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      View Routine Days
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  No routine assigned yet. Your coach will assign one, or you can self-log any workout!
                </div>
              )}
            </div>

            {/* Measurements & Progress Snapshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" /> Body Metrics Snapshot
                </h3>
                <Link to="/progress" className="text-xs text-cyan-400 hover:underline">
                  View Full Report &rarr;
                </Link>
              </div>

              {memberProgress?.progressionSummary?.currentWeightKg ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Current Weight</div>
                    <div className="text-xl font-black text-white mt-1">
                      {memberProgress.progressionSummary.currentWeightKg} <span className="text-xs text-slate-400">kg</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                      {memberProgress.progressionSummary.weightChangeKg <= 0 ? '' : '+'}
                      {memberProgress.progressionSummary.weightChangeKg} kg
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Waist</div>
                    <div className="text-xl font-black text-white mt-1">
                      {memberProgress.measurementTimeline[memberProgress.measurementTimeline.length - 1]?.waistCm || '--'} <span className="text-xs text-slate-400">cm</span>
                    </div>
                    <div className="text-[10px] text-cyan-400 font-bold mt-0.5">
                      {memberProgress.progressionSummary.waistChangeCm ? `${memberProgress.progressionSummary.waistChangeCm} cm` : 'Tracking'}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Workouts</div>
                    <div className="text-xl font-black text-white mt-1">
                      {memberProgress.summary?.totalWorkouts || 0}
                    </div>
                    <div className="text-[10px] text-purple-400 font-bold mt-0.5">
                      {memberProgress.summary?.totalMinutes || 0} mins
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                  No body measurements logged yet. Head to "Log Workout & Body" to record your starting stats!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
