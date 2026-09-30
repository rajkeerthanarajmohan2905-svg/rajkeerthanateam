import React, { useState } from 'react';
import { X, Sparkles, SlidersHorizontal, DollarSign, Users, Shield, ArrowRight } from 'lucide-react';
import { BudgetProfile } from '../types/budget';

interface BudgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BudgetProfile;
  onGenerate: (newProfile: BudgetProfile) => void;
  isLoading: boolean;
}

export const BudgetConfigModal: React.FC<BudgetConfigModalProps> = ({
  isOpen,
  onClose,
  profile,
  onGenerate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<BudgetProfile>({ ...profile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const priorities = [
    { id: 'balanced', label: 'Balanced Living', desc: 'Even 50/30/20 distribution with steady growth' },
    { id: 'debt-payoff', label: 'Aggressive Debt Payoff', desc: 'Maximize high-interest debt avalanche' },
    { id: 'aggressive-savings', label: 'Hyper-Wealth Accumulation', desc: 'Target 30%+ savings/investments rate' },
    { id: 'family-security', label: 'Family & Children First', desc: 'Robust emergency buffer & education sinking funds' },
    { id: 'lifestyle-freedom', label: 'Lifestyle & Travel Joy', desc: 'Ample discretionary envelopes for dining & trips' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configure Budget Parameters</h3>
              <p className="text-xs text-slate-400">Gemini will compute optimal envelope recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Monthly Income & Pay Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Net Income ({formData.currency})
              </label>
              <input
                type="number"
                value={formData.monthlyIncome || ''}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
                required
                min="500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paycheck Frequency
              </label>
              <select
                value={formData.payFrequency}
                onChange={(e) => setFormData({ ...formData, payFrequency: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="monthly">Monthly (1x/month)</option>
                <option value="bi-weekly">Bi-Weekly (Every 2 weeks)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Living Cost Tier & Dependents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cost of Living Tier
              </label>
              <select
                value={formData.livingCostTier}
                onChange={(e) => setFormData({ ...formData, livingCostTier: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="low">Low Cost Area</option>
                <option value="moderate">Moderate Cost Metro</option>
                <option value="high">High Cost City (e.g. Seattle, Austin)</option>
                <option value="very-high">Very High Cost (e.g. NYC, SF, London)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dependents / Children
              </label>
              <input
                type="number"
                value={formData.dependents}
                onChange={(e) => setFormData({ ...formData, dependents: Math.max(0, Number(e.target.value)) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                min="0"
                max="10"
              />
            </div>
          </div>

          {/* Existing Commitments (Rent/Loans) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Known Fixed Rent / Mortgage ({formData.currency})
              </label>
              <input
                type="number"
                value={formData.existingFixedCosts || ''}
                onChange={(e) => setFormData({ ...formData, existingFixedCosts: Number(e.target.value) })}
                placeholder="e.g. 1500"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Existing High-Interest Debts ({formData.currency})
              </label>
              <input
                type="number"
                value={formData.existingDebts || ''}
                onChange={(e) => setFormData({ ...formData, existingDebts: Number(e.target.value) })}
                placeholder="e.g. 0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Core Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Primary Financial Objective
            </label>
            <div className="space-y-2">
              {priorities.map((p) => {
                const isSelected = formData.financialPriority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, financialPriority: p.id as any })}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.label}</div>
                      <div className="text-[11px] text-slate-400">{p.desc}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Lifestyle Notes or Goals (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Saving for a trip to Japan in November, need $300 buffer for dental insurance..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.monthlyIncome}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Strategy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Recommendation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
