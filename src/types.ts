export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  category: "finance" | "psychology" | "security" | "strategy" | "master";
}

export interface BudgetState {
  monthlyIncome: number;
  rent: number;
  groceries: number;
  entertainment: number;
  debtPayment: number;
  otherExpenses: number;
  emergencyFundGoalMonths: number;
  currentEmergencySavings: number;
}

export interface RiskProfileAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  percentage: number;
  type: "crypto" | "stock" | "bond" | "cash" | "gold";
  color: string;
}

export interface SecurityQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DcaState {
  asset: "BTC" | "ETH";
  monthlyAmount: number;
  years: number;
  growthRate: number; // annual expected growth rate %
}

export interface ManifestoState {
  fullName: string;
  primaryGoal: string;
  maxCryptoAllocation: number;
  sellingStrategy: string;
  fomoPromise: string;
}

export interface UserProgress {
  completedSteps: string[]; // step slugs
  budgetCalculated: boolean;
  riskProfileScore: number | null; // 0 to 100
  securityQuizScore: number | null; // number of correct answers
  dcaCalculated: boolean;
  manifestoCreated: boolean;
}

export interface LessonStep {
  slug: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  duration: string;
  category: "finance" | "classic" | "crypto-base" | "crypto-adv" | "manifesto";
}
