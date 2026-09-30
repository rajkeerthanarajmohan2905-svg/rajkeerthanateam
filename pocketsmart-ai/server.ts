import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic fallback for budget recommendations
function generateFallbackBudget(params: {
  monthlyIncome: number;
  currency: string;
  livingCostTier?: string;
  dependents?: number;
  financialPriority?: string;
  existingFixedCosts?: number;
  existingDebts?: number;
}) {
  const income = params.monthlyIncome || 4000;
  const currency = params.currency || '$';
  const tier = params.livingCostTier || 'moderate';
  const dependents = params.dependents || 0;
  const priority = params.financialPriority || 'balanced';

  // Ratios adjusted based on priority and tier
  let needsRatio = 0.5;
  let wantsRatio = 0.3;
  let savingsRatio = 0.2;

  if (tier === 'high' || tier === 'very-high') {
    needsRatio += 0.08;
    wantsRatio -= 0.05;
    savingsRatio -= 0.03;
  }
  if (dependents > 0) {
    needsRatio += Math.min(0.08, dependents * 0.04);
    wantsRatio -= Math.min(0.06, dependents * 0.03);
  }

  if (priority === 'debt-payoff') {
    savingsRatio += 0.08;
    wantsRatio -= 0.08;
  } else if (priority === 'aggressive-savings') {
    savingsRatio += 0.12;
    wantsRatio -= 0.12;
  } else if (priority === 'lifestyle-freedom') {
    wantsRatio += 0.08;
    savingsRatio -= 0.08;
  }

  // Normalize
  const totalR = needsRatio + wantsRatio + savingsRatio;
  needsRatio = needsRatio / totalR;
  wantsRatio = wantsRatio / totalR;
  savingsRatio = savingsRatio / totalR;

  const needsAmount = Math.round(income * needsRatio);
  const wantsAmount = Math.round(income * wantsRatio);
  const savingsAmount = Math.round(income * savingsRatio);

  const categories = [
    {
      id: 'housing',
      name: 'Housing & Rent',
      type: 'need' as const,
      recommendedAmount: Math.round(needsAmount * 0.58),
      percentage: Math.round(needsRatio * 0.58 * 100),
      iconName: 'Home',
      color: '#3B82F6',
      rationale: 'Core foundation: mortgage/rent should stay within 28-32% of gross income.',
      smartTip: 'Review lease renewal rates or shop tenant insurance annually.',
    },
    {
      id: 'utilities',
      name: 'Utilities & Bills',
      type: 'need' as const,
      recommendedAmount: Math.round(needsAmount * 0.15),
      percentage: Math.round(needsRatio * 0.15 * 100),
      iconName: 'Zap',
      color: '#0EA5E9',
      rationale: 'Electric, water, heating, and home internet.',
      smartTip: 'Use smart thermostats or off-peak utility hours to trim 10-15%.',
    },
    {
      id: 'groceries',
      name: 'Groceries & Household',
      type: 'need' as const,
      recommendedAmount: Math.round(needsAmount * 0.27),
      percentage: Math.round(needsRatio * 0.27 * 100),
      iconName: 'ShoppingBag',
      color: '#10B981',
      rationale: `Nutritious pantry staples & household hygiene for ${dependents > 0 ? 1 + dependents : '1'} person(s).`,
      smartTip: 'Meal prep 2 batch dinners a week to protect against takeout drift.',
    },
    {
      id: 'dining-social',
      name: 'Dining Out & Social',
      type: 'want' as const,
      recommendedAmount: Math.round(wantsAmount * 0.45),
      percentage: Math.round(wantsRatio * 0.45 * 100),
      iconName: 'Utensils',
      color: '#F59E0B',
      rationale: 'Restaurants, social drinks, coffee with colleagues, and weekend treats.',
      smartTip: 'Designate two "zero dining out" weeknights to keep this packet plentiful for weekends.',
    },
    {
      id: 'entertainment-leisure',
      name: 'Leisure & Subscriptions',
      type: 'want' as const,
      recommendedAmount: Math.round(wantsAmount * 0.35),
      percentage: Math.round(wantsRatio * 0.35 * 100),
      iconName: 'Film',
      color: '#EC4899',
      rationale: 'Streaming services, cinema, fitness memberships, and weekend activities.',
      smartTip: 'Audit recurring subscriptions every 60 days to cancel unused services.',
    },
    {
      id: 'personal-shopping',
      name: 'Personal & Fun',
      type: 'want' as const,
      recommendedAmount: Math.round(wantsAmount * 0.2),
      percentage: Math.round(wantsRatio * 0.2 * 100),
      iconName: 'Sparkles',
      color: '#8B5CF6',
      rationale: 'Apparel, tech accessories, hobby supplies, and personal care.',
      smartTip: 'Implement a 48-hour cool-down rule for unbudgeted purchases over $75.',
    },
    {
      id: 'emergency-fund',
      name: 'Emergency Buffer',
      type: 'savings' as const,
      recommendedAmount: Math.round(savingsAmount * 0.5),
      percentage: Math.round(savingsRatio * 0.5 * 100),
      iconName: 'ShieldCheck',
      color: '#059669',
      rationale: 'High-yield cash cushion protecting against unplanned repairs or income shock.',
      smartTip: 'Automate a split direct deposit on payday before checking your balance.',
    },
    {
      id: 'investments-goals',
      name: 'Future & Investments',
      type: 'savings' as const,
      recommendedAmount: Math.round(savingsAmount * 0.5),
      percentage: Math.round(savingsRatio * 0.5 * 100),
      iconName: 'TrendingUp',
      color: '#14B8A6',
      rationale: 'Index funds, retirement matching, or target goals (down payment/travel).',
      smartTip: 'Capture any company 401(k)/superannuation match first before taxable brokerage.',
    },
  ];

  const totalAllocated = categories.reduce((sum, c) => sum + c.recommendedAmount, 0);
  const unallocatedBuffer = Math.max(0, income - totalAllocated);

  return {
    strategyName:
      priority === 'debt-payoff'
        ? 'Debt Accelerator Packet Allocation'
        : priority === 'aggressive-savings'
        ? 'High-Velocity Wealth Accumulation'
        : 'Smart Balanced Envelope Plan',
    summary: `Tailored for a monthly net income of ${currency}${income.toLocaleString()} in a ${tier} cost area. Allocates ${Math.round(
      needsRatio * 100
    )}% to Essentials, ${Math.round(wantsRatio * 100)}% to Discretionary, and ${Math.round(
      savingsRatio * 100
    )}% to Wealth & Security.`,
    financialHealthScore: priority === 'aggressive-savings' ? 84 : 76,
    healthAnalysis: `Healthy baseline. Your fixed commitments (${currency}${needsAmount.toLocaleString()}) leave a resilient ${currency}${(
      wantsAmount + savingsAmount
    ).toLocaleString()} flexibility cushion every single month.`,
    categories,
    totalAllocated,
    unallocatedBuffer,
    actionableSteps: [
      'Automate your Emergency & Future transfers immediately on payday morning.',
      'Cap dining & leisure via a dedicated debit/prepaid pocket card to prevent spillover.',
      'Check your grocery packet weekly so you catch overspending mid-month rather than at month-end.',
    ],
    riskAssessment:
      tier === 'high' || tier === 'very-high'
        ? 'High housing overhead requires vigilant discretion on eating out.'
        : 'Solid margin of safety. Potential to bump investment rate by 2% next quarter.',
    threeMonthEmergencyTarget: Math.round(needsAmount * 3),
  };
}

// 1. Budget Recommendation Endpoint
app.post('/api/budget/recommend', async (req, res) => {
  try {
    const {
      monthlyIncome,
      currency = '$',
      payFrequency = 'monthly',
      livingCostTier = 'moderate',
      dependents = 0,
      financialPriority = 'balanced',
      existingFixedCosts = 0,
      existingDebts = 0,
      notes = '',
    } = req.body;

    const income = Number(monthlyIncome) || 4000;

    if (!ai) {
      const fallback = generateFallbackBudget({
        monthlyIncome: income,
        currency,
        livingCostTier,
        dependents: Number(dependents),
        financialPriority,
        existingFixedCosts: Number(existingFixedCosts),
        existingDebts: Number(existingDebts),
      });
      return res.json(fallback);
    }

    const prompt = `You are a certified financial planning AI. The user is configuring their monthly budget in "PocketSmart AI".
User Profile:
- Monthly Net Income: ${currency}${income}
- Paycheck Frequency: ${payFrequency}
- Cost of Living Tier: ${livingCostTier}
- Dependents: ${dependents}
- Core Priority: ${financialPriority} (Options: balanced, debt-payoff, aggressive-savings, family-security, lifestyle-freedom)
- Existing Monthly Fixed Commitments (Rent/Loans): ${currency}${existingFixedCosts || 'Not specified'}
- Existing Debts: ${currency}${existingDebts || 'None'}
- Special User Notes: ${notes || 'None'}

Generate a personalized, mathematically rigorous, envelope-based budget recommendation.
Ensure total recommended amounts across all categories sum up very close to or slightly under ${income}, leaving an optional small unallocated buffer.
Categories must include a clean mix of:
- Needs (e.g. Housing, Utilities, Groceries, Transportation, Healthcare/Insurance)
- Wants (e.g. Dining & Social, Entertainment & Subscriptions, Personal Shopping & Hobbies)
- Savings / Debt (e.g. Emergency Cash Buffer, Debt Paydown, Future Wealth / Investing)

Output JSON strictly adhering to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategyName: { type: Type.STRING },
            summary: { type: Type.STRING },
            financialHealthScore: { type: Type.NUMBER, description: 'Score from 1 to 100' },
            healthAnalysis: { type: Type.STRING },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "Must be 'need', 'want', or 'savings'",
                  },
                  recommendedAmount: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER },
                  iconName: {
                    type: Type.STRING,
                    description: "Lucide icon name: 'Home', 'Zap', 'ShoppingBag', 'Car', 'HeartPulse', 'Utensils', 'Film', 'Sparkles', 'ShieldCheck', 'TrendingUp', 'CreditCard'",
                  },
                  color: { type: Type.STRING, description: 'Hex color string' },
                  rationale: { type: Type.STRING },
                  smartTip: { type: Type.STRING },
                },
                required: ['id', 'name', 'type', 'recommendedAmount', 'percentage', 'iconName', 'color', 'rationale', 'smartTip'],
              },
            },
            totalAllocated: { type: Type.NUMBER },
            unallocatedBuffer: { type: Type.NUMBER },
            actionableSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            riskAssessment: { type: Type.STRING },
            threeMonthEmergencyTarget: { type: Type.NUMBER },
          },
          required: [
            'strategyName',
            'summary',
            'financialHealthScore',
            'healthAnalysis',
            'categories',
            'totalAllocated',
            'unallocatedBuffer',
            'actionableSteps',
            'riskAssessment',
            'threeMonthEmergencyTarget',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI budget recommendation:', error);
    const fallback = generateFallbackBudget({
      monthlyIncome: req.body.monthlyIncome || 4000,
      currency: req.body.currency || '$',
      livingCostTier: req.body.livingCostTier,
      dependents: req.body.dependents,
      financialPriority: req.body.financialPriority,
    });
    return res.json(fallback);
  }
});

// 2. Interactive AI Financial Assistant ("Pocket Copilot")
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    if (!ai) {
      return res.json({
        reply: `**Pocket Copilot Insight:**\n\nBased on your active budget of **${context?.currency || '$'}${context?.monthlyIncome?.toLocaleString() || '4,000'}/month**:\n- Your essentials represent a solid baseline.\n- Current total spent across all smart packets: **${context?.currency || '$'}${context?.totalSpent?.toLocaleString() || '0'}**.\n\n*Quick tip:* Review your discretionary dining & entertainment packets before the weekend to prevent inadvertent envelope overspill.`,
      });
    }

    const systemInstruction = `You are "Pocket Copilot", an elite, pragmatic AI personal financial assistant built into PocketSmart AI.
You help the user understand their budget allocations, optimize their smart packets (spending envelopes), answer "Can I afford this?" inquiries, and provide debt/savings tactics.
Always:
- Be clear, practical, encouraging, and mathematically accurate.
- Reference their actual numbers from context:
  * Monthly Income: ${context?.currency || '$'}${context?.monthlyIncome || 0}
  * Active Smart Packets: ${JSON.stringify(context?.packets || [])}
  * Total Spent so far: ${context?.currency || '$'}${context?.totalSpent || 0}
  * Health Score: ${context?.financialHealthScore || 75}/100
  * Financial Priority: ${context?.priority || 'Balanced'}
- Use clean Markdown with bullet points, bold key figures, and concise takeaways.
- Avoid robotic fluff or generic disclaimers. Give direct, actionable numbers and clear tradeoffs.`;

    // Format chat history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I analyzed your budget. Let me know if you would like specific category breakdowns or savings projections.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in assistant chat:', error);
    return res.json({
      reply: "I've reviewed your active packets. To keep your financial health score strong, aim to keep your variable dining and leisure spending within their allocated targets this week.",
    });
  }
});

// 3. Purchase Evaluator ("Can I Afford This?")
app.post('/api/affordability/evaluate', async (req, res) => {
  try {
    const { purchaseName, cost, purchaseType = 'one-time', financingMonths = 12, context } = req.body;
    const numCost = Number(cost) || 0;
    const currency = context?.currency || '$';

    if (!ai) {
      const isAffordable = numCost < (context?.unallocatedBuffer || 300) * 2;
      return res.json({
        verdict: isAffordable ? 'green' : 'yellow',
        verdictTitle: isAffordable ? 'Feasible within Discretionary Cushion' : 'Requires Reallocation or Waiting',
        impactSummary: `Purchasing "${purchaseName}" for ${currency}${numCost.toLocaleString()} represents ${Math.round((numCost / (context?.monthlyIncome || 4000)) * 100)}% of your monthly income.`,
        tradeoffOptions: [
          `Deduct from Personal & Fun packet over 2 billing cycles.`,
          `Postpone for 3 weeks and allocate any unspent dining funds toward it.`,
        ],
        recommendedPacketToDebit: 'Personal & Fun',
        timeToSaveMonths: Math.max(1, Math.ceil(numCost / Math.max(150, (context?.unallocatedBuffer || 200)))),
      });
    }

    const prompt = `You are the "Can I Afford This?" financial evaluator in PocketSmart AI.
Evaluate whether the user can safely afford this purchase without compromising their financial health.

Purchase Details:
- Item: ${purchaseName}
- Cost: ${currency}${numCost}
- Type: ${purchaseType} ${purchaseType === 'monthly_financing' ? `(${financingMonths} months)` : ''}

User Context:
- Monthly Income: ${currency}${context?.monthlyIncome || 4000}
- Current Unallocated Buffer: ${currency}${context?.unallocatedBuffer || 250}
- Smart Packets: ${JSON.stringify(context?.packets || [])}
- Health Score: ${context?.financialHealthScore || 75}

Return structured JSON.
Verdict must be 'green' (completely safe/affordable), 'yellow' (manageable with specific spending cuts/tradeoffs), or 'red' (danger: harms emergency buffer or creates high debt).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "'green' | 'yellow' | 'red'" },
            verdictTitle: { type: Type.STRING },
            impactSummary: { type: Type.STRING },
            tradeoffOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedPacketToDebit: { type: Type.STRING },
            timeToSaveMonths: { type: Type.NUMBER },
          },
          required: [
            'verdict',
            'verdictTitle',
            'impactSummary',
            'tradeoffOptions',
            'recommendedPacketToDebit',
            'timeToSaveMonths',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating affordability:', error);
    return res.json({
      verdict: 'yellow',
      verdictTitle: 'Proceed with Caution',
      impactSummary: `Review your discretionary envelopes before committing.`,
      tradeoffOptions: ['Save over 2 months in a dedicated sinking packet', 'Cut non-essential takeout this week'],
      recommendedPacketToDebit: 'Personal & Fun',
      timeToSaveMonths: 2,
    });
  }
});

// Vite middleware in dev or static serving in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PocketSmart AI server listening on http://0.0.0.0:${PORT}`);
});
