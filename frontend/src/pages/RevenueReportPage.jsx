import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  BarChart3,
  Calendar,
  Sparkles,
  PieChart,
  RefreshCw,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function RevenueReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPipelineCode, setShowPipelineCode] = useState(false);

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const fetchRevenueReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getRevenueReport();
      if (res.success) {
        setReport(res);
      }
    } catch (err) {
      setError(err.message || 'Error fetching revenue report');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = report?.summary?.totalRevenue || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            MongoDB Aggregation Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Revenue Report per Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live database aggregation computing total earnings, active member distribution, and monthly sales trends.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowPipelineCode(!showPipelineCode)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            {showPipelineCode ? 'Hide Pipeline Query' : 'View Aggregation Pipeline'}
          </button>
          <button
            onClick={fetchRevenueReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Code Toggle Explaining MongoDB Aggregation */}
      {showPipelineCode && (
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Executed MongoDB Aggregation Query
            </span>
            <span className="text-slate-500 font-mono">Subscription.aggregate([...])</span>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-4 rounded-2xl overflow-x-auto border border-slate-800">
{`// 1. Group subscriptions by plan ID and accumulate sales
Subscription.aggregate([
  {
    $group: {
      _id: '$plan',
      totalRevenue: { $sum: '$amountPaid' },
      totalSubscriptions: { $sum: 1 },
      activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
      expiredCount: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
      avgAmountPaid: { $avg: '$amountPaid' }
    }
  },
  {
    $lookup: {
      from: 'plans',
      localField: '_id',
      foreignField: '_id',
      as: 'planDetails'
    }
  },
  { $unwind: '$planDetails' },
  { $sort: { totalRevenue: -1 } }
]);`}
          </pre>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Grand Total Revenue"
          value={`$${report?.summary?.totalRevenue?.toFixed(2) || '0.00'}`}
          subtitle="All-time membership revenue"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Subscriptions"
          value={report?.summary?.totalSubscriptions || 0}
          subtitle="Total member subscriptions created"
          icon={CreditCard}
          color="cyan"
        />
        <StatCard
          title="Average Plan Value"
          value={`$${report?.summary?.averageRevenuePerSubscription || 0}`}
          subtitle="Average revenue per subscriber"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Revenue per Plan Aggregation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Revenue Breakdown Grouped by Plan (Aggregation)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time totals grouped directly on MongoDB server using $group, $sum, and $lookup
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Computing aggregation metrics...</div>
        ) : !report?.perPlanRevenue || report.perPlanRevenue.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No plan sales recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Catalog Price</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Subscriptions</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4">Expired</th>
                  <th className="py-3 px-4">Avg Amount Paid</th>
                  <th className="py-3 px-4 font-bold text-white">Aggregated Revenue</th>
                  <th className="py-3 px-4">Revenue Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {report.perPlanRevenue.map((item, idx) => {
                  const sharePercent =
                    totalRevenue > 0 ? Math.round((item.totalRevenue / totalRevenue) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {item.planName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">${item.planPrice || '--'}</td>
                      <td className="py-3 px-4">{item.durationMonths} Months</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.totalSubscriptions}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          {item.activeCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          {item.expiredCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">${item.avgAmountPaid}</td>
                      <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                        ${item.totalRevenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                              style={{ width: `${sharePercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 w-8 text-right">
                            {sharePercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Revenue Aggregation Trend */}
      {report?.monthlyTrend && report.monthlyTrend.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Monthly Revenue Trend (Aggregation by Year & Month)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {report.monthlyTrend.map((monthItem, idx) => {
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
              const monthName = monthNames[monthItem.month - 1] || `Month ${monthItem.month}`;

              return (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2"
                >
                  <div className="text-xs font-bold text-slate-400">
                    {monthName} {monthItem.year}
                  </div>
                  <div className="text-xl font-black text-white">
                    ${monthItem.revenue.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {monthItem.count} Subscriptions
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
