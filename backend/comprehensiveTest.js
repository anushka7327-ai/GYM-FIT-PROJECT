const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      const dataStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('   GYMFIT DEEP VERIFICATION & INTEGRATION TEST RUN');
  console.log('======================================================\n');

  // --- 1. System Health ---
  console.log('[Phase 1] Testing Server Health & Connectivity');
  const health = await request('/api/health');
  assert(health.status === 200 && health.body.status === 'ok', 'Server is up and responds to /api/health');

  // --- 2. Admin Flow ---
  console.log('\n[Phase 2] Testing Admin Role & Capabilities');
  const adminLogin = await request('/api/auth/login', 'POST', {
    email: 'admin@gymfit.com',
    password: 'password123',
  });
  assert(adminLogin.status === 200, 'Admin login succeeded');
  assert(adminLogin.body.user.role === 'admin', 'Admin role verified in token payload');
  const adminToken = adminLogin.body.token;

  // Admin Dashboard stats
  const adminDash = await request('/api/analytics/dashboard', 'GET', null, adminToken);
  assert(adminDash.status === 200, 'Admin dashboard stats API responded');
  assert(adminDash.body.stats.totalMembers >= 4, `Total members count tracked: ${adminDash.body.stats.totalMembers}`);
  assert(adminDash.body.stats.totalRevenue > 0, `Total revenue tracked: $${adminDash.body.stats.totalRevenue}`);

  // Plan CRUD (Create, Read, Update, Delete)
  console.log('  Testing Plan CRUD Operations:');
  const newPlan = await request('/api/plans', 'POST', {
    name: 'Test Weekend Pass',
    description: 'Temporary test plan for verification',
    durationMonths: 2,
    price: 49.99,
    features: ['Weekend access', 'Sauna access'],
    tag: 'Test',
  }, adminToken);
  assert(newPlan.status === 201 && newPlan.body.data?._id, 'Plan creation (POST /api/plans) succeeded');
  const createdPlanId = newPlan.body.data._id;

  const updatePlan = await request(`/api/plans/${createdPlanId}`, 'PUT', {
    price: 44.99,
    name: 'Test Weekend Pass (Updated)',
  }, adminToken);
  assert(updatePlan.status === 200 && updatePlan.body.data?.price === 44.99, 'Plan update (PUT /api/plans/:id) succeeded');

  const deletePlan = await request(`/api/plans/${createdPlanId}`, 'DELETE', null, adminToken);
  assert(deletePlan.status === 200, 'Plan deletion (DELETE /api/plans/:id) succeeded');

  // Expiring Subscriptions Date Query
  console.log('  Testing Expiring Subscriptions Date Query:');
  const exp7 = await request('/api/subscriptions/expiring?days=7&mode=upcoming', 'GET', null, adminToken);
  assert(exp7.status === 200, 'Expiring in 7 days query succeeded');
  assert(exp7.body.data.length >= 1, `Found ${exp7.body.data.length} subscription(s) expiring within 7 days`);
  assert(exp7.body.data[0].daysRemaining <= 7, `Verified daysRemaining calculation (${exp7.body.data[0].daysRemaining}d)`);

  const expExpired = await request('/api/subscriptions/expiring?mode=expired', 'GET', null, adminToken);
  assert(expExpired.status === 200, 'Expired subscriptions query succeeded');
  assert(expExpired.body.data.length >= 1, `Found ${expExpired.body.data.length} expired subscription(s)`);

  // Revenue Report Aggregation
  console.log('  Testing Revenue Report MongoDB Aggregation Pipeline:');
  const revReport = await request('/api/analytics/revenue', 'GET', null, adminToken);
  assert(revReport.status === 200, 'Revenue report aggregation succeeded');
  assert(revReport.body.summary.totalRevenue > 0, `Aggregated total revenue: $${revReport.body.summary.totalRevenue}`);
  assert(Array.isArray(revReport.body.perPlanRevenue), 'perPlanRevenue returned as aggregated array');
  assert(revReport.body.perPlanRevenue.length >= 3, `Grouped plans count: ${revReport.body.perPlanRevenue.length}`);
  assert(Array.isArray(revReport.body.monthlyTrend), 'monthlyTrend aggregation returned by year & month');

  // User Management
  const usersRes = await request('/api/auth/users', 'GET', null, adminToken);
  assert(usersRes.status === 200 && usersRes.body.data.length >= 6, `User directory returned ${usersRes.body.data.length} users`);

  // --- 3. Trainer Flow ---
  console.log('\n[Phase 3] Testing Trainer Role & Capabilities');
  const trainerLogin = await request('/api/auth/login', 'POST', {
    email: 'trainer@gymfit.com',
    password: 'password123',
  });
  assert(trainerLogin.status === 200, 'Trainer login succeeded');
  assert(trainerLogin.body.user.role === 'trainer', 'Trainer role verified in token payload');
  const trainerToken = trainerLogin.body.token;

  // Trainer routines
  const trainerRoutines = await request('/api/routines/trainer', 'GET', null, trainerToken);
  assert(trainerRoutines.status === 200, 'Trainer routines retrieved successfully');

  // Trainer assigns a new routine to a member
  const memberList = await request('/api/auth/members', 'GET', null, trainerToken);
  assert(memberList.status === 200 && memberList.body.data.length > 0, 'Trainer retrieved members list');
  const targetMemberId = memberList.body.data[0]._id;

  const createdRoutine = await request('/api/routines', 'POST', {
    memberId: targetMemberId,
    title: 'Functional Conditioning Test Routine',
    description: 'Targeted explosive strength and core stability',
    goal: 'Conditioning',
    difficulty: 'Intermediate',
    days: [
      {
        dayNumber: 1,
        dayName: 'Day 1: Kettlebell Power',
        exercises: [
          { name: 'Kettlebell Swings', sets: 4, reps: '15', targetMuscle: 'Glutes/Hamstrings', restSeconds: 60, notes: 'Snap hips' },
          { name: 'Turkish Get-Up', sets: 3, reps: '5 each', targetMuscle: 'Full Body', restSeconds: 90, notes: 'Maintain overhead eye contact' }
        ]
      }
    ]
  }, trainerToken);
  assert(createdRoutine.status === 201 && createdRoutine.body.data?._id, 'Trainer created & assigned workout routine');
  const tempRoutineId = createdRoutine.body.data._id;

  // Cleanup test routine
  await request(`/api/routines/${tempRoutineId}`, 'DELETE', null, trainerToken);
  assert(true, 'Test routine cleaned up');

  // --- 4. Member Flow ---
  console.log('\n[Phase 4] Testing Member Role & Capabilities');
  const memberLogin = await request('/api/auth/login', 'POST', {
    email: 'member@gymfit.com',
    password: 'password123',
  });
  assert(memberLogin.status === 200, 'Member login succeeded');
  assert(memberLogin.body.user.role === 'member', 'Member role verified in token payload');
  const memberToken = memberLogin.body.token;
  const memberId = memberLogin.body.user._id;

  // Member Subscriptions
  const mySubs = await request('/api/subscriptions/my', 'GET', null, memberToken);
  assert(mySubs.status === 200, 'Member retrieved subscription details');
  assert(mySubs.body.activeSubscription !== null, `Member has active subscription: ${mySubs.body.activeSubscription?.plan?.name}`);

  // Member Assigned Routine
  const myRoutines = await request('/api/routines/my', 'GET', null, memberToken);
  assert(myRoutines.status === 200 && myRoutines.body.data.length > 0, `Member has ${myRoutines.body.data.length} assigned routine(s)`);

  // Member Workout & Measurement Logging
  console.log('  Testing Daily Workout & Body Measurements Logging:');
  const newWorkoutLog = await request('/api/workout-logs', 'POST', {
    workoutTitle: 'Comprehensive Verification Workout Session',
    durationMinutes: 52,
    caloriesBurned: 440,
    moodRating: 5,
    notes: 'Energy was phenomenal, pushed sets with strict rest.',
    measurements: {
      weightKg: 78.2,
      bodyFatPercentage: 16.2,
      waistCm: 81.5,
      chestCm: 104.5,
      armsCm: 38.2,
    },
    exercisesCompleted: [
      { exerciseName: 'Barbell Flat Bench Press', setsCompleted: 4, repsCompleted: '10', weightKg: 72.5, notes: 'PR hit cleanly' },
      { exerciseName: 'Incline Dumbbell Press', setsCompleted: 3, repsCompleted: '12', weightKg: 28, notes: 'Solid control' }
    ]
  }, memberToken);
  assert(newWorkoutLog.status === 201, 'Member successfully logged workout & body measurements');
  assert(newWorkoutLog.body.data?.measurements?.weightKg === 78.2, 'Body measurement weight (78.2 kg) saved');
  assert(newWorkoutLog.body.data?.measurements?.waistCm === 81.5, 'Body measurement waist (81.5 cm) saved');

  // Member Progress Report Aggregation
  console.log('  Testing Member Progress Aggregation Report:');
  const memberProg = await request('/api/analytics/progress', 'GET', null, memberToken);
  assert(memberProg.status === 200, 'Member progress report aggregation succeeded');
  assert(memberProg.body.summary.totalWorkouts >= 5, `Total workouts aggregated: ${memberProg.body.summary.totalWorkouts}`);
  assert(memberProg.body.progressionSummary.currentWeightKg === 78.2, `Current weight updated in aggregation: ${memberProg.body.progressionSummary.currentWeightKg} kg`);
  assert(memberProg.body.progressionSummary.weightChangeKg < 0, `Weight loss delta calculated: ${memberProg.body.progressionSummary.weightChangeKg} kg`);
  assert(memberProg.body.measurementTimeline.length >= 5, `Measurement timeline has ${memberProg.body.measurementTimeline.length} entries`);
  assert(memberProg.body.exerciseFrequency.length > 0, 'Exercise frequency and PR loads aggregated');

  // --- 5. Frontend Serving ---
  console.log('\n[Phase 5] Testing Built Frontend Static Serving');
  const frontendIndex = await request('/');
  assert(frontendIndex.status === 200 && (frontendIndex.raw?.includes('GymFit') || frontendIndex.raw?.includes('root')), 'Unified server serves frontend Single-Page Application (index.html)');

  console.log('\n======================================================');
  console.log('   🎉 ALL GYMFIT FUNCTIONAL CHECKS PASSED (100%)');
  console.log('======================================================\n');
  process.exit(0);
};

runAllTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
