import React, { useState, useEffect } from 'react';
import {
  ActivitySquare,
  Plus,
  Scale,
  Calendar,
  Flame,
  Clock,
  Star,
  Trash2,
  Check,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Dumbbell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function WorkoutLogsPage() {
  const { user, isAdmin, isTrainer, isMember } = useAuth();
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Expand card
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workoutTitle: 'Daily Strength & Hypertrophy',
    date: new Date().toISOString().split('T')[0],
    durationMinutes: 50,
    caloriesBurned: 420,
    moodRating: 5,
    notes: '',
    measurements: {
      weightKg: '',
      bodyFatPercentage: '',
      waistCm: '',
      chestCm: '',
      armsCm: '',
      hipsCm: '',
    },
    exercisesCompleted: [
      { exerciseName: 'Barbell Flat Bench Press', setsCompleted: 4, repsCompleted: '10', weightKg: 70, notes: '' },
      { exerciseName: 'Incline Dumbbell Press', setsCompleted: 3, repsCompleted: '12', weightKg: 26, notes: '' },
    ],
  });

  useEffect(() => {
    if (isAdmin || isTrainer) {
      loadMembers();
    } else {
      fetchMyLogs();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      const res = await api.getMembers();
      if (res.success && res.data?.length > 0) {
        setMembers(res.data);
        setSelectedMemberId(res.data[0]._id);
        fetchMemberLogs(res.data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const fetchMyLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getMyWorkoutLogs();
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberLogs = async (memberId) => {
    setLoading(true);
    try {
      const res = await api.getMemberWorkoutLogs(memberId);
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Error fetching member logs');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (mId) => {
    setSelectedMemberId(mId);
    fetchMemberLogs(mId);
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercisesCompleted: [
        ...formData.exercisesCompleted,
        { exerciseName: '', setsCompleted: 3, repsCompleted: '10', weightKg: 0, notes: '' },
      ],
    });
  };

  const removeExercise = (index) => {
    setFormData({
      ...formData,
      exercisesCompleted: formData.exercisesCompleted.filter((_, idx) => idx !== index),
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const list = [...formData.exercisesCompleted];
    list[index][field] = value;
    setFormData({ ...formData, exercisesCompleted: list });
  };

  const handleMeasurementChange = (field, value) => {
    setFormData({
      ...formData,
      measurements: {
        ...formData.measurements,
        [field]: value === '' ? '' : Number(value),
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Sanitize measurements
    const cleanMeasurements = {};
    Object.keys(formData.measurements).forEach((key) => {
      if (formData.measurements[key] !== '' && formData.measurements[key] !== null) {
        cleanMeasurements[key] = Number(formData.measurements[key]);
      }
    });

    try {
      await api.createWorkoutLog({
        ...formData,
        measurements: cleanMeasurements,
      });

      setSuccessMsg('Workout session and body measurements saved successfully!');
      setIsModalOpen(false);
      fetchMyLogs();
    } catch (err) {
      setError(err.message || 'Failed to save workout log');
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Delete this workout log?')) return;
    try {
      await api.deleteWorkoutLog(id);
      setSuccessMsg('Workout log removed.');
      if (isMember) fetchMyLogs();
      else fetchMemberLogs(selectedMemberId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-1">
            <ActivitySquare className="w-3.5 h-3.5" />
            Daily Training & Body Measurement Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Workout & Measurement Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMember
              ? 'Log completed exercises, weights lifted, and track body composition progress.'
              : 'Review athlete workout sessions, body metric changes, and training adherence.'}
          </p>
        </div>

        {isMember && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Log Daily Workout & Stats
          </button>
        )}
      </div>

      {/* Trainer/Admin Athlete Filter Selector */}
      {(isTrainer || isAdmin) && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Viewing Athlete:
          </span>
          <select
            value={selectedMemberId}
            onChange={(e) => handleMemberSelect(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold outline-none focus:border-cyan-500"
          >
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>
      )}

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

      {/* Logs List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No workout logs recorded yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            {isMember ? 'Click "Log Daily Workout & Stats" above to start logging!' : 'This athlete has not logged any workouts yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log._id;

            return (
              <div
                key={log._id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {log.durationMinutes} mins
                      </span>
                      {log.caloriesBurned > 0 && (
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> {log.caloriesBurned} kcal
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">{log.workoutTitle}</h3>

                    {/* Quick Measurements badge preview */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      {log.measurements?.weightKg && (
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-cyan-300 font-bold">
                          Weight: {log.measurements.weightKg} kg
                        </span>
                      )}
                      {log.measurements?.waistCm && (
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-purple-300 font-bold">
                          Waist: {log.measurements.waistCm} cm
                        </span>
                      )}
                      {log.measurements?.chestCm && (
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-300 font-bold">
                          Chest: {log.measurements.chestCm} cm
                        </span>
                      )}
                      {log.measurements?.bodyFatPercentage && (
                        <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300 font-bold">
                          Body Fat: {log.measurements.bodyFatPercentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {(isMember || isAdmin) && (
                      <button
                        onClick={() => handleDeleteLog(log._id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          View Exercises ({log.exercisesCompleted?.length || 0}){' '}
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 bg-slate-950/70 border-t border-slate-800 space-y-4">
                    {/* Notes */}
                    {log.notes && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                          Workout Notes:
                        </span>
                        {log.notes}
                      </div>
                    )}

                    {/* Exercises Table */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                        Exercises Performed:
                      </div>
                      <div className="space-y-1.5">
                        {log.exercisesCompleted?.map((ex, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                          >
                            <span className="font-bold text-white">{ex.exerciseName}</span>
                            <div className="flex items-center gap-4 text-slate-300">
                              <span>
                                {ex.setsCompleted} sets &times; {ex.repsCompleted} reps
                              </span>
                              {ex.weightKg > 0 && (
                                <span className="text-emerald-400 font-bold">{ex.weightKg} kg</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LOG WORKOUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ActivitySquare className="w-5 h-5 text-emerald-400" />
              Log Daily Workout & Body Measurements
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Keep your coach and records updated with your training volume and physical measurements.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Workout Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.workoutTitle}
                    onChange={(e) => setFormData({ ...formData, workoutTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Body Measurements Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Body Measurements Tracker (Optional)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 78.5"
                      value={formData.measurements.weightKg}
                      onChange={(e) => handleMeasurementChange('weightKg', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Waist (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 82"
                      value={formData.measurements.waistCm}
                      onChange={(e) => handleMeasurementChange('waistCm', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Chest (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 104"
                      value={formData.measurements.chestCm}
                      onChange={(e) => handleMeasurementChange('chestCm', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Arms (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 38"
                      value={formData.measurements.armsCm}
                      onChange={(e) => handleMeasurementChange('armsCm', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 17.5"
                      value={formData.measurements.bodyFatPercentage}
                      onChange={(e) => handleMeasurementChange('bodyFatPercentage', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Est. Calories Burned</label>
                    <input
                      type="number"
                      placeholder="e.g. 450"
                      value={formData.caloriesBurned}
                      onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Exercises Completed Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white uppercase tracking-wider">
                    Exercises Completed ({formData.exercisesCompleted.length})
                  </div>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    + Add Exercise
                  </button>
                </div>

                {formData.exercisesCompleted.map((ex, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 items-center"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        required
                        placeholder="Exercise name"
                        value={ex.exerciseName}
                        onChange={(e) => handleExerciseChange(idx, 'exerciseName', e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Sets"
                        value={ex.setsCompleted}
                        onChange={(e) => handleExerciseChange(idx, 'setsCompleted', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Reps"
                        value={ex.repsCompleted}
                        onChange={(e) => handleExerciseChange(idx, 'repsCompleted', e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Kg"
                        value={ex.weightKg}
                        onChange={(e) => handleExerciseChange(idx, 'weightKg', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {formData.exercisesCompleted.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(idx)}
                          className="text-red-400 hover:text-red-300"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Session Notes & Energy
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How did the session feel? Heavy PRs, energy levels, recovery status..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Workout & Measurements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
