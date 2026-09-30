import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { SmartPacket, BudgetProfile, AffordabilityResult } from '../types/budget';

interface AffordabilityViewProps {
  profile: BudgetProfile;
  packets: SmartPacket[];
  onLogPurchaseAsExpense: (packetId: string, amount: number, description: string) => void;
}

export const AffordabilityView: React.FC<AffordabilityViewProps> = ({
  profile,
  packets,
  onLogPurchaseAsExpense,
}) => {
  const [purchaseName, setPurchaseName] = useState('New Noise-Cancelling Headphones');
  const [cost, setCost] = useState<number | ''>(280);
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'monthly_financing'>('one-time');
  const [financingMonths, setFinancingMonths] = useState<number>(6);
  const [selectedPacketId, setSelectedPacketId] = useState<string>(packets[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AffordabilityResult | null>(null);

  const totalAllocated = packets.reduce((acc, p) => acc + (p.allocated || 0), 0);
  const totalSpent = packets.reduce((acc, p) => acc + (p.spent || 0), 0);
  const unallocatedBuffer = Math.max(0, profile.monthlyIncome - totalAllocated);

  const sampleScenarios = [
    { name: 'M4 MacBook Air', cost: 1099, type: 'one-time' as const, packet: 'Personal & Fun' },
    { name: 'Weekend Cabin Rental', cost: 420, type: 'one-time' as const, packet: 'Dining & Social' },
    { name: 'Ergonomic Desk Chair', cost: 350, type: 'one-time' as const, packet: 'Personal & Fun' },
    { name: 'Smartwatch Financing', cost: 39, type: 'monthly_financing' as const, months: 12, packet: 'Leisure & Subscriptions' },
  ];

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cost || Number(cost) <= 0 || !purchaseName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/affordability/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseName,
          cost: Number(cost),
          purchaseType,
          financingMonths: purchaseType === 'monthly_financing' ? financingMonths : undefined,
          context: {
            monthlyIncome: profile.monthlyIncome,
            currency: profile.currency,
            unallocatedBuffer,
            packets: packets.map((p) => ({
              id: p.id,
              name: p.name,
              allocated: p.allocated,
              spent: p.spent,
              remaining: p.allocated - p.spent,
            })),
            financialHealthScore: 78,
          },
        }),
      });

      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setResult(data);

      // Pre-select matching packet if found
      if (data.recommendedPacketToDebit) {
        const match = packets.find((p) =>
          p.name.toLowerCase().includes(data.recommendedPacketToDebit.toLowerCase())
        );
        if (match) setSelectedPacketId(match.id);
      }
    } catch (err) {
      console.error(err);
      // Fallback evaluation
      const numCost = Number(cost);
      const isAffordable = numCost <= unallocatedBuffer + 100;
      setResult({
        verdict: isAffordable ? 'green' : 'yellow',
        verdictTitle: isAffordable ? 'Feasible within Discretionary Envelope' : 'Manageable with Spending Tradeoffs',
        impactSummary: `This purchase of ${profile.currency}${numCost.toLocaleString()} represents ${Math.round(
          (numCost / (profile.monthlyIncome || 1)) * 100
        )}% of your monthly income.`,
        tradeoffOptions: [
          'Deduct from Personal & Leisure envelope over this and next cycle.',
          'Pause dining out for two weekends to preserve your emergency cash flow.',
        ],
        recommendedPacketToDebit: packets[0]?.name || 'Discretionary',
        timeToSaveMonths: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadScenario = (s: typeof sampleScenarios[0]) => {
    setPurchaseName(s.name);
    setCost(s.cost);
    setPurchaseType(s.type);
    if (s.months) setFinancingMonths(s.months);
    const match = packets.find((p) => p.name.toLowerCase().includes(s.packet.toLowerCase()));
    if (match) setSelectedPacketId(match.id);
    setResult(null);
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'green':
        return {
          bg: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Safe to Purchase',
        };
      case 'yellow':
        return {
          bg: 'bg-amber-950/30 border-amber-500/40 text-amber-400',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          icon: AlertTriangle,
          label: 'Caution / Requires Trade-off',
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-950/30 border-rose-500/40 text-rose-400',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
          icon: XCircle,
          label: 'High Risk / Delay Purchase',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <span>&ldquo;Can I Afford This?&rdquo; Evaluator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test planned or impulse purchases against your live packet balances and cashflow cushion.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Monthly Cushion:</span>
            <span className="font-bold text-emerald-400">
              {profile.currency}{unallocatedBuffer.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Scenario Pills */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-500 font-medium shrink-0">Try scenario:</span>
          {sampleScenarios.map((s, idx) => (
            <button
              key={idx}
              onClick={() => loadScenario(s)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap transition cursor-pointer"
            >
              {s.name} ({profile.currency}{s.cost})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Purchase Parameters
          </h3>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Item or Experience Name
              </label>
              <input
                type="text"
                value={purchaseName}
                onChange={(e) => setPurchaseName(e.target.value)}
                placeholder="e.g. Smart Watch, Plane Ticket, Leather Boots"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cost ({profile.currency})
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
                required
                min="1"
              />
            </div>

            {/* Purchase Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Structure
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPurchaseType('one-time')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    purchaseType === 'one-time'
                      ? 'bg-slate-800 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  One-Time Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseType('monthly_financing')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    purchaseType === 'monthly_financing'
                      ? 'bg-slate-800 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Financing
                </button>
              </div>
            </div>

            {purchaseType === 'monthly_financing' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Financing Term (Months)
                </label>
                <select
                  value={financingMonths}
                  onChange={(e) => setFinancingMonths(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {[3, 6, 12, 24, 36].map((m) => (
                    <option key={m} value={m}>
                      {m} Months (~{profile.currency}{Math.round((Number(cost) || 0) / m)}/mo)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Envelope / Packet to Debit
              </label>
              <select
                value={selectedPacketId}
                onChange={(e) => setSelectedPacketId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {packets.map((p) => {
                  const rem = p.allocated - p.spent;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (Remaining: {profile.currency}{rem.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !cost}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating Affordability with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate Purchase Affordability</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Evaluation Results Output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              AI Affordability Analysis
            </h3>

            {result ? (
              <div className="space-y-4">
                {/* Verdict Banner */}
                {(() => {
                  const style = getVerdictStyle(result.verdict);
                  const Icon = style.icon;
                  return (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${style.bg}`}>
                      <Icon className="w-6 h-6 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${style.badge}`}>
                            {style.label}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {result.verdictTitle}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {result.impactSummary}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Trade-off Recommendations */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Budget Trade-offs &amp; Action Plan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {result.tradeoffOptions.map((opt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">·</span>
                        <span className="leading-relaxed">{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sinking Timeline */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                    <div className="text-[11px] text-slate-400">Optimal Sinking Timeline</div>
                    <div className="text-base font-bold text-white">
                      {result.timeToSaveMonths} {result.timeToSaveMonths === 1 ? 'Month' : 'Months'}
                    </div>
                    <div className="text-[10px] text-slate-500">Without disrupting emergency goals</div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                    <div className="text-[11px] text-slate-400">Target Envelope</div>
                    <div className="text-base font-bold text-emerald-400 truncate">
                      {result.recommendedPacketToDebit || 'Discretionary'}
                    </div>
                    <div className="text-[10px] text-slate-500">Suggested packet allocation</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-14 px-4 text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-2">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">No Evaluation Performed Yet</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Enter an item and amount on the left, then click &ldquo;Evaluate Purchase Affordability&rdquo; to test it against your envelopes.
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ready to commit to this purchase?
              </span>
              <button
                onClick={() => {
                  if (selectedPacketId && cost) {
                    onLogPurchaseAsExpense(selectedPacketId, Number(cost), purchaseName);
                    setResult(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Log to Envelope Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
