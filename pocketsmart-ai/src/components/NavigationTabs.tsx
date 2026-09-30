import React from 'react';
import { Sparkles, Layers, MessageSquareText, HelpCircle, BarChart3, PlusCircle } from 'lucide-react';

export type TabKey = 'recommendations' | 'packets' | 'assistant' | 'affordability' | 'analytics';

interface NavigationTabsProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  packetCount: number;
  onOpenAddExpense: () => void;
  onOpenAddPacket: () => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  packetCount,
  onOpenAddExpense,
  onOpenAddPacket,
}) => {
  const tabs = [
    {
      key: 'recommendations' as TabKey,
      label: 'AI Recommendation Blueprint',
      icon: Sparkles,
      highlight: true,
    },
    {
      key: 'packets' as TabKey,
      label: `Smart Packets (${packetCount})`,
      icon: Layers,
    },
    {
      key: 'assistant' as TabKey,
      label: 'Pocket Copilot AI',
      icon: MessageSquareText,
    },
    {
      key: 'affordability' as TabKey,
      label: 'Can I Afford This?',
      icon: HelpCircle,
    },
    {
      key: 'analytics' as TabKey,
      label: 'Projections & Flow',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChangeTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.highlight ? 'text-emerald-400' : 'text-slate-200') : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Spend</span>
          </button>
          <button
            onClick={onOpenAddPacket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>New Packet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
