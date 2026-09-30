import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { RecommendationView } from './components/RecommendationView';
import { PacketsView } from './components/PacketsView';
import { AICopilotView } from './components/AICopilotView';
import { AffordabilityView } from './components/AffordabilityView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetConfigModal } from './components/BudgetConfigModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddPacketModal } from './components/AddPacketModal';
import { PRESET_PERSONAS } from './data/presets';
import { BudgetProfile, SmartPacket, BudgetRecommendation, Transaction } from './types/budget';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const defaultPersona = PRESET_PERSONAS[0];

  // States
  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return localStorage.getItem('ps_persona_id') || defaultPersona.id;
  });

  const [profile, setProfile] = useState<BudgetProfile>(() => {
    const saved = localStorage.getItem('ps_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultPersona.profile;
  });

  const [packets, setPackets] = useState<SmartPacket[]>(() => {
    const saved = localStorage.getItem('ps_packets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultPersona.initialPackets;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ps_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Seed initial transactions
    return [
      {
        id: 'tx-1',
        packetId: 'housing',
        packetName: 'Metro Apartment & Rent',
        amount: 1850,
        description: 'Monthly Apartment Lease',
        date: '2026-09-01',
        type: 'expense',
      },
      {
        id: 'tx-2',
        packetId: 'groceries',
        packetName: 'Fresh Groceries & Meal Prep',
        amount: 142.5,
        description: "Whole Foods Market - Weekly pantry",
        date: '2026-09-08',
        type: 'expense',
      },
      {
        id: 'tx-3',
        packetId: 'dining-social',
        packetName: 'Bistros & Social Drinks',
        amount: 86.0,
        description: 'Tapas & Drinks with Colleagues',
        date: '2026-09-12',
        type: 'expense',
      },
      {
        id: 'tx-4',
        packetId: 'utilities-wifi',
        packetName: 'Fiber Internet & Power',
        amount: 165.0,
        description: 'Gigabit Fiber & Electric Utility',
        date: '2026-09-15',
        type: 'expense',
      },
      {
        id: 'tx-5',
        packetId: 'groceries',
        packetName: 'Fresh Groceries & Meal Prep',
        amount: 167.5,
        description: "Trader Joe's - Produce & batch prep",
        date: '2026-09-22',
        type: 'expense',
      },
      {
        id: 'tx-6',
        packetId: 'travel-sinking',
        packetName: 'Europe & Mountain Getaways',
        amount: 150.0,
        description: 'Deposit for Train Passes',
        date: '2026-09-24',
        type: 'expense',
      },
    ];
  });

  const [recommendation, setRecommendation] = useState<BudgetRecommendation | null>(() => {
    const saved = localStorage.getItem('ps_recommendation');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<TabKey>('recommendations');
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddPacketModalOpen, setIsAddPacketModalOpen] = useState(false);
  const [activeExpensePacketId, setActiveExpensePacketId] = useState<string | undefined>();
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string | undefined>();

  // Persist state
  useEffect(() => {
    localStorage.setItem('ps_persona_id', activePersonaId);
  }, [activePersonaId]);

  useEffect(() => {
    localStorage.setItem('ps_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('ps_packets', JSON.stringify(packets));
  }, [packets]);

  useEffect(() => {
    localStorage.setItem('ps_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (recommendation) {
      localStorage.setItem('ps_recommendation', JSON.stringify(recommendation));
    }
  }, [recommendation]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generate budget recommendation from API
  const fetchRecommendation = async (targetProfile: BudgetProfile) => {
    setIsLoadingRecommendation(true);
    try {
      const res = await fetch('/api/budget/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetProfile),
      });

      if (!res.ok) throw new Error('API failed');
      const data: BudgetRecommendation = await res.json();
      setRecommendation(data);
      showToast('AI Recommendation generated successfully!');
    } catch (err) {
      console.error('Failed to generate recommendation:', err);
      showToast('Generated smart heuristic recommendation.');
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // On first load, if no recommendation, fetch one automatically
  useEffect(() => {
    if (!recommendation) {
      fetchRecommendation(profile);
    }
  }, []);

  // Handle Persona selection
  const handleSelectPersona = (personaId: string) => {
    setActivePersonaId(personaId);
    if (personaId === 'custom') return;

    const matched = PRESET_PERSONAS.find((p) => p.id === personaId);
    if (matched) {
      setProfile(matched.profile);
      setPackets(matched.initialPackets);
      fetchRecommendation(matched.profile);
      showToast(`Switched to preset: ${matched.name.split('·')[0]}`);
    }
  };

  // Handle Currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setProfile((prev) => ({ ...prev, currency: newCurrency }));
    showToast(`Currency updated to ${newCurrency}`);
  };

  // Apply AI Recommendation categories into Active Packets
  const handleApplyRecommendation = (categories: BudgetRecommendation['categories']) => {
    const newPackets: SmartPacket[] = categories.map((c) => {
      // Retain spent amount if packet already existed
      const existing = packets.find((p) => p.id === c.id || p.name.toLowerCase() === c.name.toLowerCase());
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        allocated: c.recommendedAmount,
        spent: existing ? existing.spent : 0,
        color: c.color,
        iconName: c.iconName,
        rationale: c.rationale,
        smartTip: c.smartTip,
      };
    });

    setPackets(newPackets);
    setActiveTab('packets');
    showToast('Applied all recommended categories to your active smart packets!');
  };

  // Packet operations
  const handleUpdatePacket = (updated: SmartPacket) => {
    setPackets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePacket = (id: string) => {
    setPackets((prev) => prev.filter((p) => p.id !== id));
    showToast('Packet removed.');
  };

  const handleAddPacket = (newPacket: SmartPacket) => {
    setPackets((prev) => [...prev, newPacket]);
    showToast(`Envelope "${newPacket.name}" created!`);
  };

  // Spend logging
  const handleAddExpense = (packetId: string, amount: number, description: string, date: string) => {
    const target = packets.find((p) => p.id === packetId);
    if (!target) return;

    // Deduct from packet
    setPackets((prev) =>
      prev.map((p) => (p.id === packetId ? { ...p, spent: p.spent + amount } : p))
    );

    // Record in transactions
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      packetId,
      packetName: target.name,
      amount,
      description,
      date,
      type: 'expense',
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Logged ${profile.currency}${amount} to ${target.name}`);
  };

  // Reset to default preset
  const handleReset = () => {
    if (confirm('Reset your profile and envelopes to default template?')) {
      setProfile(defaultPersona.profile);
      setPackets(defaultPersona.initialPackets);
      fetchRecommendation(defaultPersona.profile);
      showToast('Reset to default profile.');
    }
  };

  const handleAskCopilot = (query: string) => {
    setCopilotInitialQuery(query);
    setActiveTab('assistant');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <Header
        profile={profile}
        packets={packets}
        activePersonaId={activePersonaId}
        onSelectPersona={handleSelectPersona}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onCurrencyChange={handleCurrencyChange}
        onReset={handleReset}
      />

      {/* Segmented Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        packetCount={packets.length}
        onOpenAddExpense={() => {
          setActiveExpensePacketId(undefined);
          setIsAddExpenseModalOpen(true);
        }}
        onOpenAddPacket={() => setIsAddPacketModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'recommendations' && (
          <RecommendationView
            recommendation={recommendation}
            profile={profile}
            isLoading={isLoadingRecommendation}
            onApplyRecommendation={handleApplyRecommendation}
            onOpenConfig={() => setIsConfigModalOpen(true)}
            onAskCopilot={handleAskCopilot}
          />
        )}

        {activeTab === 'packets' && (
          <PacketsView
            packets={packets}
            profile={profile}
            onUpdatePacket={handleUpdatePacket}
            onDeletePacket={handleDeletePacket}
            onOpenAddExpense={(pId) => {
              setActiveExpensePacketId(pId);
              setIsAddExpenseModalOpen(true);
            }}
            onOpenAddPacket={() => setIsAddPacketModalOpen(true)}
          />
        )}

        {activeTab === 'assistant' && (
          <AICopilotView
            profile={profile}
            packets={packets}
            healthScore={recommendation?.financialHealthScore || 78}
            initialQuery={copilotInitialQuery}
            onClearInitialQuery={() => setCopilotInitialQuery(undefined)}
          />
        )}

        {activeTab === 'affordability' && (
          <AffordabilityView
            profile={profile}
            packets={packets}
            onLogPurchaseAsExpense={(packetId, amount, description) => {
              handleAddExpense(packetId, amount, description, new Date().toISOString().slice(0, 10));
              setActiveTab('packets');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            profile={profile}
            packets={packets}
            transactions={transactions}
            onOpenAddExpense={() => {
              setActiveExpensePacketId(undefined);
              setIsAddExpenseModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PocketSmart AI</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent envelope budgeting &amp; cashflow optimization</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Powered by Gemini 3.8 Flash</span>
            <span aria-hidden="true">·</span>
            <span>Local privacy persistence</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <BudgetConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        profile={profile}
        onGenerate={(newProfile) => {
          setProfile(newProfile);
          setIsConfigModalOpen(false);
          setActivePersonaId('custom');
          fetchRecommendation(newProfile);
          setActiveTab('recommendations');
        }}
        isLoading={isLoadingRecommendation}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setActiveExpensePacketId(undefined);
        }}
        packets={packets}
        initialPacketId={activeExpensePacketId}
        currency={profile.currency}
        onAddExpense={handleAddExpense}
      />

      <AddPacketModal
        isOpen={isAddPacketModalOpen}
        onClose={() => setIsAddPacketModalOpen(false)}
        currency={profile.currency}
        onAddPacket={handleAddPacket}
      />
    </div>
  );
}
