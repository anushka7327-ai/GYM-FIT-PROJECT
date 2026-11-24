const mongoose = require('mongoose');

const exerciseItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    default: 3,
  },
  reps: {
    type: String,
    required: true,
    default: '10-12',
  },
  targetMuscle: {
    type: String,
    default: 'General',
  },
  restSeconds: {
    type: Number,
    default: 60,
  },
  notes: {
    type: String,
    default: '',
  },
});

const routineDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  dayName: {
    type: String,
    required: true, // e.g. "Monday - Chest & Triceps"
  },
  exercises: [exerciseItemSchema],
});

const routineSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    goal: {
      type: String,
      default: 'General Fitness', // 'Weight Loss', 'Hypertrophy', 'Strength', 'Endurance'
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    days: [routineDaySchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Routine', routineSchema);
