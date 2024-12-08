export interface DefaultCategories {
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'lend' | 'borrow' | 'asset' | 'fuel';
}

export interface CategoryGroup {
  name: string;
  icons: CategoryIcon[];
}

export interface CategoryIcon {
  name: string;
  icon: string;
}

export const defaultCategories: DefaultCategories[] = [
  // Existing categories
  { name: 'Home', icon: 'home', type: 'expense' },
  { name: 'Family', icon: 'family_restroom', type: 'expense' },
  { name: 'Food', icon: 'fork_spoon', type: 'expense' },
  { name: 'Grocery', icon: 'grocery', type: 'expense' },
  { name: 'Transportation', icon: 'directions_bus', type: 'expense' },
  { name: 'Shopping', icon: 'shopping_bag', type: 'expense' },
  { name: 'Entertainment', icon: 'stadia_controller', type: 'expense' },
  { name: 'Bills', icon: 'bolt', type: 'expense' },
  { name: 'Health', icon: 'health_and_safety', type: 'expense' },
  { name: 'Others', icon: 'category', type: 'expense' },
  { name: 'Salary', icon: 'payments', type: 'income' },
  { name: 'Business', icon: 'store', type: 'income' },
  { name: 'Investment', icon: 'trending_up', type: 'income' },
  { name: 'Other Income', icon: 'account_balance_wallet', type: 'income' },
  
  // New categories for lending/borrowing
  { name: 'Personal Loan', icon: 'person', type: 'lend' },
  { name: 'Business Loan', icon: 'business', type: 'lend' },
  { name: 'Bank Loan', icon: 'account_balance', type: 'borrow' },
  { name: 'Personal Borrowing', icon: 'person_outline', type: 'borrow' },
  
  // Asset categories
  { name: 'Vehicle', icon: 'directions_car', type: 'asset' },
  { name: 'Property', icon: 'apartment', type: 'asset' },
  { name: 'Electronics', icon: 'devices', type: 'asset' },
  { name: 'Investments', icon: 'savings', type: 'asset' },
  
  // Fuel categories
  { name: 'Car Fuel', icon: 'local_gas_station', type: 'fuel' },
  { name: 'Motorcycle Fuel', icon: 'two_wheeler', type: 'fuel' },
  { name: 'EV Charging', icon: 'ev_station', type: 'fuel' }
];