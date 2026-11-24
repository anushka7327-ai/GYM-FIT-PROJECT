const mongoose = require('mongoose');

const completedExerciseSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
  },
  setsCompleted: {
    type: Number,
    default: 3,
  },
  repsCompleted: {
    type: String,
    default: '10',
  },
  weightKg: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
});

const measurementsSchema = new mongoose.Schema({
  weightKg: { type: Number, default: null },
  bodyFatPercentage: { type: Number, default: null },
  chestCm: { type: Number, default: null },
  waistCm: { type: Number, default: null },
  hipsCm: { type: Number, default: null },
  armsCm: { type: Number, default: null },
  thighsCm: { type: Number, default: null },
});

const workoutLogSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    workoutTitle: {
      type: String,
      default: 'Daily Workout',
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    exercisesCompleted: [completedExerciseSchema],
    measurements: {
      type: measurementsSchema,
      default: () => ({}),
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    moodRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
