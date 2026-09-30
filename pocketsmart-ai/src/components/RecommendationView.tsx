import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Info,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { BudgetRecommendation, BudgetProfile, SmartPacket } from '../types/budget';
import { getPacketIcon } from '../utils/iconHelper';

interface RecommendationViewProps {
  recommendation: BudgetRecommendation | null;
  profile: BudgetProfile;
  isLoading: boolean;
  onApplyRecommendation: (categories: BudgetRecommendation['categories']) => void;
  onOpenConfig: () => void;
  onAskCopilot: (query: string) => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  recommendation,
  profile,
  isLoading,
  onApplyRecommendation,
  onOpenConfig,
  onAskCopilot,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse mb-4 text-emerald-400">
          <Sparkles className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Analyzing Cashflow &amp; Personalizing Envelopes...</h3>
        <p className="text-sm text-slate-400 max-w-md">
          Gemini is synthesizing your {profile.currency}{profile.monthlyIncome.toLocaleString()} income, {profile.livingCostTier} cost of living tier, and {profile.financialPriority} focus to build optimal envelope buckets.
        </p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto px-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No Active AI Blueprint Generated Yet</h3>
        <p className="text-xs text-slate-400 mb-4">
          Click below to configure your income and financial priorities to receive a complete, tailored allocation.
        </p>
        <button
          onClick={onOpenConfig}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition"
        >
          Configure &amp; Generate AI Recommendation
        </button>
      </div>
    );
  }

  // Calculate totals by macro type
  const needsTotal = recommendation.categories
    .filter((c) => c.type === 'need')
    .reduce((sum, c) => sum + c.recommendedAmount, 0);
  const wantsTotal = recommendation.categories
    .filter((c) => c.type === 'want')
    .reduce((sum, c) => sum + c.recommendedAmount, 0);
  const savingsTotal = recommendation.categories
    .filter((c) => c.type === 'savings' || c.type === 'debt')
    .reduce((sum, c) => sum + c.recommendedAmount, 0);

  const income = profile.monthlyIncome || 1;
  const needsPct = Math.round((needsTotal / income) * 100);
  const wantsPct = Math.round((wantsTotal / income) * 100);
  const savingsPct = Math.round((savingsTotal / income) * 100);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Strategy Title & Apply Button */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Personalized Strategy</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 capitalize">{profile.financialPriority.replace('-', ' ')} Target</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {recommendation.strategyName}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {recommendation.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onApplyRecommendation(recommendation.categories)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to My Active Packets</span>
            </button>
            <button
              onClick={onOpenConfig}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              Re-tune Parameters
            </button>
          </div>
        </div>

        {/* Macro Flow Bar (Needs / Wants / Savings) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Macro Allocation Distribution:</span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-blue-400">Needs: {needsPct}% ({profile.currency}{needsTotal.toLocaleString()})</span>
              <span className="text-amber-400">Wants: {wantsPct}% ({profile.currency}{wantsTotal.toLocaleString()})</span>
              <span className="text-emerald-400">Future/Savings: {savingsPct}% ({profile.currency}{savingsTotal.toLocaleString()})</span>
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, needsPct)}%` }}
              className="bg-blue-500 transition-all duration-500"
              title={`Needs: ${needsPct}%`}
            />
            <div
              style={{ width: `${Math.min(100, wantsPct)}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Wants: ${wantsPct}%`}
            />
            <div
              style={{ width: `${Math.min(100, savingsPct)}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Savings: ${savingsPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Standard Benchmark: 50% Needs / 30% Wants / 20% Wealth</span>
            <span>Unallocated Cushion: {profile.currency}{recommendation.unallocatedBuffer.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* Health Score & Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getHealthScoreColor(recommendation.financialHealthScore)}`}>
            <span className="text-xl font-black">{recommendation.financialHealthScore}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider">Score</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-300">Financial Health Index</div>
            <p className="text-xs text-slate-400 leading-snug">
              {recommendation.healthAnalysis}
            </p>
          </div>
        </div>

        {/* Emergency Target Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-300">3-Month Safety Target</div>
            <div className="text-lg font-bold text-white">
              {profile.currency}{recommendation.threeMonthEmergencyTarget.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">
              Covers 90 days of essential housing, food, and utilities.
            </p>
          </div>
        </div>

        {/* Risk & Opportunity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-300">Risk Assessment</div>
            <p className="text-xs text-slate-400 leading-snug">
              {recommendation.riskAssessment}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Smart Packets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Recommended Envelopes &amp; Allocations</span>
            <span className="text-xs text-slate-500 font-normal lowercase">({recommendation.categories.length} packets)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Total Monthly Plan: <strong className="text-white">{profile.currency}{recommendation.totalAllocated.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recommendation.categories.map((cat) => {
            const isNeed = cat.type === 'need';
            const isSavings = cat.type === 'savings' || cat.type === 'debt';
            const typeLabel = isNeed ? 'Essential Need' : isSavings ? 'Future & Savings' : 'Discretionary Want';
            const typeColor = isNeed ? 'text-blue-400' : isSavings ? 'text-emerald-400' : 'text-amber-400';

            return (
              <div
                key={cat.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                      >
                        {getPacketIcon(cat.iconName, 'w-4 h-4')}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{cat.name}</h4>
                        <span className={`text-[11px] font-medium ${typeColor}`}>{typeLabel}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {profile.currency}{cat.recommendedAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cat.percentage}% of income
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {cat.rationale}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-emerald-400/90">
                  <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{cat.smartTip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Steps & AI Coaching Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        {/* Checklist */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI Actionable Implementation Steps</span>
          </h4>
          <div className="space-y-2">
            {recommendation.actionableSteps.map((step, idx) => {
              const isDone = !!completedSteps[idx];
              return (
                <button
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition flex items-start gap-3 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                      isDone ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Assistant Prompts */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Copilot About This Plan</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Get immediate calculations or trade-off advice based on this recommendation.
            </p>

            <div className="space-y-1.5">
              {[
                'How can I save $250 more per month?',
                'Simulate: What if my rent increases by 10%?',
                'Best sequence to pay off high-rate debt vs saving?',
              ].map((query, i) => (
                <button
                  key={i}
                  onClick={() => onAskCopilot(query)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center justify-between group transition"
                >
                  <span className="truncate">{query}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Adjustments to active envelopes can be made anytime in the Packets tab.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
