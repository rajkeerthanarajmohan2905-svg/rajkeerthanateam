import React from 'react';
import { Sparkles, DollarSign, Wallet, RefreshCw, SlidersHorizontal, ChevronDown, CheckCircle2 } from 'lucide-react';
import { PRESET_PERSONAS } from '../data/presets';
import { BudgetProfile, SmartPacket } from '../types/budget';

interface HeaderProps {
  profile: BudgetProfile;
  packets: SmartPacket[];
  activePersonaId: string;
  onSelectPersona: (id: string) => void;
  onOpenConfig: () => void;
  onCurrencyChange: (currency: string) => void;
  onReset: () => void;
}

const CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: 'C$', label: 'CAD (C$)' },
  { symbol: 'A$', label: 'AUD (A$)' },
];

export const Header: React.FC<HeaderProps> = ({
  profile,
  packets,
  activePersonaId,
  onSelectPersona,
  onOpenConfig,
  onCurrencyChange,
  onReset,
}) => {
  const totalAllocated = packets.reduce((acc, p) => acc + (p.allocated || 0), 0);
  const totalSpent = packets.reduce((acc, p) => acc + (p.spent || 0), 0);
  const unallocated = Math.max(0, profile.monthlyIncome - totalAllocated);
  const remainingCash = Math.max(0, profile.monthlyIncome - totalSpent);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-slate-950 font-black">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  PocketSmart <span className="text-emerald-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AI</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intelligent budget recommendations &amp; smart envelope packets
              </p>
            </div>
          </div>

          {/* Mobile configure button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* Global Key Stats Bar */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-slate-400">Monthly Net:</span>
            <span className="font-semibold text-white">
              {profile.currency}
              {profile.monthlyIncome.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-slate-400">Allocated:</span>
            <span className={`font-semibold ${totalAllocated > profile.monthlyIncome ? 'text-rose-400' : 'text-slate-200'}`}>
              {profile.currency}
              {totalAllocated.toLocaleString()}
            </span>
            <span className="text-slate-500">
              ({profile.monthlyIncome > 0 ? Math.round((totalAllocated / profile.monthlyIncome) * 100) : 0}%)
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-slate-400">Unallocated Cushion:</span>
            <span className={`font-semibold ${unallocated < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {profile.currency}
              {unallocated.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Controls: Persona Selector, Currency, Config AI Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Persona quick preset */}
          <div className="relative group">
            <select
              value={activePersonaId}
              onChange={(e) => onSelectPersona(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium pl-3 pr-8 py-2 rounded-lg cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-emerald-400"
              aria-label="Preset financial personas"
            >
              {PRESET_PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  Preset: {p.name.split('·')[0]}
                </option>
              ))}
              <option value="custom">Custom Profile</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Currency Selector */}
          <div className="relative">
            <select
              value={profile.currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium pl-2.5 pr-6 py-2 rounded-lg cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-emerald-400"
              aria-label="Select currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Configure Profile / Generate AI Recommendations */}
          <button
            onClick={onOpenConfig}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Budget Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
