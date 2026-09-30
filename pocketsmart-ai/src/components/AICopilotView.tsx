import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { SmartPacket, BudgetProfile, ChatMessage } from '../types/budget';

interface AICopilotViewProps {
  profile: BudgetProfile;
  packets: SmartPacket[];
  healthScore: number;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  profile,
  packets,
  healthScore,
  initialQuery,
  onClearInitialQuery,
}) => {
  const totalSpent = packets.reduce((acc, p) => acc + (p.spent || 0), 0);
  const totalAllocated = packets.reduce((acc, p) => acc + (p.allocated || 0), 0);
  const unallocated = Math.max(0, profile.monthlyIncome - totalAllocated);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I'm **Pocket Copilot**, your real-time financial adviser.\n\nI have loaded your live budget details:\n- **Monthly Net Income:** ${profile.currency}${profile.monthlyIncome.toLocaleString()}\n- **Active Packets:** ${packets.length} envelopes (${profile.currency}${totalAllocated.toLocaleString()} allocated)\n- **Cycle Spend:** ${profile.currency}${totalSpent.toLocaleString()} spent so far\n- **Health Score:** ${healthScore}/100\n\nAsk me anything: how to trim variable spending, simulate changes in rent, prioritize high-rate debts, or analyze if a big purchase fits your plan.`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming initial query from other views
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      handleSend(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            monthlyIncome: profile.monthlyIncome,
            currency: profile.currency,
            packets: packets.map((p) => ({
              name: p.name,
              type: p.type,
              allocated: p.allocated,
              spent: p.spent,
            })),
            totalSpent,
            unallocatedBuffer: unallocated,
            financialHealthScore: healthScore,
            priority: profile.financialPriority,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server error in assistant chat');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `I've analyzed your current envelope balances. You have **${profile.currency}${Math.max(
            0,
            totalAllocated - totalSpent
          ).toLocaleString()}** remaining across your envelopes this cycle. What specific expense would you like to evaluate or adjust?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat history cleared. I'm ready to advise on your **${profile.currency}${profile.monthlyIncome.toLocaleString()}** monthly budget. What's on your mind?`,
        timestamp: 'Just now',
      },
    ]);
  };

  const promptSuggestions = [
    'How do I trim $250 from my Wants this month?',
    'What is the fastest way to build a 3-month emergency fund?',
    'Simulate: What happens if my rent increases by 15%?',
    'Review my grocery spending vs recommended benchmark',
    'How should I divide an unexpected $1,000 windfall?',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Pocket Copilot AI</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                Grounded in your real packets
              </span>
            </h3>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Income: {profile.currency}{profile.monthlyIncome.toLocaleString()}</span>
              <span aria-hidden="true">·</span>
              <span>Spent: {profile.currency}{totalSpent.toLocaleString()}</span>
              <span aria-hidden="true">·</span>
              <span>Health: {healthScore}/100</span>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-slate-700 text-white'
                    : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`group relative rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] ${
                  isUser
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content.split('\n\n').map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:text-white"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Analyzing your packet math...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] text-slate-500 shrink-0 font-medium">Quick Prompts:</span>
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot e.g., 'Can I afford $150 concerts this month?'"
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
