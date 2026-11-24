import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Flame,
  CheckCircle2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  ActivitySquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function RoutinesPage() {
  const { user, isAdmin, isTrainer, isMember } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Expandable days in view
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState(null);

  // Form State for routine assignment
  const [formData, setFormData] = useState({
    memberId: '',
    title: '',
    description: '',
    goal: 'Hypertrophy & Strength',
    difficulty: 'Intermediate',
    days: [
      {
        dayNumber: 1,
        dayName: 'Day 1: Upper Body Push',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', targetMuscle: 'Chest', restSeconds: 90, notes: '' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', targetMuscle: 'Upper Chest', restSeconds: 60, notes: '' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2: Upper Body Pull',
        exercises: [
          { name: 'Lat Pulldown', sets: 4, reps: '10-12', targetMuscle: 'Back', restSeconds: 75, notes: '' },
          { name: 'Dumbbell Bicep Curls', sets: 3, reps: '12', targetMuscle: 'Biceps', restSeconds: 45, notes: '' },
        ],
      },
    ],
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMember) {
        const res = await api.getMyRoutines();
        if (res.success) {
          setRoutines(res.data || []);
          if (res.data?.length > 0) {
            setExpandedRoutineId(res.data[0]._id);
          }
        }
      } else if (isTrainer) {
        const [routinesRes, membersRes] = await Promise.all([
          api.getTrainerRoutines(),
          api.getMembers(),
        ]);
        if (routinesRes.success) setRoutines(routinesRes.data || []);
        if (membersRes.success) setMembers(membersRes.data || []);
      } else if (isAdmin) {
        const [routinesRes, membersRes] = await Promise.all([
          api.getAllRoutines(),
          api.getMembers(),
        ]);
        if (routinesRes.success) setRoutines(routinesRes.data || []);
        if (membersRes.success) setMembers(membersRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load routines');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRoutineId(null);
    setFormData({
      memberId: members[0]?._id || '',
      title: '',
      description: '',
      goal: 'Hypertrophy & Strength',
      difficulty: 'Intermediate',
      days: [
        {
          dayNumber: 1,
          dayName: 'Day 1: Chest & Triceps',
          exercises: [
            { name: 'Barbell Bench Press', sets: 4, reps: '8-10', targetMuscle: 'Chest', restSeconds: 90, notes: '' },
            { name: 'Cable Tricep Pushdown', sets: 3, reps: '12', targetMuscle: 'Triceps', restSeconds: 60, notes: '' },
          ],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const addDay = () => {
    const nextDayNum = formData.days.length + 1;
    setFormData({
      ...formData,
      days: [
        ...formData.days,
        {
          dayNumber: nextDayNum,
          dayName: `Day ${nextDayNum}: Workout Session`,
          exercises: [
            { name: 'Exercise Name', sets: 3, reps: '10', targetMuscle: 'General', restSeconds: 60, notes: '' },
          ],
        },
      ],
    });
  };

  const removeDay = (dayIndex) => {
    const updated = formData.days.filter((_, idx) => idx !== dayIndex);
    setFormData({ ...formData, days: updated });
  };

  const addExercise = (dayIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].exercises.push({
      name: '',
      sets: 3,
      reps: '10-12',
      targetMuscle: '',
      restSeconds: 60,
      notes: '',
    });
    setFormData({ ...formData, days: updatedDays });
  };

  const removeExercise = (dayIndex, exIndex) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter((_, idx) => idx !== exIndex);
    setFormData({ ...formData, days: updatedDays });
  };

  const handleExerciseChange = (dayIndex, exIndex, field, value) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].exercises[exIndex][field] = value;
    setFormData({ ...formData, days: updatedDays });
  };

  const handleDayNameChange = (dayIndex, value) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].dayName = value;
    setFormData({ ...formData, days: updatedDays });
  };

  const handleSubmitRoutine = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.memberId) {
      setError('Please select an athlete member to assign the routine to');
      return;
    }

    try {
      if (editingRoutineId) {
        await api.updateRoutine(editingRoutineId, formData);
        setSuccessMsg('Routine updated successfully!');
      } else {
        await api.createRoutine(formData);
        setSuccessMsg('Workout routine created & assigned successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Error saving routine');
    }
  };

  const handleDeleteRoutine = async (id, title) => {
    if (!window.confirm(`Delete routine "${title}"?`)) return;
    try {
      await api.deleteRoutine(id);
      setSuccessMsg('Routine deleted.');
      loadData();
    } catch (err) {
      setError(err.message || 'Could not delete routine');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-1">
            <Dumbbell className="w-3.5 h-3.5" />
            {isMember ? 'Personalized Workout Plan' : 'Trainer Routine Builder & Assignment'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isMember ? 'My Workout Routines' : 'Assigned Workout Routines'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isMember
              ? 'View training schedules, exercise sets & reps curated by your personal trainer.'
              : 'Design customized day-by-day workout splits and assign directly to member accounts.'}
          </p>
        </div>

        {(isTrainer || isAdmin) && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Assign New Routine
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          {successMsg}
        </div>
      )}

      {/* Routine Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No workout routines found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {isTrainer
              ? 'Click "Assign New Routine" to create your first client training schedule.'
              : 'Your trainer has not assigned a custom routine yet. Ask your coach or self-log workouts!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {routines.map((routine) => {
            const isExpanded = expandedRoutineId === routine._id;

            return (
              <div
                key={routine._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all shadow-xl"
              >
                {/* Routine Card Header */}
                <div className="p-6 bg-slate-950/60 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {routine.goal}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {routine.difficulty}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {routine.days?.length || 0} Training Days
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white">{routine.title}</h2>
                    <p className="text-xs text-slate-400 max-w-2xl">{routine.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>
                        Trainer:{' '}
                        <strong className="text-white">
                          {routine.trainer?.name || 'Assigned Coach'}
                        </strong>
                      </span>
                      <span>
                        Athlete:{' '}
                        <strong className="text-emerald-400">
                          {routine.member?.name || 'Member'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    {isMember && (
                      <Link
                        to="/workout-logs"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <ActivitySquare className="w-4 h-4" /> Log This Workout
                      </Link>
                    )}

                    {(isTrainer || isAdmin) && (
                      <button
                        onClick={() => handleDeleteRoutine(routine._id, routine.title)}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                        title="Delete routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedRoutineId(isExpanded ? null : routine._id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                    >
                      {isExpanded ? (
                        <>
                          Hide Days <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          View Exercises <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Routine Days Accordion Content */}
                {isExpanded && (
                  <div className="p-6 space-y-6 bg-slate-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {routine.days?.map((day, dIdx) => (
                        <div
                          key={dIdx}
                          className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              {day.dayName}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {day.exercises?.length || 0} exercises
                            </span>
                          </div>

                          <div className="space-y-2">
                            {day.exercises?.map((ex, eIdx) => (
                              <div
                                key={eIdx}
                                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{ex.name}</span>
                                    {ex.targetMuscle && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-medium">
                                        {ex.targetMuscle}
                                      </span>
                                    )}
                                  </div>
                                  {ex.notes && (
                                    <div className="text-[11px] text-slate-400 italic">
                                      Tip: {ex.notes}
                                    </div>
                                  )}
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="font-black text-cyan-400">
                                    {ex.sets} sets &times; {ex.reps}
                                  </div>
                                  {ex.restSeconds && (
                                    <div className="text-[10px] text-slate-500">
                                      Rest: {ex.restSeconds}s
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ROUTINE MODAL (TRAINER / ADMIN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-cyan-400" />
              Build & Assign Workout Routine
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an athlete and build a targeted weekly workout routine.
            </p>

            <form onSubmit={handleSubmitRoutine} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Assign To Member *
                  </label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Routine Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4-Day Strength & Hypertrophy Split"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="Hypertrophy & Strength">Hypertrophy & Strength</option>
                    <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                    <option value="Endurance & Stamina">Endurance & Stamina</option>
                    <option value="Functional Mobility">Functional Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Coach Routine Description & Advice
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes on progressive overload, tempo, and recovery"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              {/* Routine Days Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white uppercase tracking-wider text-xs">
                    Training Days & Exercise Breakdown ({formData.days.length})
                  </div>
                  <button
                    type="button"
                    onClick={addDay}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Day
                  </button>
                </div>

                {formData.days.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={day.dayName}
                        onChange={(e) => handleDayNameChange(dIdx, e.target.value)}
                        placeholder={`Day ${dIdx + 1} Name (e.g. Chest & Triceps)`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold text-xs flex-1 outline-none focus:border-cyan-500"
                      />
                      {formData.days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(dIdx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                          title="Remove Day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Exercises in day */}
                    <div className="space-y-2">
                      {day.exercises.map((ex, eIdx) => (
                        <div
                          key={eIdx}
                          className="grid grid-cols-12 gap-2 items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 text-[11px]"
                        >
                          <div className="col-span-4">
                            <input
                              type="text"
                              required
                              placeholder="Exercise Name"
                              value={ex.name}
                              onChange={(e) => handleExerciseChange(dIdx, eIdx, 'name', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Sets"
                              value={ex.sets}
                              onChange={(e) => handleExerciseChange(dIdx, eIdx, 'sets', Number(e.target.value))}
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Reps (e.g. 10-12)"
                              value={ex.reps}
                              onChange={(e) => handleExerciseChange(dIdx, eIdx, 'reps', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white outline-none"
                            />
                          </div>

                          <div className="col-span-3">
                            <input
                              type="text"
                              placeholder="Target Muscle"
                              value={ex.targetMuscle}
                              onChange={(e) => handleExerciseChange(dIdx, eIdx, 'targetMuscle', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white outline-none"
                            />
                          </div>

                          <div className="col-span-1 text-right">
                            {day.exercises.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExercise(dIdx, eIdx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addExercise(dIdx)}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold pt-1"
                      >
                        + Add Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save & Assign Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
