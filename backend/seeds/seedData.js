const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Routine = require('../models/Routine');
const WorkoutLog = require('../models/WorkoutLog');
const connectDB = require('../config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to database for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Plan.deleteMany(),
      Subscription.deleteMany(),
      Routine.deleteMany(),
      WorkoutLog.deleteMany(),
    ]);
    console.log('Cleared existing collections.');

    // 1. Create Users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'Arthur Pendelton (Admin)',
      email: 'admin@gymfit.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace, Springfield',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const trainer1 = await User.create({
      name: 'Marcus Vance',
      email: 'trainer@gymfit.com',
      password: 'password123',
      role: 'trainer',
      phone: '+1 (555) 432-8871',
      specialization: 'Strength & Hypertrophy Specialist',
      address: '104 Muscle Beach Way, Venice, CA',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
    });

    const trainer2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@gymfit.com',
      password: 'password123',
      role: 'trainer',
      phone: '+1 (555) 678-9922',
      specialization: 'Functional HIIT & Athletic Conditioning',
      address: '320 Olympic Blvd, Los Angeles, CA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    });

    const member1 = await User.create({
      name: 'Alex Rivera',
      email: 'member@gymfit.com',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 912-3344',
      address: '12 Harbor Point, San Diego, CA',
      assignedTrainer: trainer1._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const member2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@gymfit.com',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 345-6677',
      address: '88 Skyline Blvd, Oakland, CA',
      assignedTrainer: trainer2._id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const member3 = await User.create({
      name: 'Jordan Blake',
      email: 'jordan@gymfit.com',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 778-1122',
      address: '405 Pine Street, Seattle, WA',
      assignedTrainer: trainer1._id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const member4 = await User.create({
      name: 'David Kim',
      email: 'david@gymfit.com',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 223-9988',
      address: '900 Broadway, New York, NY',
      assignedTrainer: null,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    });

    console.log('Users created successfully.');

    // 2. Create Plans
    console.log('Creating membership plans...');
    const planMonthly = await Plan.create({
      name: 'Starter Monthly',
      description: 'Ideal for beginners seeking flexible access with no long-term commitment.',
      durationMonths: 1,
      price: 39.99,
      tag: 'Flexible',
      features: [
        'Full gym floor & cardio zone access',
        'Locker room & shower amenities',
        'GymFit mobile & web progress tracking',
        '1 complimentary fitness assessment',
      ],
      active: true,
    });

    const planQuarterly = await Plan.create({
      name: 'Quarterly Pro Split',
      description: 'Our most balanced package for individuals committed to noticeable body transformation.',
      durationMonths: 3,
      price: 99.99,
      tag: 'Most Popular',
      features: [
        'Everything in Starter Monthly',
        'Assigned personal trainer routine builder',
        'Free sauna & steam room access',
        '10% discount on gym nutrition shop',
        'Bi-weekly body measurement check-ins',
      ],
      active: true,
    });

    const planBiAnnual = await Plan.create({
      name: 'Semi-Annual Elite',
      description: 'Designed for dedicated athletes and lifters focused on continuous strength progression.',
      durationMonths: 6,
      price: 189.99,
      tag: 'Best Value',
      features: [
        'Everything in Quarterly Pro',
        'Direct 1-on-1 routine assignment & updates',
        'Unlimited guest passes (2 per month)',
        'Free recovery shaker bottle & starter kit',
        'Priority equipment reservations',
      ],
      active: true,
    });

    const planAnnual = await Plan.create({
      name: 'Annual VIP All-Access',
      description: 'The ultimate fitness journey package with complete gym privileges all year long.',
      durationMonths: 12,
      price: 349.99,
      tag: 'VIP All-Inclusive',
      features: [
        'Unlimited 24/7 access to all GymFit locations',
        'Dedicated trainer consultation every month',
        'Complete monthly body composition scans',
        'Full locker concierge service',
        'Free smoothie once a week at GymFit Bar',
      ],
      active: true,
    });

    console.log('Plans created successfully.');

    // 3. Create Subscriptions
    console.log('Creating subscriptions with diverse expiration dates...');
    const now = new Date();

    // Alex Rivera: Active 3-Month Plan (starts 30 days ago, expires in 60 days)
    const alexStart = new Date(now);
    alexStart.setDate(alexStart.getDate() - 30);
    const alexEnd = new Date(alexStart);
    alexEnd.setMonth(alexEnd.getMonth() + 3);

    await Subscription.create({
      user: member1._id,
      plan: planQuarterly._id,
      startDate: alexStart,
      endDate: alexEnd,
      amountPaid: 99.99,
      status: 'active',
      paymentMethod: 'Credit Card',
      paymentStatus: 'completed',
      createdAt: alexStart,
    });

    // Sarah Jenkins: Active 6-Month Elite (starts 60 days ago, expires in 120 days)
    const sarahStart = new Date(now);
    sarahStart.setDate(sarahStart.getDate() - 60);
    const sarahEnd = new Date(sarahStart);
    sarahEnd.setMonth(sarahEnd.getMonth() + 6);

    await Subscription.create({
      user: member2._id,
      plan: planBiAnnual._id,
      startDate: sarahStart,
      endDate: sarahEnd,
      amountPaid: 189.99,
      status: 'active',
      paymentMethod: 'Credit Card',
      paymentStatus: 'completed',
      createdAt: sarahStart,
    });

    // Jordan Blake: Expiring soon (expires in exactly 4 days!)
    const jordanStart = new Date(now);
    jordanStart.setDate(jordanStart.getDate() - 26);
    const jordanEnd = new Date(now);
    jordanEnd.setDate(jordanEnd.getDate() + 4); // Expiring in 4 days!

    await Subscription.create({
      user: member3._id,
      plan: planMonthly._id,
      startDate: jordanStart,
      endDate: jordanEnd,
      amountPaid: 39.99,
      status: 'active',
      paymentMethod: 'UPI / Debit',
      paymentStatus: 'completed',
      createdAt: jordanStart,
    });

    // David Kim: Already Expired (expired 5 days ago)
    const davidStart = new Date(now);
    davidStart.setDate(davidStart.getDate() - 35);
    const davidEnd = new Date(now);
    davidEnd.setDate(davidEnd.getDate() - 5); // Expired 5 days ago

    await Subscription.create({
      user: member4._id,
      plan: planMonthly._id,
      startDate: davidStart,
      endDate: davidEnd,
      amountPaid: 39.99,
      status: 'expired',
      paymentMethod: 'Cash',
      paymentStatus: 'completed',
      createdAt: davidStart,
    });

    // Additional historical subscriptions for revenue aggregation depth
    const histDate1 = new Date(now);
    histDate1.setMonth(histDate1.getMonth() - 2);
    const histDate2 = new Date(now);
    histDate2.setMonth(histDate2.getMonth() - 1);

    await Subscription.create({
      user: member4._id,
      plan: planAnnual._id,
      startDate: histDate1,
      endDate: new Date(new Date(histDate1).setFullYear(histDate1.getFullYear() + 1)),
      amountPaid: 349.99,
      status: 'active',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'completed',
      createdAt: histDate1,
    });

    await Subscription.create({
      user: member2._id,
      plan: planQuarterly._id,
      startDate: histDate2,
      endDate: new Date(new Date(histDate2).setMonth(histDate2.getMonth() + 3)),
      amountPaid: 99.99,
      status: 'active',
      paymentMethod: 'Credit Card',
      paymentStatus: 'completed',
      createdAt: histDate2,
    });

    console.log('Subscriptions created successfully.');

    // 4. Create Routines
    console.log('Creating workout routines assigned by trainers...');
    const alexRoutine = await Routine.create({
      trainer: trainer1._id,
      member: member1._id,
      title: 'Marcus’s 4-Day Hypertrophy & Power Split',
      description: 'Focuses on progressive overload across primary compound movements followed by isolated hypertrophy accessories.',
      goal: 'Hypertrophy & Strength',
      difficulty: 'Intermediate',
      status: 'active',
      days: [
        {
          dayNumber: 1,
          dayName: 'Day 1: Chest & Triceps Power',
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', targetMuscle: 'Chest', restSeconds: 90, notes: 'Maintain tight arch and control the eccentric' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', targetMuscle: 'Upper Chest', restSeconds: 60, notes: 'Set bench to 30 degrees angle' },
            { name: 'Cable Chest Flyes', sets: 3, reps: '12-15', targetMuscle: 'Chest', restSeconds: 45, notes: 'Squeeze at the center for 1 second' },
            { name: 'Overhead Tricep Rope Extension', sets: 3, reps: '12-15', targetMuscle: 'Triceps', restSeconds: 45, notes: 'Flare rope outward at full extension' },
          ],
        },
        {
          dayNumber: 2,
          dayName: 'Day 2: Back & Biceps Pull',
          exercises: [
            { name: 'Wide-Grip Lat Pulldown', sets: 4, reps: '10-12', targetMuscle: 'Lats', restSeconds: 75, notes: 'Pull elbow to hip pocket' },
            { name: 'Bent-Over Barbell Row', sets: 4, reps: '8-10', targetMuscle: 'Mid-Back', restSeconds: 90, notes: 'Keep spine neutral, hinge at hips' },
            { name: 'Seated Cable Row', sets: 3, reps: '12', targetMuscle: 'Upper Back', restSeconds: 60, notes: 'Pause and retract shoulder blades' },
            { name: 'Incline Dumbbell Bicep Curl', sets: 3, reps: '10-12', targetMuscle: 'Biceps', restSeconds: 45, notes: 'Strict form, no swinging' },
          ],
        },
        {
          dayNumber: 3,
          dayName: 'Day 3: Quad & Hamstring Dominance',
          exercises: [
            { name: 'Barbell Back Squat', sets: 4, reps: '6-8', targetMuscle: 'Quads & Glutes', restSeconds: 120, notes: 'Hit parallel or deeper' },
            { name: 'Romanian Deadlift (RDL)', sets: 3, reps: '8-10', targetMuscle: 'Hamstrings', restSeconds: 90, notes: 'Push hips backward until stretch is felt' },
            { name: 'Leg Press', sets: 3, reps: '12-15', targetMuscle: 'Quads', restSeconds: 60, notes: 'Controlled tempo' },
            { name: 'Standing Calf Raises', sets: 4, reps: '15-20', targetMuscle: 'Calves', restSeconds: 45, notes: 'Deep stretch at bottom' },
          ],
        },
        {
          dayNumber: 4,
          dayName: 'Day 4: Shoulders & Core Sculpt',
          exercises: [
            { name: 'Dumbbell Seated Shoulder Press', sets: 4, reps: '8-10', targetMuscle: 'Shoulders', restSeconds: 75, notes: 'Do not lock out elbows aggressively' },
            { name: 'Dumbbell Lateral Raises', sets: 4, reps: '15', targetMuscle: 'Side Delts', restSeconds: 45, notes: 'Lead with elbows' },
            { name: 'Face Pulls', sets: 3, reps: '15-20', targetMuscle: 'Rear Delts', restSeconds: 45, notes: 'External rotation focus' },
            { name: 'Hanging Leg Raises', sets: 3, reps: '12-15', targetMuscle: 'Abs', restSeconds: 60, notes: 'Avoid momentum swing' },
          ],
        },
      ],
    });

    const sarahRoutine = await Routine.create({
      trainer: trainer2._id,
      member: member2._id,
      title: 'Elena’s Functional HIIT & Core Conditioning',
      description: 'High energy metabolic conditioning combined with targeted core stability and muscle tone.',
      goal: 'Weight Loss & Tone',
      difficulty: 'Beginner',
      status: 'active',
      days: [
        {
          dayNumber: 1,
          dayName: 'Day 1: Full Body Circuit',
          exercises: [
            { name: 'Kettlebell Goblet Squats', sets: 3, reps: '15', targetMuscle: 'Quads/Core', restSeconds: 45, notes: 'Keep kettlebell tight to chest' },
            { name: 'Dumbbell Renegade Rows', sets: 3, reps: '12', targetMuscle: 'Back/Core', restSeconds: 45, notes: 'Stabilize hips' },
            { name: 'Box Step-Ups', sets: 3, reps: '15 each', targetMuscle: 'Glutes', restSeconds: 45, notes: 'Drive through heels' },
          ],
        },
      ],
    });

    console.log('Routines created successfully.');

    // 5. Create Workout Logs with body measurements progress
    console.log('Creating workout logs with historical body measurement progression...');

    const logDates = [24, 18, 12, 6, 1]; // days ago
    const alexWeights = [83.5, 82.2, 81.0, 79.8, 78.5]; // Gradual healthy fat loss & tone
    const alexWaists = [89, 87, 85, 83.5, 82];
    const alexChests = [102, 102.5, 103, 103.5, 104]; // Muscle gain in chest
    const alexBodyFats = [21.5, 20.2, 19.0, 17.8, 16.5];

    for (let i = 0; i < logDates.length; i++) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - logDates[i]);

      await WorkoutLog.create({
        member: member1._id,
        routine: alexRoutine._id,
        date: logDate,
        workoutTitle: i % 2 === 0 ? 'Chest & Triceps Power' : 'Back & Biceps Pull',
        durationMinutes: 55,
        caloriesBurned: 420 + i * 15,
        moodRating: 4 + (i % 2),
        notes: `Felt strong! Session ${i + 1}. Weight tracking down steadily and energy levels are high.`,
        measurements: {
          weightKg: alexWeights[i],
          waistCm: alexWaists[i],
          chestCm: alexChests[i],
          armsCm: 37 + i * 0.3,
          bodyFatPercentage: alexBodyFats[i],
        },
        exercisesCompleted: [
          {
            exerciseName: i % 2 === 0 ? 'Barbell Flat Bench Press' : 'Wide-Grip Lat Pulldown',
            setsCompleted: 4,
            repsCompleted: '10',
            weightKg: 65 + i * 2.5,
            notes: 'Smooth reps with clean pause',
          },
          {
            exerciseName: i % 2 === 0 ? 'Incline Dumbbell Press' : 'Bent-Over Barbell Row',
            setsCompleted: 3,
            repsCompleted: '12',
            weightKg: 24 + i * 1,
            notes: 'Pushed close to failure on last set',
          },
        ],
      });
    }

    // Sarah's logs
    const sarahLogDates = [20, 14, 7, 2];
    const sarahWeights = [66.0, 64.8, 63.5, 62.2];
    const sarahWaists = [77, 75, 73, 71.5];

    for (let j = 0; j < sarahLogDates.length; j++) {
      const sDate = new Date(now);
      sDate.setDate(sDate.getDate() - sarahLogDates[j]);

      await WorkoutLog.create({
        member: member2._id,
        routine: sarahRoutine._id,
        date: sDate,
        workoutTitle: 'HIIT Conditioning & Core',
        durationMinutes: 45,
        caloriesBurned: 380,
        moodRating: 5,
        notes: 'Intense metabolic burn! Loved the core circuit.',
        measurements: {
          weightKg: sarahWeights[j],
          waistCm: sarahWaists[j],
          chestCm: 88,
          bodyFatPercentage: 24.0 - j * 0.8,
        },
        exercisesCompleted: [
          {
            exerciseName: 'Kettlebell Goblet Squats',
            setsCompleted: 3,
            repsCompleted: '15',
            weightKg: 16,
            notes: 'Consistent speed across all sets',
          },
        ],
      });
    }

    console.log('Workout logs and measurements created successfully.');
    console.log('----------------------------------------------------');
    console.log('DATABASE SEED COMPLETE!');
    console.log('Credentials to test:');
    console.log(' Admin:   admin@gymfit.com   / password123');
    console.log(' Trainer: trainer@gymfit.com / password123');
    console.log(' Member:  member@gymfit.com  / password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
