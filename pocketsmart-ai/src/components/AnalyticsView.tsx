import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { SmartPacket, BudgetProfile, Transaction } from '../types/budget';

interface AnalyticsViewProps {
  profile: BudgetProfile;
  packets: SmartPacket[];
  transactions: Transaction[];
  onOpenAddExpense: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  packets,
  transactions,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterPacket, setSelectedFilterPacket] = useState('all');

  const totalAllocated = packets.reduce((acc, p) => acc + (p.allocated || 0), 0);
  const totalSpent = packets.reduce((acc, p) => acc + (p.spent || 0), 0);

  const needsTotal = packets
    .filter((p) => p.type === 'need')
    .reduce((acc, p) => acc + p.allocated, 0);
  const wantsTotal = packets
    .filter((p) => p.type === 'want')
    .reduce((acc, p) => acc + p.allocated, 0);
  const savingsTotal = packets
    .filter((p) => p.type === 'savings' || p.type === 'debt')
    .reduce((acc, p) => acc + p.allocated, 0);

  const income = profile.monthlyIncome || 1;
  const needsPct = Math.round((needsTotal / income) * 100);
  const wantsPct = Math.round((wantsTotal / income) * 100);
  const savingsPct = Math.round((savingsTotal / income) * 100);

  // 6-Month Projected Net Accumulation
  const monthlySavingsRate = savingsTotal + Math.max(0, profile.monthlyIncome - totalAllocated);
  const forecastMonths = [
    { label: 'Month 1', savings: monthlySavingsRate * 1 },
    { label: 'Month 2', savings: monthlySavingsRate * 2 },
    { label: 'Month 3', savings: monthlySavingsRate * 3 },
    { label: 'Month 4', savings: monthlySavingsRate * 4 },
    { label: 'Month 5', savings: monthlySavingsRate * 5 },
    { label: 'Month 6', savings: monthlySavingsRate * 6 },
  ];

  const maxSavings = forecastMonths[forecastMonths.length - 1].savings || 1;

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.packetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPacket = selectedFilterPacket === 'all' || t.packetId === selectedFilterPacket;
    return matchesSearch && matchesPacket;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Envelope', 'Amount'];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.packetName}"`,
      t.amount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pocketsmart-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Analytics Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span>Cashflow Analytics &amp; Wealth Trajectory</span>
        </h2>
        <p className="text-xs text-slate-400">
          Visualizing your monthly cash distribution, savings velocity, and comprehensive transaction ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs vs Wants vs Savings Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Allocation vs 50/30/20 Standard
            </h3>
            <span className="text-xs text-slate-400">Total Net: {profile.currency}{profile.monthlyIncome.toLocaleString()}</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Needs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-400">Essentials &amp; Needs</span>
                <span className="text-slate-300">
                  {profile.currency}{needsTotal.toLocaleString()} ({needsPct}% · Target: 50%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div style={{ width: `${Math.min(100, needsPct)}%` }} className="bg-blue-500 rounded-full transition-all" />
              </div>
            </div>

            {/* Wants */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-400">Discretionary &amp; Wants</span>
                <span className="text-slate-300">
                  {profile.currency}{wantsTotal.toLocaleString()} ({wantsPct}% · Target: 30%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div style={{ width: `${Math.min(100, wantsPct)}%` }} className="bg-amber-500 rounded-full transition-all" />
              </div>
            </div>

            {/* Savings & Debt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400">Savings &amp; Wealth Velocity</span>
                <span className="text-slate-300">
                  {profile.currency}{savingsTotal.toLocaleString()} ({savingsPct}% · Target: 20%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                <div style={{ width: `${Math.min(100, savingsPct)}%` }} className="bg-emerald-500 rounded-full transition-all" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
            {savingsPct >= 20 ? (
              <span className="text-emerald-400 font-medium">
                Excellent wealth velocity! You are allocating {savingsPct}% toward financial freedom, meeting or exceeding national benchmark guidelines.
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                Your savings rate is {savingsPct}%. Shifting 3-5% from discretionary dining or shopping envelopes could accelerate your emergency buffer by months.
              </span>
            )}
          </div>
        </div>

        {/* 6-Month Projected Wealth Accumulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>6-Month Wealth Accumulation</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              +{profile.currency}{monthlySavingsRate.toLocaleString()}/mo
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2">
            {forecastMonths.map((m, i) => {
              const heightPct = Math.round((m.savings / maxSavings) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-semibold text-slate-300">
                    {profile.currency}{Math.round(m.savings / 1000)}k
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 hover:brightness-110"
                    title={`${m.label}: ${profile.currency}${m.savings.toLocaleString()}`}
                  />
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Projected 6-Mo Net: <strong className="text-white">{profile.currency}{(monthlySavingsRate * 6).toLocaleString()}</strong></span>
            <span>Annual Run-rate: <strong className="text-white">{profile.currency}{(monthlySavingsRate * 12).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Envelope Transaction Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Audit and filter expenditures across all smart packets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              + Log Spend
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description or packet..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <select
            value={selectedFilterPacket}
            onChange={(e) => setSelectedFilterPacket(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">All Envelopes</option>
            {packets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Envelope Packet</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{tx.date}</td>
                  <td className="py-2.5 px-4 font-medium text-white">{tx.description}</td>
                  <td className="py-2.5 px-4 text-slate-400">{tx.packetName}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-rose-400">
                    -{profile.currency}{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No transactions recorded matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
