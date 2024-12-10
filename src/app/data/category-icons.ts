export interface DefaultCategories {
  name: string;
  icon: string;
  type: 'income' | 'expense';
  subType: 'none' | 'lend' | 'borrow' | 'asset' | 'fuel';
}

export interface CategoryGroup {
  name: string;
  icons: CategoryIcon[];
}

export interface CategoryIcon {
  name: string;
  icon: string;
}

export const categoryGroups: CategoryGroup[] = [
  {
    name: 'Common',
    icons: [
      { name: 'Home', icon: 'home' },
      { name: 'Food', icon: 'restaurant' },
      { name: 'Transport', icon: 'directions_car' },
      { name: 'Shopping', icon: 'shopping_cart' },
      { name: 'Entertainment', icon: 'movie' },
      { name: 'Health', icon: 'medical_services' },
      { name: 'Education', icon: 'school' },
      { name: 'Work', icon: 'work' },
    ],
  },
  {
    name: 'Finance',
    icons: [
      { name: 'Salary', icon: 'payments' },
      { name: 'Investment', icon: 'trending_up' },
      { name: 'Savings', icon: 'savings' },
      { name: 'Bills', icon: 'receipt' },
      { name: 'Bank', icon: 'account_balance' },
      { name: 'Credit Card', icon: 'credit_card' },
      { name: 'Insurance', icon: 'security' },
      { name: 'Tax', icon: 'description' },
    ],
  },
  {
    name: 'Others',
    icons: [
      { name: 'Gift', icon: 'card_giftcard' },
      { name: 'Travel', icon: 'flight' },
      { name: 'Pets', icon: 'pets' },
      { name: 'Family', icon: 'family_restroom' },
      { name: 'Sports', icon: 'sports_soccer' },
      { name: 'Other', icon: 'more_horiz' },
    ],
  },
];

export const defaultCategories: DefaultCategories[] = [
  // Income categories
  { name: 'Salary', icon: 'payments', type: 'income', subType: 'none' },
  { name: 'Business', icon: 'store', type: 'income', subType: 'none' },
  { name: 'Investment', icon: 'trending_up', type: 'income', subType: 'none' },
  { name: 'Other Income', icon: 'account_balance_wallet', type: 'income', subType: 'none' },
  
  // Expense categories
  { name: 'Home', icon: 'home', type: 'expense', subType: 'none' },
  { name: 'Family', icon: 'family_restroom', type: 'expense', subType: 'none' },
  { name: 'Food', icon: 'restaurant', type: 'expense', subType: 'none' },
  { name: 'Grocery', icon: 'shopping_basket', type: 'expense', subType: 'none' },
  { name: 'Transportation', icon: 'directions_bus', type: 'expense', subType: 'none' },
  { name: 'Shopping', icon: 'shopping_bag', type: 'expense', subType: 'none' },
  { name: 'Entertainment', icon: 'sports_esports', type: 'expense', subType: 'none' },
  { name: 'Bills', icon: 'bolt', type: 'expense', subType: 'none' },
  { name: 'Health', icon: 'health_and_safety', type: 'expense', subType: 'none' },
  { name: 'Others', icon: 'category', type: 'expense', subType: 'none' },
  
  // Lending/borrowing categories
  { name: 'Personal Loan Given', icon: 'person', type: 'expense', subType: 'lend' },
  { name: 'Business Loan Given', icon: 'business', type: 'expense', subType: 'lend' },
  { name: 'Loan Repaid to Me', icon: 'account_balance', type: 'income', subType: 'lend' },
  { name: 'Personal Loan Taken', icon: 'person', type: 'income', subType: 'borrow' },
  { name: 'Bank Loan Taken', icon: 'account_balance', type: 'income', subType: 'borrow' },
  { name: 'Loan Payment', icon: 'person_outline', type: 'expense', subType: 'borrow' },

  // Asset categories
  { name: 'Purchase Asset', icon: 'apartment', type: 'expense', subType: 'asset' },
  { name: 'Sell Asset', icon: 'apartment', type: 'income', subType: 'asset' },
  
  // Fuel categories
  { name: 'Car Fuel', icon: 'local_gas_station', type: 'expense', subType: 'fuel' },
  { name: 'Motorcycle Fuel', icon: 'two_wheeler', type: 'expense', subType: 'fuel' },
  { name: 'EV Charging', icon: 'ev_station', type: 'expense', subType: 'fuel' }
];
