import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Sliders,
  DollarSign,
  TrendingDown,
  Info,
  Zap,
} from 'lucide-react';
import { SmartPacket, BudgetProfile, PacketType } from '../types/budget';
import { getPacketIcon } from '../utils/iconHelper';

interface PacketsViewProps {
  packets: SmartPacket[];
  profile: BudgetProfile;
  onUpdatePacket: (packet: SmartPacket) => void;
  onDeletePacket: (id: string) => void;
  onOpenAddExpense: (packetId?: string) => void;
  onOpenAddPacket: () => void;
}

export const PacketsView: React.FC<PacketsViewProps> = ({
  packets,
  profile,
  onUpdatePacket,
  onDeletePacket,
  onOpenAddExpense,
  onOpenAddPacket,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [editingPacketId, setEditingPacketId] = useState<string | null>(null);
  const [editAllocatedVal, setEditAllocatedVal] = useState<number>(0);

  const filteredPackets = packets.filter((p) => {
    if (filterType === 'all') return true;
    if (filterType === 'savings') return p.type === 'savings' || p.type === 'debt';
    return p.type === filterType;
  });

  const totalAllocated = packets.reduce((acc, p) => acc + (p.allocated || 0), 0);
  const totalSpent = packets.reduce((acc, p) => acc + (p.spent || 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  const startEdit = (p: SmartPacket) => {
    setEditingPacketId(p.id);
    setEditAllocatedVal(p.allocated);
  };

  const saveEdit = (p: SmartPacket) => {
    onUpdatePacket({ ...p, allocated: Number(editAllocatedVal) || 0 });
    setEditingPacketId(null);
  };

  const quickAddSpend = (packet: SmartPacket, amount: number) => {
    onUpdatePacket({
      ...packet,
      spent: packet.spent + amount,
    });
  };

  const resetPacketSpend = (packet: SmartPacket) => {
    onUpdatePacket({
      ...packet,
      spent: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Envelope Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Smart Envelope Packets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active cashflow envelopes. Track spending against targets in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddExpense()}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
            <button
              onClick={onOpenAddPacket}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              + Create Packet
            </button>
          </div>
        </div>

        {/* Global Envelopes Balance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Total Envelope Budget</div>
            <div className="text-base font-bold text-white">
              {profile.currency}{totalAllocated.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {Math.round((totalAllocated / (profile.monthlyIncome || 1)) * 100)}% of income
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Total Spent This Cycle</div>
            <div className="text-base font-bold text-slate-200">
              {profile.currency}{totalSpent.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}% of envelopes
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Remaining Packet Balance</div>
            <div className="text-base font-bold text-emerald-400">
              {profile.currency}{totalRemaining.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Available to spend</div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Unallocated Income Buffer</div>
            <div className="text-base font-bold text-teal-400">
              {profile.currency}{Math.max(0, profile.monthlyIncome - totalAllocated).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Emergency unbudgeted</div>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
            {[
              { id: 'all', label: `All Packets (${packets.length})` },
              { id: 'need', label: 'Needs' },
              { id: 'want', label: 'Wants' },
              { id: 'savings', label: 'Savings & Debt' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  filterType === t.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredPackets.length} of {packets.length} packets
          </span>
        </div>
      </div>

      {/* Packets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackets.map((packet) => {
          const spentPct = packet.allocated > 0 ? Math.round((packet.spent / packet.allocated) * 100) : 0;
          const remaining = packet.allocated - packet.spent;
          const isOverBudget = remaining < 0;
          const isNearLimit = spentPct >= 80 && !isOverBudget;
          const isEditing = editingPacketId === packet.id;

          const isNeed = packet.type === 'need';
          const isSavings = packet.type === 'savings' || packet.type === 'debt';
          const typeBadgeColor = isNeed ? 'text-blue-400' : isSavings ? 'text-emerald-400' : 'text-amber-400';
          const typeLabel = isNeed ? 'Need' : isSavings ? 'Savings/Debt' : 'Want';

          return (
            <div
              key={packet.id}
              className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                isOverBudget
                  ? 'border-rose-500/50 shadow-rose-950/20'
                  : isNearLimit
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Icon, Name, Type, Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${packet.color}25`, color: packet.color }}
                    >
                      {getPacketIcon(packet.iconName, 'w-5 h-5')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{packet.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={`font-medium ${typeBadgeColor}`}>{typeLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{spentPct}% spent</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions dropdown or buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => (isEditing ? saveEdit(packet) : startEdit(packet))}
                      className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
                      title="Adjust allocation target"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePacket(packet.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md hover:bg-slate-800 transition"
                      title="Delete packet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Editing Target */}
                {isEditing ? (
                  <div className="mb-3 p-2 bg-slate-950 rounded-lg border border-slate-700 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Target {profile.currency}</span>
                    <input
                      type="number"
                      value={editAllocatedVal}
                      onChange={(e) => setEditAllocatedVal(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-semibold"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(packet)}
                      className="px-2 py-1 bg-emerald-500 text-slate-950 rounded text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : null}

                {/* Progress Visual Bar */}
                <div className="space-y-1.5 mb-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      Spent: <strong className="text-white">{profile.currency}{packet.spent.toLocaleString()}</strong>
                    </span>
                    <span className="text-slate-400 font-medium">
                      Budget: <strong className="text-slate-200">{profile.currency}{packet.allocated.toLocaleString()}</strong>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(100, spentPct)}%`,
                        backgroundColor: isOverBudget ? '#EF4444' : isNearLimit ? '#F59E0B' : packet.color || '#10B981',
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={isOverBudget ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                      {isOverBudget
                        ? `Over by ${profile.currency}${Math.abs(remaining).toLocaleString()}`
                        : `Remaining: ${profile.currency}${remaining.toLocaleString()}`}
                    </span>
                    {isOverBudget && (
                      <span className="text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> Over budget
                      </span>
                    )}
                    {isNearLimit && (
                      <span className="text-amber-400 flex items-center gap-1 font-medium">
                        Caution (80%+)
                      </span>
                    )}
                    {!isOverBudget && !isNearLimit && spentPct > 0 && (
                      <span className="text-emerald-400/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> On Track
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Micro-Spends */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[10px] text-slate-500 font-medium mr-1">Quick Log:</span>
                  {[5, 15, 50].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => quickAddSpend(packet, amt)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/60 transition cursor-pointer active:scale-95"
                    >
                      +{profile.currency}{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => onOpenAddExpense(packet.id)}
                    className="ml-auto text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Custom +
                  </button>
                </div>
              </div>

              {/* Rationale & Tip Footer */}
              <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[11px] text-slate-400 leading-snug">
                  {packet.rationale}
                </div>
                {packet.smartTip && (
                  <div className="flex items-start gap-1 text-[11px] text-emerald-400/90">
                    <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{packet.smartTip}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPackets.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-400 mb-3">No packets found in this category.</p>
          <button
            onClick={onOpenAddPacket}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition"
          >
            Create a New Packet
          </button>
        </div>
      )}
    </div>
  );
};
