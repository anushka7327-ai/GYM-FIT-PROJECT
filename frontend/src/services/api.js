// Determine API Base URL from environment variable (Vercel deployment) or fallback to relative /api (local dev)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/$/, '');
  // If user provided base URL without /api, ensure /api is appended
  if (!trimmed.endsWith('/api')) {
    return `${trimmed}/api`;
  }
  return trimmed;
};

const API_BASE_URL = getApiBaseUrl();

const getAuthToken = () => {
  return localStorage.getItem('gymfit_token');
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // Auth & Users
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateMe: (userData) =>
    request('/auth/me', { method: 'PUT', body: JSON.stringify(userData) }),
  getTrainers: () => request('/auth/trainers'),
  getMembers: (params = '') => request(`/auth/members${params}`),
  assignTrainer: (payload) =>
    request('/auth/assign-trainer', { method: 'PUT', body: JSON.stringify(payload) }),
  getAllUsers: (params = '') => request(`/auth/users${params}`),
  updateUserStatus: (userId, payload) =>
    request(`/auth/users/${userId}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Membership Plans
  getPlans: () => request('/plans'),
  getPlanById: (id) => request(`/plans/${id}`),
  createPlan: (planData) =>
    request('/plans', { method: 'POST', body: JSON.stringify(planData) }),
  updatePlan: (id, planData) =>
    request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(planData) }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),

  // Subscriptions & Expiring Memberships
  subscribeToPlan: (payload) =>
    request('/subscriptions', { method: 'POST', body: JSON.stringify(payload) }),
  getMySubscriptions: () => request('/subscriptions/my'),
  getAllSubscriptions: (params = '') => request(`/subscriptions${params}`),
  getExpiringSubscriptions: (days = 7, mode = 'upcoming') =>
    request(`/subscriptions/expiring?days=${days}&mode=${mode}`),
  updateSubscriptionStatus: (id, status) =>
    request(`/subscriptions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Workout Routines
  createRoutine: (routineData) =>
    request('/routines', { method: 'POST', body: JSON.stringify(routineData) }),
  getMyRoutines: () => request('/routines/my'),
  getTrainerRoutines: () => request('/routines/trainer'),
  getAllRoutines: (params = '') => request(`/routines${params}`),
  getRoutineById: (id) => request(`/routines/${id}`),
  updateRoutine: (id, routineData) =>
    request(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(routineData) }),
  deleteRoutine: (id) => request(`/routines/${id}`, { method: 'DELETE' }),

  // Workout & Measurement Logs
  createWorkoutLog: (logData) =>
    request('/workout-logs', { method: 'POST', body: JSON.stringify(logData) }),
  getMyWorkoutLogs: (params = '') => request(`/workout-logs/my${params}`),
  getMemberWorkoutLogs: (memberId) =>
    request(`/workout-logs/member/${memberId}`),
  getWorkoutLogById: (id) => request(`/workout-logs/${id}`),
  updateWorkoutLog: (id, logData) =>
    request(`/workout-logs/${id}`, { method: 'PUT', body: JSON.stringify(logData) }),
  deleteWorkoutLog: (id) => request(`/workout-logs/${id}`, { method: 'DELETE' }),

  // Analytics & Reports
  getDashboardStats: () => request('/analytics/dashboard'),
  getRevenueReport: () => request('/analytics/revenue'),
  getMemberProgressReport: (memberId = '') =>
    request(`/analytics/progress/${memberId}`),
};
