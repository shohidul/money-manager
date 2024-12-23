export type IncomeCategory = 
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'gifts'
  | 'other_income';

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'other_expense';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: Date;
}

export const categoryIcons: Record<TransactionCategory, string> = {
  salary: 'payments',
  freelance: 'computer',
  investments: 'trending_up',
  gifts: 'card_giftcard',
  other_income: 'attach_money',
  food: 'restaurant',
  transport: 'directions_car',
  utilities: 'home',
  entertainment: 'movie',
  shopping: 'shopping_cart',
  health: 'medical_services',
  other_expense: 'money_off'
};