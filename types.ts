
export enum TransactionCategory {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  UTILITIES = 'Utilities',
  INCOME = 'Income',
  HEALTH = 'Health',
  HOUSING = 'Housing',
  BANKING = 'Banking & Finance',
  INVESTMENT = 'Investment',
  OTHER = 'Other'
}

export type AuditStatus = 'pending' | 'verified' | 'flagged';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: TransactionCategory | string;
  description: string;
  type: 'expense' | 'income';
  auditStatus?: AuditStatus;
}

export interface Budget {
  id: string;
  category: TransactionCategory | string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface FinancialAnalysis {
  healthScore: number;
  summary: string;
  recommendations: string[];
  savingsPotential: number;
}
