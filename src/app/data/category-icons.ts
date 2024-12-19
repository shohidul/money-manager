export interface DefaultCategories {
  name: string;
  icon: string;
  type: 'expense' | 'income' ;
  subType: 'none' | 'loan' | 'asset' | 'fuel';
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
      { name: 'Utilities', icon: 'build' },
      { name: 'Clothing', icon: 'checkroom' },
      { name: 'Gift', icon: 'card_giftcard' },
      { name: 'Travel', icon: 'flight' },
      { name: 'Pets', icon: 'pets' },
      { name: 'Sports', icon: 'sports_soccer' },
      { name: 'Charity', icon: 'volunteer_activism' },
      { name: 'Hobbies', icon: 'palette' },
      { name: 'Other', icon: 'more_horiz' },
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
      { name: 'Loan', icon: 'account_balance_wallet' },
    ],
  },
  {
    name: 'Food',
    icons: [
      { name: 'Restaurant', icon: 'restaurant' },
      { name: 'Cafe', icon: 'local_cafe' },
      { name: 'Grocery', icon: 'shopping_basket' },
      { name: 'Fast Food', icon: 'fastfood' },
      { name: 'Bar', icon: 'local_bar' },
      { name: 'Food Delivery', icon: 'delivery_dining' },
      { name: 'Dining', icon: 'dining' },
      { name: 'Chef', icon: 'restaurant_menu' },
    ],
  },
  {
    name: 'Transportation',
    icons: [
      { name: 'Bus', icon: 'directions_bus' },
      { name: 'Train', icon: 'train' },
      { name: 'Taxi', icon: 'local_taxi' },
      { name: 'Flight', icon: 'flight' },
      { name: 'Subway', icon: 'subway' },
      { name: 'Bike', icon: 'pedal_bike' },
      { name: 'Car Rental', icon: 'car_rental' },
      { name: 'Traffic', icon: 'traffic' },
      { name: 'Navigation', icon: 'navigation' },
    ],
  },
  {
    name: 'Vehicle',
    icons: [
      { name: 'Car', icon: 'directions_car' },
      { name: 'Motorcycle', icon: 'two_wheeler' },
      { name: 'Fuel', icon: 'local_gas_station' },
      { name: 'Maintenance', icon: 'build' },
      { name: 'Parking', icon: 'local_parking' },
      { name: 'Car Wash', icon: 'local_car_wash' },
      { name: 'Truck', icon: 'local_shipping' },
      { name: 'EV Charging', icon: 'ev_station' },
      { name: 'Garage', icon: 'garage' },
    ],
  },
  {
    name: 'Shopping',
    icons: [
      { name: 'Cart', icon: 'shopping_cart' },
      { name: 'Hanger', icon: 'checkroom' },
      { name: 'Gift Card', icon: 'card_giftcard' },
      { name: 'Online Shopping', icon: 'local_shipping' },
      { name: 'Jewelry', icon: 'diamond' },
      { name: 'Beauty', icon: 'spa' },
      { name: 'Discount', icon: 'sell' },
      { name: 'Wallet', icon: 'account_balance_wallet' },
      { name: 'Market', icon: 'storefront' },
    ],
  },
  {
    name: 'Entertainment',
    icons: [
      { name: 'Movies', icon: 'movie' },
      { name: 'Games', icon: 'sports_esports' },
      { name: 'Music', icon: 'headphones' },
      { name: 'Books', icon: 'menu_book' },
      { name: 'Theater', icon: 'theater_comedy' },
      { name: 'Sports Event', icon: 'sports' },
      { name: 'Party', icon: 'celebration' },
      { name: 'Art', icon: 'brush' },
      { name: 'Dance', icon: 'emoji_people' },
    ],
  },
  {
    name: 'Health & Fitness',
    icons: [
      { name: 'Medical', icon: 'medical_services' },
      { name: 'Pharmacy', icon: 'local_pharmacy' },
      { name: 'Gym', icon: 'fitness_center' },
      { name: 'Doctor', icon: 'healing' },
      { name: 'Dental', icon: 'dentistry' },
      { name: 'Yoga', icon: 'self_improvement' },
      { name: 'Diet', icon: 'emoji_food_beverage' },
      { name: 'Mental Health', icon: 'psychology' },
    ],
  },
  {
    name: 'Family',
    icons: [
      { name: 'Children', icon: 'child_care' },
      { name: 'Family Care', icon: 'family_restroom' },
      { name: 'Elder Care', icon: 'elderly' },
      { name: 'Pet Care', icon: 'pets' },
      { name: 'Baby Products', icon: 'baby_changing_station' },
      { name: 'Education', icon: 'school' },
      { name: 'Pregnancy', icon: 'pregnant_woman' },
      { name: 'Playground', icon: 'toys' },
      { name: 'Parenting', icon: 'supervised_user_circle' },
    ],
  },
  {
    name: 'Home',
    icons: [
      { name: 'Furniture', icon: 'chair' },
      { name: 'Appliances', icon: 'kitchen' },
      { name: 'Home Repair', icon: 'home_repair_service' },
      { name: 'Cleaning', icon: 'cleaning_services' },
      { name: 'Garden', icon: 'yard' },
      { name: 'Tools', icon: 'handyman' },
      { name: 'Decor', icon: 'light_group' },
      { name: 'Painting', icon: 'format_paint' },
      { name: 'Lighting', icon: 'lightbulb' },
    ],
  },
  {
    name: 'Electronics',
    icons: [
      { name: 'Gadgets', icon: 'devices' },
      { name: 'Phone', icon: 'smartphone' },
      { name: 'Computer', icon: 'computer' },
      { name: 'Electronics', icon: 'memory' },
      { name: 'TV', icon: 'tv' },
      { name: 'Camera', icon: 'photo_camera' },
      { name: 'Gaming Console', icon: 'videogame_asset' },
      { name: 'Wearables', icon: 'watch' },
      { name: 'Smart Home', icon: 'villa' },
    ],
  },
  {
    name: 'Bills & Utilities',
    icons: [
      { name: 'Electricity', icon: 'electric_bolt' },
      { name: 'Water', icon: 'water_drop' },
      { name: 'Internet', icon: 'wifi' },
      { name: 'Phone Bill', icon: 'phone' },
      { name: 'Gas', icon: 'local_fire_department' },
      { name: 'TV Cable', icon: 'cable' },
      { name: 'Heating', icon: 'thermostat' },
      { name: 'Solar Power', icon: 'solar_power' },
      { name: 'Garbage', icon: 'delete' },
    ],
  },
  {
    name: 'Housing',
    icons: [
      { name: 'Rent', icon: 'house' },
      { name: 'Mortgage', icon: 'apartment' },
      { name: 'Insurance', icon: 'security' },
      { name: 'Property Tax', icon: 'receipt_long' },
      { name: 'Hotel', icon: 'hotel' },
      { name: 'Security', icon: 'shield' },
      { name: 'Key', icon: 'vpn_key' },
      { name: 'Apartment', icon: 'location_city' },
      { name: 'Real Estate', icon: 'home_work' },
    ],
  },
  {
    name: 'Income',
    icons: [
      { name: 'Salary', icon: 'payments' },
      { name: 'Business', icon: 'store' },
      { name: 'Freelance', icon: 'computer' },
      { name: 'Investment', icon: 'trending_up' },
      { name: 'Rental', icon: 'apartment' },
      { name: 'Gift', icon: 'redeem' },
      { name: 'Interest', icon: 'savings' },
      { name: 'Bonus', icon: 'stars' },
      { name: 'Other Income', icon: 'account_balance_wallet' },
      { name: 'Profit', icon: 'attach_money' },
    ],
  },
];

export const defaultCategories: DefaultCategories[] = [
 
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
  { name: 'Utilities', icon: 'build', type: 'expense', subType: 'none' },
  { name: 'Clothing', icon: 'checkroom', type: 'expense', subType: 'none' },
  { name: 'Snacks', icon: 'icecream', type: 'expense', subType: 'none' },
  { name: 'Fruits', icon: 'nutrition', type: 'expense', subType: 'none' },
  { name: 'Car', icon: 'directions_car', type: 'expense', subType: 'none' },
  { name: 'Motorcycle', icon: 'two_wheeler', type: 'expense', subType: 'none' },
  { name: 'Fuel', icon: 'local_gas_station', type: 'expense', subType: 'none' },
  { name: 'Beauty', icon: 'health_and_beauty', type: 'expense', subType: 'none' },
  { name: 'Phone Recharge', icon: 'phone_iphone', type: 'expense', subType: 'none' },
  { name: 'Internet', icon: 'wifi', type: 'expense', subType: 'none' },
  { name: 'Fitness', icon: 'fitness_center', type: 'expense', subType: 'none' },
  { name: 'Travel', icon: 'flight_takeoff', type: 'expense', subType: 'none' },
  { name: 'Baby', icon: 'child_care', type: 'expense', subType: 'none' },
  { name: 'Donation', icon: 'payments', type: 'expense', subType: 'none' },
  { name: 'Insurance', icon: 'verified_user', type: 'expense', subType: 'none' },
  { name: 'Tax', icon: 'description', type: 'expense', subType: 'none' },
  { name: 'Telephone', icon: 'phone_in_talk', type: 'expense', subType: 'none' },
  { name: 'Cigarette', icon: 'smoking_rooms', type: 'expense', subType: 'none' },
  { name: 'Sport', icon: 'sports_and_outdoors', type: 'expense', subType: 'none' },
  { name: 'Pet', icon: 'pets', type: 'expense', subType: 'none' },
  { name: 'Electronics', icon: 'devices_other', type: 'expense', subType: 'none' },
  { name: 'Wine', icon: 'liquor', type: 'expense', subType: 'none' },
  { name: 'Gift', icon: 'featured_seasonal_and_gifts', type: 'expense', subType: 'none' },
  { name: 'Social', icon: 'group', type: 'expense', subType: 'none' },
  { name: 'Book', icon: 'book_5', type: 'expense', subType: 'none' },
  { name: 'Office', icon: 'attach_file', type: 'expense', subType: 'none' },
  { name: 'Furniture', icon: 'king_bed', type: 'expense', subType: 'none' },
  
  // Lending/borrowing categories
  { name: 'Personal Loan Given', icon: 'person', type: 'expense', subType: 'loan' },
  { name: 'Business Loan Given', icon: 'business', type: 'expense', subType: 'loan' },
  { name: 'Loan Repaid to Me', icon: 'account_balance', type: 'income', subType: 'loan' },
  { name: 'Personal Loan Taken', icon: 'person', type: 'income', subType: 'loan' },
  { name: 'Bank Loan Taken', icon: 'account_balance', type: 'income', subType: 'loan' },
  { name: 'Loan Payment', icon: 'person_outline', type: 'expense', subType: 'loan' },
  { name: 'Loan', icon: 'account_balance_wallet', type: 'expense', subType: 'loan' },

  // Asset categories
  { name: 'Purchase Asset', icon: 'apartment', type: 'expense', subType: 'asset' },
  { name: 'Sell Asset', icon: 'apartment', type: 'income', subType: 'asset' },
  
  // Fuel categories
  { name: 'Car Fuel', icon: 'local_gas_station', type: 'expense', subType: 'fuel' },
  { name: 'Motorcycle Fuel', icon: 'two_wheeler', type: 'expense', subType: 'fuel' },
  { name: 'EV Charging', icon: 'ev_station', type: 'expense', subType: 'fuel' },

    // Income categories
  { name: 'Salary', icon: 'payments', type: 'income', subType: 'none' },
  { name: 'Business', icon: 'store', type: 'income', subType: 'none' },
  { name: 'Investment', icon: 'trending_up', type: 'income', subType: 'none' },
  { name: 'Other Income', icon: 'account_balance_wallet', type: 'income', subType: 'none' },
  { name: 'Charity', icon: 'volunteer_activism', type: 'expense', subType: 'none' },
  { name: 'Hobbies', icon: 'palette', type: 'expense', subType: 'none' },
  { name: 'Freelance', icon: 'computer', type: 'income', subType: 'none' },
  { name: 'Rental', icon: 'apartment', type: 'income', subType: 'none' },
  { name: 'Gift', icon: 'redeem', type: 'income', subType: 'none' },
  { name: 'Interest', icon: 'savings', type: 'income', subType: 'none' },
  { name: 'Bonus', icon: 'stars', type: 'income', subType: 'none' }
];
