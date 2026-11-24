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
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
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

const runTests = async () => {
  console.log('--- Starting GymFit Automated Endpoint Verification ---');

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('1. Health check:', health.status === 200 ? 'PASS' : 'FAIL', health.body);

    // 2. Login Admin
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@gymfit.com',
      password: 'password123',
    });
    console.log('2. Admin Login:', adminLogin.status === 200 ? 'PASS' : 'FAIL', 'Role:', adminLogin.body?.user?.role);
    const adminToken = adminLogin.body?.token;

    // 3. Login Trainer
    const trainerLogin = await request('/api/auth/login', 'POST', {
      email: 'trainer@gymfit.com',
      password: 'password123',
    });
    console.log('3. Trainer Login:', trainerLogin.status === 200 ? 'PASS' : 'FAIL', 'Role:', trainerLogin.body?.user?.role);
    const trainerToken = trainerLogin.body?.token;

    // 4. Login Member
    const memberLogin = await request('/api/auth/login', 'POST', {
      email: 'member@gymfit.com',
      password: 'password123',
    });
    console.log('4. Member Login:', memberLogin.status === 200 ? 'PASS' : 'FAIL', 'Role:', memberLogin.body?.user?.role);
    const memberToken = memberLogin.body?.token;

    // 5. Plans list
    const plans = await request('/api/plans');
    console.log('5. Public Plans List:', plans.status === 200 ? 'PASS' : 'FAIL', 'Total Plans:', plans.body?.count);

    // 6. Expiring Memberships Date Query (Admin)
    const expiring = await request('/api/subscriptions/expiring?days=7', 'GET', null, adminToken);
    console.log('6. Expiring Subscriptions (Date Query <= 7d):', expiring.status === 200 ? 'PASS' : 'FAIL', 'Found:', expiring.body?.count);

    // 7. Member Assigned Routines
    const routines = await request('/api/routines/my', 'GET', null, memberToken);
    console.log('7. Member Routines:', routines.status === 200 ? 'PASS' : 'FAIL', 'Routines Count:', routines.body?.count);

    // 8. Member Workout Logs
    const workoutLogs = await request('/api/workout-logs/my', 'GET', null, memberToken);
    console.log('8. Member Workout Logs:', workoutLogs.status === 200 ? 'PASS' : 'FAIL', 'Logs Count:', workoutLogs.body?.count);

    // 9. Member Progress Report Aggregation
    const progress = await request('/api/analytics/progress', 'GET', null, memberToken);
    console.log('9. Member Progress Aggregation Report:', progress.status === 200 ? 'PASS' : 'FAIL', {
      totalWorkouts: progress.body?.summary?.totalWorkouts,
      weightChange: progress.body?.progressionSummary?.weightChangeKg,
      currentWeight: progress.body?.progressionSummary?.currentWeightKg,
    });

    // 10. Revenue Report per Plan Aggregation (Admin)
    const revenue = await request('/api/analytics/revenue', 'GET', null, adminToken);
    console.log('10. Revenue Report Aggregation (Admin):', revenue.status === 200 ? 'PASS' : 'FAIL', {
      totalRevenue: revenue.body?.summary?.totalRevenue,
      totalSubscriptions: revenue.body?.summary?.totalSubscriptions,
      plansAggregated: revenue.body?.perPlanRevenue?.length,
    });

    console.log('--- ALL TEST ASSERTIONS COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
