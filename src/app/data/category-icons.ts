export interface CategoryGroup {
  name: string;
  icons: CategoryIcon[];
}

export interface CategoryIcon {
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export const categoryGroups: CategoryGroup[] = [
  {
    name: 'Food & Dining',
    icons: [
      { name: 'Restaurant', icon: 'restaurant', type: 'expense' },
      { name: 'Cafe', icon: 'local_cafe', type: 'expense' },
      { name: 'Grocery', icon: 'shopping_basket', type: 'expense' },
      { name: 'Fast Food', icon: 'fastfood', type: 'expense' }
    ]
  },
  {
    name: 'Transportation',
    icons: [
      { name: 'Bus', icon: 'directions_bus', type: 'expense' },
      { name: 'Train', icon: 'train', type: 'expense' },
      { name: 'Taxi', icon: 'local_taxi', type: 'expense' },
      { name: 'Flight', icon: 'flight', type: 'expense' }
    ]
  },
  {
    name: 'Vehicle',
    icons: [
      { name: 'Car', icon: 'directions_car', type: 'expense' },
      { name: 'Motorcycle', icon: 'two_wheeler', type: 'expense' },
      { name: 'Fuel', icon: 'local_gas_station', type: 'expense' },
      { name: 'Maintenance', icon: 'build', type: 'expense' }
    ]
  },
  {
    name: 'Shopping',
    icons: [
      { name: 'Mall', icon: 'shopping_cart', type: 'expense' },
      { name: 'Clothes', icon: 'checkroom', type: 'expense' },
      { name: 'Gifts', icon: 'card_giftcard', type: 'expense' },
      { name: 'Online Shopping', icon: 'local_shipping', type: 'expense' }
    ]
  },
  {
    name: 'Entertainment',
    icons: [
      { name: 'Movies', icon: 'movie', type: 'expense' },
      { name: 'Games', icon: 'sports_esports', type: 'expense' },
      { name: 'Music', icon: 'headphones', type: 'expense' },
      { name: 'Books', icon: 'menu_book', type: 'expense' }
    ]
  },
  {
    name: 'Health & Fitness',
    icons: [
      { name: 'Medical', icon: 'medical_services', type: 'expense' },
      { name: 'Pharmacy', icon: 'local_pharmacy', type: 'expense' },
      { name: 'Gym', icon: 'fitness_center', type: 'expense' },
      { name: 'Sports', icon: 'sports', type: 'expense' }
    ]
  },
  {
    name: 'Family',
    icons: [
      { name: 'Children', icon: 'child_care', type: 'expense' },
      { name: 'Family Care', icon: 'family_restroom', type: 'expense' },
      { name: 'Elder Care', icon: 'elderly', type: 'expense' },
      { name: 'Pet Care', icon: 'pets', type: 'expense' }
    ]
  },
  {
    name: 'Home',
    icons: [
      { name: 'Furniture', icon: 'chair', type: 'expense' },
      { name: 'Appliances', icon: 'kitchen', type: 'expense' },
      { name: 'Home Repair', icon: 'home_repair_service', type: 'expense' },
      { name: 'Cleaning', icon: 'cleaning_services', type: 'expense' }
    ]
  },
  {
    name: 'Electronics',
    icons: [
      { name: 'Gadgets', icon: 'devices', type: 'expense' },
      { name: 'Phone', icon: 'smartphone', type: 'expense' },
      { name: 'Computer', icon: 'computer', type: 'expense' },
      { name: 'Electronics', icon: 'memory', type: 'expense' }
    ]
  },
  {
    name: 'Education',
    icons: [
      { name: 'School', icon: 'school', type: 'expense' },
      { name: 'Tuition', icon: 'cast_for_education', type: 'expense' },
      { name: 'Books', icon: 'auto_stories', type: 'expense' },
      { name: 'Supplies', icon: 'edit', type: 'expense' }
    ]
  },
  {
    name: 'Daily Life',
    icons: [
      { name: 'Utilities', icon: 'power', type: 'expense' },
      { name: 'Internet', icon: 'wifi', type: 'expense' },
      { name: 'Phone Bill', icon: 'phone', type: 'expense' },
      { name: 'Rent', icon: 'house', type: 'expense' }
    ]
  },
  {
    name: 'Income',
    icons: [
      { name: 'Salary', icon: 'payments', type: 'income' },
      { name: 'Business', icon: 'store', type: 'income' },
      { name: 'Freelance', icon: 'computer', type: 'income' },
      { name: 'Investment', icon: 'trending_up', type: 'income' },
      { name: 'Rental', icon: 'apartment', type: 'income' },
      { name: 'Gift', icon: 'redeem', type: 'income' },
      { name: 'Other Income', icon: 'account_balance_wallet', type: 'income' }
    ]
  }
];