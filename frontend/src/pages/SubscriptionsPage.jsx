import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  CreditCard,
  User,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SubscriptionsPage() {
  const { user, isAdmin, isMember } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin filter states
  const [selectedFilter, setSelectedFilter] = useState('7'); // '7', '14', '30', 'expired', 'all'
  const [customDays, setCustomDays] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [selectedFilter, isAdmin]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdmin) {
        if (selectedFilter === 'all') {
          const res = await api.getAllSubscriptions();
          if (res.success) setSubscriptions(res.data || []);
        } else if (selectedFilter === 'expired') {
          const res = await api.getExpiringSubscriptions(0, 'expired');
          if (res.success) setSubscriptions(res.data || []);
        } else {
          // Date query with custom or predefined days
          const daysToQuery = selectedFilter === 'custom' ? customDays : parseInt(selectedFilter, 10);
          const res = await api.getExpiringSubscriptions(daysToQuery, 'upcoming');
          if (res.success) setSubscriptions(res.data || []);
        }
      } else {
        // Member view
        const res = await api.getMySubscriptions();
        if (res.success) {
          setActiveSub(res.activeSubscription || null);
          setSubscriptions(res.data || []);
        }
      }
    } catch (err) {
      setError(err.message || 'Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateSubscriptionStatus(id, newStatus);
      fetchSubscriptions();
    } catch (err) {
      setError(err.message || 'Could not update subscription');
    }
  };

  const filteredList = subscriptions.filter((sub) => {
    if (!searchTerm) return true;
    const name = sub.user?.name?.toLowerCase() || '';
    const email = sub.user?.email?.toLowerCase() || '';
    const plan = sub.plan?.name?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term) || plan.includes(term);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-1">
            <CalendarClock className="w-3.5 h-3.5" />
            {isAdmin ? 'Date Query Filter & Expiry Control' : 'Active Subscription & Status'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isAdmin ? 'Membership Subscriptions & Expiry Management' : 'My GymFit Subscription'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Query expiring memberships with MongoDB date queries to notify members and handle renewals.'
              : 'Track your membership start date, expiry date, days remaining, and payment history.'}
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* MEMBER VIEW: Active Card & History */}
      {!isAdmin && (
        <div className="space-y-6">
          {activeSub ? (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950">
                      Active Membership
                    </span>
                    <span className="text-xs text-slate-400">ID: {activeSub._id.slice(-6)}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {activeSub.plan?.name}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                      <div className="text-[11px] font-bold uppercase text-slate-400">Start Date</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {new Date(activeSub.startDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                      <div className="text-[11px] font-bold uppercase text-slate-400">Expiry Date</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {new Date(activeSub.endDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
                      <div className="text-[11px] font-bold uppercase text-slate-400">Time Remaining</div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">
                        {Math.max(
                          0,
                          Math.ceil((new Date(activeSub.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                        )}{' '}
                        Days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-slate-800 rounded-3xl min-w-[200px]">
                  <CreditCard className="w-8 h-8 text-emerald-400 mb-2" />
                  <div className="text-xs text-slate-400">Amount Paid</div>
                  <div className="text-2xl font-black text-white">${activeSub.amountPaid}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Paid via {activeSub.paymentMethod}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Clock className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Active Membership Plan</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You currently do not have an active membership subscription. Browse our plans to start working out!
              </p>
              <a
                href="/plans"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all"
              >
                Browse Plans
              </a>
            </div>
          )}

          {/* Subscription History */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Subscription & Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {subscriptions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-white">{sub.plan?.name || 'Custom Plan'}</td>
                      <td className="py-3 px-4">{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">${sub.amountPaid}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW: Date Query Filter & Management */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Query Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> Date Query:
                </div>

                <button
                  onClick={() => setSelectedFilter('7')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedFilter === '7'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Expiring in 7 Days
                </button>

                <button
                  onClick={() => setSelectedFilter('14')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedFilter === '14'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Expiring in 14 Days
                </button>

                <button
                  onClick={() => setSelectedFilter('30')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedFilter === '30'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Expiring in 30 Days
                </button>

                <button
                  onClick={() => setSelectedFilter('expired')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedFilter === 'expired'
                      ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Already Expired
                </button>

                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  All Subscriptions
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by member or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Query Explanation Banner */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                Active query mode: <strong className="text-white capitalize">{selectedFilter}</strong>.
                {selectedFilter !== 'all' && selectedFilter !== 'expired' && (
                  <span>
                    {' '}Runs MongoDB date query: <code className="text-emerald-400">endDate: &#123; $gte: now, $lte: +{selectedFilter}d &#125;</code>
                  </span>
                )}
                {selectedFilter === 'expired' && (
                  <span> Runs MongoDB date query: <code className="text-red-400">endDate: &#123; $lt: now &#125;</code></span>
                )}
              </span>
              <span className="text-slate-300 font-semibold">{filteredList.length} matching record(s)</span>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Executing date query...</div>
            ) : filteredList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No subscription records match this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Member Name & Email</th>
                      <th className="py-3 px-4">Plan Name</th>
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4">Days Left</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredList.map((sub) => {
                      const now = new Date();
                      const end = new Date(sub.endDate);
                      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                      const isExpired = end < now;

                      return (
                        <tr key={sub._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{sub.user?.name || 'Unknown'}</div>
                            <div className="text-[11px] text-slate-400">{sub.user?.email}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            {sub.plan?.name || 'Custom Plan'}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-200">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {isExpired ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                Expired {Math.abs(diffDays)}d ago
                              </span>
                            ) : diffDays <= 7 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {diffDays} {diffDays === 1 ? 'day' : 'days'} left
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                {diffDays} days left
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-emerald-400">
                            ${sub.amountPaid}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : sub.status === 'expired'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={sub.status}
                              onChange={(e) => handleStatusChange(sub._id, e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 outline-none focus:border-emerald-500"
                            >
                              <option value="active">Active</option>
                              <option value="expired">Expired</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
