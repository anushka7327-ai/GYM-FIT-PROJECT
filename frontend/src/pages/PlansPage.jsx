import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Check,
  Edit2,
  Trash2,
  ShieldCheck,
  Calendar,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function PlansPage() {
  const { user, isAdmin, isMember } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    durationMonths: 1,
    price: 39.99,
    features: '',
    tag: '',
    active: true,
  });

  // Subscribe modal
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPlanForSub, setSelectedPlanForSub] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.getPlans();
      if (res.success) {
        setPlans(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      description: '',
      durationMonths: 1,
      price: 39.99,
      features: 'Full gym floor & cardio access\nLocker room access\nComplimentary fitness checkup',
      tag: '',
      active: true,
    });
    setIsPlanModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      durationMonths: plan.durationMonths,
      price: plan.price,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      tag: plan.tag || '',
      active: plan.active,
    });
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const payload = {
      ...planForm,
      features: planForm.features.split('\n').filter((f) => f.trim() !== ''),
    };

    try {
      if (editingPlan) {
        await api.updatePlan(editingPlan._id, payload);
        setSuccessMsg('Plan updated successfully!');
      } else {
        await api.createPlan(payload);
        setSuccessMsg('New membership plan created!');
      }
      setIsPlanModalOpen(false);
      fetchPlans();
    } catch (err) {
      setError(err.message || 'Error saving plan');
    }
  };

  const handleDeletePlan = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${name}"?`)) {
      return;
    }
    try {
      await api.deletePlan(id);
      setSuccessMsg(`Plan "${name}" deleted.`);
      fetchPlans();
    } catch (err) {
      setError(err.message || 'Error deleting plan');
    }
  };

  const openSubscribeModal = (plan) => {
    setSelectedPlanForSub(plan);
    setIsSubscribeModalOpen(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlanForSub) return;
    setSubscribing(true);
    setError('');
    try {
      await api.subscribeToPlan({
        planId: selectedPlanForSub._id,
        paymentMethod,
      });
      setSuccessMsg(`Successfully subscribed to ${selectedPlanForSub.name}! Start and expiry dates updated.`);
      setIsSubscribeModalOpen(false);
    } catch (err) {
      setError(err.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-1">
            <CreditCard className="w-3.5 h-3.5" /> Membership Plan Catalog & Subscriptions
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gym Membership Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Administer all gym membership tiers, pricing, duration, and member privileges (Full CRUD).'
              : 'Choose the training membership that matches your goals. Instant activation with start and expiry dates.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Plan
          </button>
        )}
      </div>

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

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-slate-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No membership plans available</h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin ? 'Click "Add New Plan" above to create your first gym plan.' : 'Check back later for active plans.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isPopular = plan.tag?.toLowerCase().includes('popular') || plan.tag?.toLowerCase().includes('best');

            return (
              <div
                key={plan._id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/30 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Tag pill */}
                {plan.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                    {plan.tag}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="pt-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  {/* Price & Duration */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">${plan.price}</span>
                      <span className="text-xs text-slate-400">
                        / {plan.durationMonths} {plan.durationMonths === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Duration: {plan.durationMonths * 30} Days Active
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Privileges:
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {plan.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id, plan.name)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors border border-red-500/20"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openSubscribeModal(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Subscribe Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADMIN CREATE / EDIT MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
            </h3>

            <form onSubmit={handlePlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Quarterly Pro Split"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Short summary of this plan"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    required
                    value={planForm.durationMonths}
                    onChange={(e) => setPlanForm({ ...planForm, durationMonths: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Highlight Tag (Optional)
                </label>
                <input
                  type="text"
                  value={planForm.tag}
                  onChange={(e) => setPlanForm({ ...planForm, tag: e.target.value })}
                  placeholder="e.g. Most Popular, Best Value"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  placeholder="Full gym floor access&#10;Sauna and pool privileges"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="planActive"
                  checked={planForm.active}
                  onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="planActive" className="text-slate-300 font-medium">
                  Active (visible to members for subscription)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER SUBSCRIBE / PAYMENT MODAL */}
      {isSubscribeModalOpen && selectedPlanForSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSubscribeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Subscribe to {selectedPlanForSub.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedPlanForSub.durationMonths} Months access for ${selectedPlanForSub.price}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Plan Price:</span>
                  <span className="text-white font-semibold">${selectedPlanForSub.price}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration:</span>
                  <span className="text-white font-semibold">
                    {selectedPlanForSub.durationMonths} Months ({selectedPlanForSub.durationMonths * 30} days)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Start Date:</span>
                  <span className="text-emerald-400 font-semibold">Today (or follows active plan)</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Due:</span>
                  <span className="text-emerald-400">${selectedPlanForSub.price}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Credit Card', 'UPI / Debit', 'Cash at Front Desk'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        paymentMethod === method
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={subscribing}
                  onClick={() => setIsSubscribeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={subscribing}
                  onClick={handleConfirmSubscribe}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  {subscribing ? 'Processing...' : 'Confirm Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
