export type PacketType = 'need' | 'want' | 'savings' | 'debt';

export interface SmartPacket {
  id: string;
  name: string;
  type: PacketType;
  allocated: number;
  spent: number;
  color: string;
  iconName: string;
  rationale: string;
  smartTip: string;
}

export interface BudgetProfile {
  monthlyIncome: number;
  currency: string;
  payFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  livingCostTier: 'low' | 'moderate' | 'high' | 'very-high';
  dependents: number;
  financialPriority: 'balanced' | 'debt-payoff' | 'aggressive-savings' | 'family-security' | 'lifestyle-freedom';
  existingFixedCosts: number;
  existingDebts: number;
  notes: string;
}

export interface BudgetRecommendation {
  strategyName: string;
  summary: string;
  financialHealthScore: number;
  healthAnalysis: string;
  categories: Array<{
    id: string;
    name: string;
    type: PacketType;
    recommendedAmount: number;
    percentage: number;
    iconName: string;
    color: string;
    rationale: string;
    smartTip: string;
  }>;
  totalAllocated: number;
  unallocatedBuffer: number;
  actionableSteps: string[];
  riskAssessment: string;
  threeMonthEmergencyTarget: number;
}

export interface Transaction {
  id: string;
  packetId: string;
  packetName: string;
  amount: number;
  description: string;
  date: string;
  type: 'expense' | 'income' | 'rollover';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    prompt: string;
  };
}

export interface AffordabilityResult {
  verdict: 'green' | 'yellow' | 'red';
  verdictTitle: string;
  impactSummary: string;
  tradeoffOptions: string[];
  recommendedPacketToDebit: string;
  timeToSaveMonths: number;
}
