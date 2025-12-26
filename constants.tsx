
import { Transaction, TransactionCategory } from './types';

const now = new Date();
const getDate = (daysAgo: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 5500, date: getDate(2), category: TransactionCategory.FOOD, description: 'Groceries - BigBasket', type: 'expense' },
  { id: '2', amount: 85000, date: getDate(25), category: TransactionCategory.INCOME, description: 'Monthly Salary Credit', type: 'income' },
  { id: '3', amount: 450, date: getDate(5), category: TransactionCategory.TRANSPORT, description: 'Uber Auto Ride', type: 'expense' },
  { id: '4', amount: 2500, date: getDate(10), category: TransactionCategory.UTILITIES, description: 'Electricity Bill - BESCOM', type: 'expense' },
  { id: '5', amount: 15000, date: getDate(15), category: TransactionCategory.HOUSING, description: 'Monthly House Rent', type: 'expense' },
  { id: '6', amount: 2000, date: getDate(1), category: TransactionCategory.ENTERTAINMENT, description: 'PVR Movie Tickets', type: 'expense' },
  { id: '7', amount: 1200, date: getDate(0), category: TransactionCategory.FOOD, description: 'Zomato Order', type: 'expense' },
];

export const APP_NAME = "FinVue AI India";
