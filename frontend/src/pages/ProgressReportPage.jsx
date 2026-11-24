import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  Scale,
  Activity,
  Flame,
  Award,
  Calendar,
  Dumbbell,
  Clock,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProgressReportPage() {
  const { user, isAdmin, isTrainer, isMember } = useAuth();
  const [report, setReport] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin || isTrainer) {
      loadMembersAndFirstReport();
    } else {
      fetchProgressReport();
    }
  }, [user]);

  const loadMembersAndFirstReport = async () => {
    setLoading(true);
    try {
      const res = await api.getMembers();
      if (res.success && res.data?.length > 0) {
        setMembers(res.data);
        const firstId = res.data[0]._id;
        setSelectedMemberId(firstId);
        await fetchProgressReport(firstId);
      } else {
        setLoading(false);
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const fetchProgressReport = async (memberId = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMemberProgressReport(memberId);
      if (res.success) {
        setReport(res);
      }
    } catch (err) {
      setError(err.message || 'Error fetching progress report');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (mId) => {
    setSelectedMemberId(mId);
    fetchProgressReport(mId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-1">
            <LineChartIcon className="w-3.5 h-3.5" />
            MongoDB Aggregated Progress Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Member Progress Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comprehensive body composition tracking, workout adherence, and personal best metrics.
          </p>
        </div>

        {/* Athlete Switcher for Trainers and Admins */}
        {(isTrainer || isAdmin) && members.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <User className="w-4 h-4 text-slate-400 ml-1" />
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-900 rounded-3xl animate-pulse" />
        </div>
      ) : !report ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No progress report available</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Athlete Profile Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl">
                {report.member?.name?.charAt(0) || 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{report.member?.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Active Athlete
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{report.member?.email}</p>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Current Plan: <strong className="text-white">{report.activeSubscription?.plan?.name || 'No active plan'}</strong></span>
                  <span>&bull;</span>
                  <span>Active Routine: <strong className="text-cyan-400">{report.activeRoutine?.title || 'None'}</strong></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Workouts</div>
                <div className="text-xl font-black text-white mt-0.5">{report.summary?.totalWorkouts || 0}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Minutes</div>
                <div className="text-xl font-black text-white mt-0.5">{report.summary?.totalMinutes || 0}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Calories Burned</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{report.summary?.totalCalories || 0}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Avg Rating</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">
                  {report.summary?.avgMoodRating ? report.summary.avgMoodRating.toFixed(1) : '--'}/5
                </div>
              </div>
            </div>
          </div>

          {/* Physical Body Measurements Transformation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  Body Composition & Measurement Progression
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregated initial baseline vs latest recorded measurements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Weight Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Body Weight</span>
                  <Scale className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-white">
                      {report.progressionSummary?.currentWeightKg || '--'}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">kg</span>
                  </div>
                  {report.progressionSummary?.weightChangeKg !== undefined && (
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        report.progressionSummary.weightChangeKg <= 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {report.progressionSummary.weightChangeKg <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {report.progressionSummary.weightChangeKg > 0 ? '+' : ''}
                      {report.progressionSummary.weightChangeKg} kg
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                  <span>Baseline: {report.progressionSummary?.startingWeightKg || '--'} kg</span>
                  <span>Target: Tone & Lean Mass</span>
                </div>
              </div>

              {/* Waist Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Waist Circumference</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-white">
                      {report.measurementTimeline?.slice(-1)[0]?.waistCm || '--'}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">cm</span>
                  </div>
                  {report.progressionSummary?.waistChangeCm !== undefined && (
                    <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 flex items-center gap-1">
                      {report.progressionSummary.waistChangeCm <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {report.progressionSummary.waistChangeCm > 0 ? '+' : ''}
                      {report.progressionSummary.waistChangeCm} cm
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                  <span>Initial: {report.measurementTimeline[0]?.waistCm || '--'} cm</span>
                  <span>Visceral Reduction</span>
                </div>
              </div>

              {/* Body Fat Card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">Body Fat Percentage</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-white">
                      {report.measurementTimeline?.slice(-1)[0]?.bodyFatPercentage || '--'}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">%</span>
                  </div>
                  {report.progressionSummary?.bodyFatChange !== undefined && (
                    <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 flex items-center gap-1">
                      {report.progressionSummary.bodyFatChange <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      {report.progressionSummary.bodyFatChange > 0 ? '+' : ''}
                      {report.progressionSummary.bodyFatChange}%
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                  <span>Initial: {report.measurementTimeline[0]?.bodyFatPercentage || '--'}%</span>
                  <span>Athletic Standard</span>
                </div>
              </div>
            </div>

            {/* Measurement Progression History Table */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Measurement Timeline Logs (Historical Aggregation)
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Recorded Date</th>
                      <th className="py-3 px-4">Session Title</th>
                      <th className="py-3 px-4">Weight (kg)</th>
                      <th className="py-3 px-4">Waist (cm)</th>
                      <th className="py-3 px-4">Chest (cm)</th>
                      <th className="py-3 px-4">Arms (cm)</th>
                      <th className="py-3 px-4">Body Fat %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-300">
                    {report.measurementTimeline?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-semibold text-white">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{item.workoutTitle}</td>
                        <td className="py-2.5 px-4 font-bold text-cyan-300">
                          {item.weightKg ? `${item.weightKg} kg` : '--'}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-purple-300">
                          {item.waistCm ? `${item.waistCm} cm` : '--'}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-emerald-300">
                          {item.chestCm ? `${item.chestCm} cm` : '--'}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-300">
                          {item.armsCm ? `${item.armsCm} cm` : '--'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-amber-300">
                          {item.bodyFatPercentage ? `${item.bodyFatPercentage}%` : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Exercise Volume & Personal Bests Aggregation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              Exercise Volume & Frequency Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated across all logged workouts to show movement mastery and peak loads
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {report.exerciseFrequency?.map((ex, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="font-bold text-white text-xs truncate" title={ex._id}>
                    {ex._id}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Performed:</span>
                    <span className="font-bold text-cyan-400">{ex.timesPerformed} sessions</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Sets:</span>
                    <span className="font-bold text-white">{ex.totalSets} sets</span>
                  </div>
                  {ex.maxWeight > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                      <span className="text-slate-400 font-semibold">Peak Load:</span>
                      <span className="font-black text-emerald-400">{ex.maxWeight} kg</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
