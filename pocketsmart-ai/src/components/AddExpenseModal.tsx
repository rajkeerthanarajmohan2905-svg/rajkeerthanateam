import React, { useState } from 'react';
import { X, PlusCircle, Calendar, DollarSign, Tag, Layers } from 'lucide-react';
import { SmartPacket } from '../types/budget';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  packets: SmartPacket[];
  initialPacketId?: string;
  currency: string;
  onAddExpense: (packetId: string, amount: number, description: string, date: string) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  packets,
  initialPacketId,
  currency,
  onAddExpense,
}) => {
  const [packetId, setPacketId] = useState(initialPacketId || packets[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Sync if initialPacketId changes
  React.useEffect(() => {
    if (initialPacketId) setPacketId(initialPacketId);
    else if (packets.length > 0 && !packetId) setPacketId(packets[0].id);
  }, [initialPacketId, packets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packetId || !amount || Number(amount) <= 0 || !description.trim()) return;

    onAddExpense(packetId, Number(amount), description.trim(), date);
    setAmount('');
    setDescription('');
    onClose();
  };

  const selectedPacket = packets.find((p) => p.id === packetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Record Envelope Spend</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Envelope Packet
            </label>
            <select
              value={packetId}
              onChange={(e) => setPacketId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            >
              {packets.map((p) => {
                const rem = p.allocated - p.spent;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} (Remaining: {currency}{rem.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Spend Amount ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
              required
              min="0.01"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Trader Joe's groceries, Electric bill, Friday sushi"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            />
          </div>

          {selectedPacket && amount && Number(amount) > 0 && (
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              New envelope balance will be:{' '}
              <strong className={selectedPacket.allocated - (selectedPacket.spent + Number(amount)) < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {currency}
                {(selectedPacket.allocated - (selectedPacket.spent + Number(amount))).toLocaleString()}
              </strong>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || !description.trim()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              Deduct &amp; Log Spend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
