import React, { useState } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';
import { SmartPacket, PacketType } from '../types/budget';
import { getPacketIcon } from '../utils/iconHelper';

interface AddPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onAddPacket: (newPacket: SmartPacket) => void;
}

const AVAILABLE_ICONS = [
  'Home',
  'Zap',
  'ShoppingBag',
  'Car',
  'HeartPulse',
  'Utensils',
  'Film',
  'Sparkles',
  'ShieldCheck',
  'TrendingUp',
  'CreditCard',
  'Plane',
  'Coffee',
  'BookOpen',
  'Wifi',
];

const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#0EA5E9', // Sky
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const AddPacketModal: React.FC<AddPacketModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddPacket,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PacketType>('want');
  const [allocated, setAllocated] = useState<number | ''>(200);
  const [iconName, setIconName] = useState('Sparkles');
  const [color, setColor] = useState('#8B5CF6');
  const [rationale, setRationale] = useState('');
  const [smartTip, setSmartTip] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !allocated) return;

    const newPacket: SmartPacket = {
      id: `packet-${Date.now()}`,
      name: name.trim(),
      type,
      allocated: Number(allocated),
      spent: 0,
      iconName,
      color,
      rationale: rationale.trim() || `Dedicated envelope for ${name.trim()}.`,
      smartTip: smartTip.trim() || 'Review monthly to adjust according to actual spending patterns.',
    };

    onAddPacket(newPacket);
    setName('');
    setRationale('');
    setSmartTip('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Create New Smart Envelope</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Envelope Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pet Care & Vet, Coffee & Bakery, Skiing Trip"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PacketType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="need">Need (Essential)</option>
                <option value="want">Want (Discretionary)</option>
                <option value="savings">Savings &amp; Wealth</option>
                <option value="debt">Debt Paydown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Target ({currency})
              </label>
              <input
                type="number"
                value={allocated}
                onChange={(e) => setAllocated(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="200"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold"
                required
                min="1"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Envelope Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setIconName(icon)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                    iconName === icon
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {getPacketIcon(icon, 'w-4 h-4')}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Envelope Accent Color
            </label>
            <div className="flex items-center gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rationale & Tip */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Purpose / Rationale (Optional)
            </label>
            <input
              type="text"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why this envelope exists..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Smart Rule / Frugal Tip (Optional)
            </label>
            <input
              type="text"
              value={smartTip}
              onChange={(e) => setSmartTip(e.target.value)}
              placeholder="e.g. Cap coffee purchases to $5/visit"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !allocated}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              Add Envelope
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
