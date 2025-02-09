import { TransactionSubType, TransactionType } from "../models/transaction-types";

export interface DefaultCategories {
  name: string;
  icon: string;
  type: TransactionType;
  subType: TransactionSubType[];
  version?: number;     // Version when category was added
  order?: number;       // Default position in list
}

// Current version of categories
export const CATEGORIES_VERSION = 2;

// If you want to add between order 15 (car) and 16 (carFuel):
// { 
//   name: 'categories.defaults.expense.newCategory',
//   icon: 'new_icon',
//   type: 'expense',
//   subType: ['none'],
//   version: 2,    // New version
//   order: 15.5    // Between 15 and 16
// }

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
    name: 'categories.groups.common',
    icons: [
      { name: 'categories.groups.icons.common.home', icon: 'home' },
      { name: 'categories.groups.icons.common.food', icon: 'restaurant' },
      { name: 'categories.groups.icons.common.transport', icon: 'directions_car' },
      { name: 'categories.groups.icons.common.shopping', icon: 'shopping_cart' },
      { name: 'categories.groups.icons.common.entertainment', icon: 'movie' },
      { name: 'categories.groups.icons.common.health', icon: 'medical_services' },
      { name: 'categories.groups.icons.common.education', icon: 'school' },
      { name: 'categories.groups.icons.common.work', icon: 'work' },
      { name: 'categories.groups.icons.common.maintenance', icon: 'build' },
      { name: 'categories.groups.icons.common.clothing', icon: 'checkroom' },
      { name: 'categories.groups.icons.common.gift', icon: 'card_giftcard' },
      { name: 'categories.groups.icons.common.travel', icon: 'flight' },
      { name: 'categories.groups.icons.common.pets', icon: 'pets' },
      { name: 'categories.groups.icons.common.sports', icon: 'sports_soccer' },
      { name: 'categories.groups.icons.common.charity', icon: 'volunteer_activism' },
      { name: 'categories.groups.icons.common.hobbies', icon: 'palette' },
      { name: 'categories.groups.icons.common.bolt', icon: 'bolt' },
      { name: 'categories.groups.icons.common.category', icon: 'category' },
      { name: 'categories.groups.icons.common.icecream', icon: 'icecream' },
      { name: 'categories.groups.icons.common.nutrition', icon: 'nutrition' },
      { name: 'categories.groups.icons.common.other', icon: 'more_horiz' },
    ],
  },
  {
    name: 'categories.groups.finance',
    icons: [
      { name: 'categories.groups.icons.finance.salary', icon: 'payments' },
      { name: 'categories.groups.icons.finance.investment', icon: 'trending_up' },
      { name: 'categories.groups.icons.finance.savings', icon: 'money_bag' },
      { name: 'categories.groups.icons.finance.gold', icon: 'real_estate_agent' },
      { name: 'categories.groups.icons.finance.bills', icon: 'receipt' },
      { name: 'categories.groups.icons.finance.bank', icon: 'account_balance' },
      { name: 'categories.groups.icons.finance.creditCard', icon: 'credit_card' },
      { name: 'categories.groups.icons.finance.insurance', icon: 'security' },
      { name: 'categories.groups.icons.finance.tax', icon: 'description' },
      { name: 'categories.groups.icons.finance.loan', icon: 'account_balance_wallet' },
    ],
  },
  {
    name: 'categories.groups.food',
    icons: [
      { name: 'categories.groups.icons.food.restaurant', icon: 'restaurant' },
      { name: 'categories.groups.icons.food.cafe', icon: 'local_cafe' },
      { name: 'categories.groups.icons.food.grocery', icon: 'shopping_basket' },
      { name: 'categories.groups.icons.food.fastFood', icon: 'fastfood' },
      { name: 'categories.groups.icons.food.bar', icon: 'local_bar' },
      { name: 'categories.groups.icons.food.foodDelivery', icon: 'delivery_dining' },
      { name: 'categories.groups.icons.food.dining', icon: 'dining' },
      { name: 'categories.groups.icons.food.chef', icon: 'restaurant_menu' },
      { name: 'categories.groups.icons.food.liquor', icon: 'liquor' },
      { name: 'categories.groups.icons.food.smokingRooms', icon: 'smoking_rooms' },
    ],
  },
  {
    name: 'categories.groups.transportation',
    icons: [
      { name: 'categories.groups.icons.transportation.bus', icon: 'directions_bus' },
      { name: 'categories.groups.icons.transportation.train', icon: 'train' },
      { name: 'categories.groups.icons.transportation.taxi', icon: 'local_taxi' },
      { name: 'categories.groups.icons.transportation.flight', icon: 'flight' },
      { name: 'categories.groups.icons.transportation.subway', icon: 'subway' },
      { name: 'categories.groups.icons.transportation.bike', icon: 'pedal_bike' },
      { name: 'categories.groups.icons.transportation.carRental', icon: 'car_rental' },
      { name: 'categories.groups.icons.transportation.traffic', icon: 'traffic' },
      { name: 'categories.groups.icons.transportation.navigation', icon: 'navigation' },
      { name: 'categories.groups.icons.transportation.flightTakeoff', icon: 'flight_takeoff' },
    ],
  },
  {
    name: 'categories.groups.vehicle',
    icons: [
      { name: 'categories.groups.icons.vehicle.car', icon: 'directions_car' },
      { name: 'categories.groups.icons.vehicle.motorcycle', icon: 'two_wheeler' },
      { name: 'categories.groups.icons.vehicle.fuel', icon: 'local_gas_station' },
      { name: 'categories.groups.icons.vehicle.maintenance', icon: 'build' },
      { name: 'categories.groups.icons.vehicle.parking', icon: 'local_parking' },
      { name: 'categories.groups.icons.vehicle.carWash', icon: 'local_car_wash' },
      { name: 'categories.groups.icons.vehicle.truck', icon: 'local_shipping' },
      { name: 'categories.groups.icons.vehicle.evCharging', icon: 'ev_station' },
      { name: 'categories.groups.icons.vehicle.garage', icon: 'garage' },
    ],
  },
  {
    name: 'categories.groups.shopping',
    icons: [
      { name: 'categories.groups.icons.shopping.cart', icon: 'shopping_cart' },
      { name: 'categories.groups.icons.shopping.hanger', icon: 'checkroom' },
      { name: 'categories.groups.icons.shopping.giftCard', icon: 'card_giftcard' },
      { name: 'categories.groups.icons.shopping.onlineShopping', icon: 'local_shipping' },
      { name: 'categories.groups.icons.shopping.jewelry', icon: 'diamond' },
      { name: 'categories.groups.icons.shopping.beauty', icon: 'spa' },
      { name: 'categories.groups.icons.shopping.discount', icon: 'sell' },
      { name: 'categories.groups.icons.shopping.wallet', icon: 'account_balance_wallet' },
      { name: 'categories.groups.icons.shopping.market', icon: 'storefront' },
      { name: 'categories.groups.icons.shopping.shoppingBag', icon: 'shopping_bag' },
      { name: 'categories.groups.icons.shopping.attachFile', icon: 'attach_file' },
    ],
  },
  {
    name: 'categories.groups.entertainment',
    icons: [
      { name: 'categories.groups.icons.entertainment.movies', icon: 'movie' },
      { name: 'categories.groups.icons.entertainment.games', icon: 'sports_esports' },
      { name: 'categories.groups.icons.entertainment.music', icon: 'headphones' },
      { name: 'categories.groups.icons.entertainment.books', icon: 'menu_book' },
      { name: 'categories.groups.icons.entertainment.theater', icon: 'theater_comedy' },
      { name: 'categories.groups.icons.entertainment.sportsEvent', icon: 'sports' },
      { name: 'categories.groups.icons.entertainment.party', icon: 'celebration' },
      { name: 'categories.groups.icons.entertainment.art', icon: 'brush' },
      { name: 'categories.groups.icons.entertainment.dance', icon: 'emoji_people' },
      { name: 'categories.groups.icons.entertainment.sportsAndOutdoors', icon: 'sports_and_outdoors' },
      { name: 'categories.groups.icons.entertainment.featuredSeasonalAndGifts', icon: 'featured_seasonal_and_gifts' },
      { name: 'categories.groups.icons.entertainment.kingBed', icon: 'king_bed' },
    ],
  },
  {
    name: 'categories.groups.healthFitness',
    icons: [
      { name: 'categories.groups.icons.healthFitness.medical', icon: 'medical_services' },
      { name: 'categories.groups.icons.healthFitness.pharmacy', icon: 'local_pharmacy' },
      { name: 'categories.groups.icons.healthFitness.gym', icon: 'fitness_center' },
      { name: 'categories.groups.icons.healthFitness.doctor', icon: 'healing' },
      { name: 'categories.groups.icons.healthFitness.dental', icon: 'dentistry' },
      { name: 'categories.groups.icons.healthFitness.yoga', icon: 'self_improvement' },
      { name: 'categories.groups.icons.healthFitness.diet', icon: 'emoji_food_beverage' },
      { name: 'categories.groups.icons.healthFitness.mentalHealth', icon: 'psychology' },
      { name: 'categories.groups.icons.healthFitness.healthAndSafety', icon: 'health_and_safety' },
      { name: 'categories.groups.icons.healthFitness.healthAndBeauty', icon: 'health_and_beauty' },
    ],
  },
  {
    name: 'categories.groups.family',
    icons: [
      { name: 'categories.groups.icons.family.children', icon: 'child_care' },
      { name: 'categories.groups.icons.family.familyCare', icon: 'family_restroom' },
      { name: 'categories.groups.icons.family.elderCare', icon: 'elderly' },
      { name: 'categories.groups.icons.family.petCare', icon: 'pets' },
      { name: 'categories.groups.icons.family.babyProducts', icon: 'baby_changing_station' },
      { name: 'categories.groups.icons.family.education', icon: 'school' },
      { name: 'categories.groups.icons.family.pregnancy', icon: 'pregnant_woman' },
      { name: 'categories.groups.icons.family.toy', icon: 'toys' },
      { name: 'categories.groups.icons.family.parenting', icon: 'supervised_user_circle' },
      { name: 'categories.groups.icons.family.person', icon: 'person' },
      { name: 'categories.groups.icons.family.group', icon: 'group' },
    ],
  },
  {
    name: 'categories.groups.home',
    icons: [
      { name: 'categories.groups.icons.home.furniture', icon: 'chair' },
      { name: 'categories.groups.icons.home.appliances', icon: 'kitchen' },
      { name: 'categories.groups.icons.home.homeRepair', icon: 'home_repair_service' },
      { name: 'categories.groups.icons.home.cleaning', icon: 'cleaning_services' },
      { name: 'categories.groups.icons.home.garden', icon: 'yard' },
      { name: 'categories.groups.icons.home.tools', icon: 'handyman' },
      { name: 'categories.groups.icons.home.decor', icon: 'light_group' },
      { name: 'categories.groups.icons.home.painting', icon: 'format_paint' },
      { name: 'categories.groups.icons.home.lighting', icon: 'lightbulb' },
    ],
  },
  {
    name: 'categories.groups.electronics',
    icons: [
      { name: 'categories.groups.icons.electronics.gadgets', icon: 'devices' },
      { name: 'categories.groups.icons.electronics.phone', icon: 'smartphone' },
      { name: 'categories.groups.icons.electronics.computer', icon: 'computer' },
      { name: 'categories.groups.icons.electronics.electronics', icon: 'memory' },
      { name: 'categories.groups.icons.electronics.tv', icon: 'tv' },
      { name: 'categories.groups.icons.electronics.camera', icon: 'photo_camera' },
      { name: 'categories.groups.icons.electronics.gamingConsole', icon: 'videogame_asset' },
      { name: 'categories.groups.icons.electronics.wearables', icon: 'watch' },
      { name: 'categories.groups.icons.electronics.smartHome', icon: 'villa' },
      { name: 'categories.groups.icons.electronics.devicesOther', icon: 'devices_other' },
      { name: 'categories.groups.icons.electronics.phoneIphone', icon: 'phone_iphone' },
    ],
  },
  {
    name: 'categories.groups.billsUtilities',
    icons: [
      { name: 'categories.groups.icons.billsUtilities.electricity', icon: 'electric_bolt' },
      { name: 'categories.groups.icons.billsUtilities.water', icon: 'water_drop' },
      { name: 'categories.groups.icons.billsUtilities.internet', icon: 'wifi' },
      { name: 'categories.groups.icons.billsUtilities.phoneBill', icon: 'phone' },
      { name: 'categories.groups.icons.billsUtilities.gas', icon: 'local_fire_department' },
      { name: 'categories.groups.icons.billsUtilities.tvCable', icon: 'cable' },
      { name: 'categories.groups.icons.billsUtilities.heating', icon: 'thermostat' },
      { name: 'categories.groups.icons.billsUtilities.solarPower', icon: 'solar_power' },
      { name: 'categories.groups.icons.billsUtilities.garbage', icon: 'delete' },
    ],
  },
  {
    name: 'categories.groups.housing',
    icons: [
      { name: 'categories.groups.icons.housing.rent', icon: 'house' },
      { name: 'categories.groups.icons.housing.mortgage', icon: 'apartment' },
      { name: 'categories.groups.icons.housing.insurance', icon: 'security' },
      { name: 'categories.groups.icons.housing.propertyTax', icon: 'receipt_long' },
      { name: 'categories.groups.icons.housing.hotel', icon: 'hotel' },
      { name: 'categories.groups.icons.housing.security', icon: 'shield' },
      { name: 'categories.groups.icons.housing.key', icon: 'vpn_key' },
      { name: 'categories.groups.icons.housing.apartment', icon: 'location_city' },
      { name: 'categories.groups.icons.housing.realEstate', icon: 'home_work' },
    ],
  },
  {
    name: 'categories.groups.income',
    icons: [
      { name: 'categories.groups.icons.income.salary', icon: 'payments' },
      { name: 'categories.groups.icons.income.business', icon: 'store' },
      { name: 'categories.groups.icons.income.freelance', icon: 'computer' },
      { name: 'categories.groups.icons.income.rental', icon: 'apartment' },
      { name: 'categories.groups.icons.income.gift', icon: 'redeem' },
      { name: 'categories.groups.icons.income.interest', icon: 'savings' },
      { name: 'categories.groups.icons.income.bonus', icon: 'stars' },
      { name: 'categories.groups.icons.income.otherIncome', icon: 'account_balance_wallet' },
      { name: 'categories.groups.icons.income.profit', icon: 'attach_money' },
    ],
  },
];

export const defaultCategories: DefaultCategories[] = [
  // Expense categories
  { version: 1, order: 1, name: 'categories.defaults.expense.home', icon: 'home', type: 'expense', subType: ['none'] },
  { version: 1, order: 2, name: 'categories.defaults.expense.family', icon: 'family_restroom', type: 'expense', subType: ['none'] },
  { version: 1, order: 3, name: 'categories.defaults.expense.food', icon: 'restaurant', type: 'expense', subType: ['none'] },
  { version: 1, order: 4, name: 'categories.defaults.expense.grocery', icon: 'shopping_basket', type: 'expense', subType: ['none'] },
  { version: 1, order: 5, name: 'categories.defaults.expense.transportation', icon: 'directions_bus', type: 'expense', subType: ['none'] },
  { version: 1, order: 6, name: 'categories.defaults.expense.shopping', icon: 'shopping_bag', type: 'expense', subType: ['none'] },
  { version: 1, order: 7, name: 'categories.defaults.expense.entertainment', icon: 'sports_esports', type: 'expense', subType: ['none'] },
  { version: 1, order: 8, name: 'categories.defaults.expense.bills', icon: 'bolt', type: 'expense', subType: ['none'] },
  { version: 1, order: 9, name: 'categories.defaults.expense.health', icon: 'health_and_safety', type: 'expense', subType: ['none'] },
  { version: 1, order: 10, name: 'categories.defaults.expense.others', icon: 'category', type: 'expense', subType: ['none'] },
  { version: 1, order: 11, name: 'categories.defaults.expense.maintenance', icon: 'build', type: 'expense', subType: ['assetCost'] },
  { version: 1, order: 12, name: 'categories.defaults.expense.clothing', icon: 'checkroom', type: 'expense', subType: ['none'] },
  { version: 1, order: 13, name: 'categories.defaults.expense.snacks', icon: 'icecream', type: 'expense', subType: ['none'] },
  { version: 1, order: 14, name: 'categories.defaults.expense.fruits', icon: 'nutrition', type: 'expense', subType: ['none'] },
  { version: 1, order: 15, name: 'categories.defaults.expense.car', icon: 'directions_car', type: 'expense', subType: ['asset'] },
  { version: 1, order: 16, name: 'categories.defaults.fuel.carFuel', icon: 'directions_car', type: 'expense', subType: ['fuel', 'assetCost'] },
  { version: 1, order: 17, name: 'categories.defaults.expense.motorcycle', icon: 'two_wheeler', type: 'expense', subType: ['asset'] },
  { version: 1, order: 18, name: 'categories.defaults.fuel.motorcycleFuel', icon: 'two_wheeler', type: 'expense', subType: ['fuel', 'assetCost'] },
  { version: 1, order: 19, name: 'categories.defaults.expense.fuel', icon: 'local_gas_station', type: 'expense', subType: ['fuel', 'assetCost'] },
  { version: 1, order: 20, name: 'categories.defaults.fuel.evCharging', icon: 'ev_station', type: 'expense', subType: ['fuel', 'assetCost'] },
  { version: 1, order: 21, name: 'categories.defaults.expense.beauty', icon: 'health_and_beauty', type: 'expense', subType: ['none'] },
  { version: 1, order: 22, name: 'categories.defaults.expense.phoneRecharge', icon: 'phone_iphone', type: 'expense', subType: ['none'] },
  { version: 1, order: 23, name: 'categories.defaults.expense.internet', icon: 'wifi', type: 'expense', subType: ['none'] },
  { version: 1, order: 24, name: 'categories.defaults.expense.fitness', icon: 'fitness_center', type: 'expense', subType: ['none'] },
  { version: 1, order: 25, name: 'categories.defaults.expense.travel', icon: 'flight_takeoff', type: 'expense', subType: ['none'] },
  { version: 1, order: 26, name: 'categories.defaults.expense.baby', icon: 'child_care', type: 'expense', subType: ['none'] },
  { version: 1, order: 27, name: 'categories.defaults.expense.donation', icon: 'payments', type: 'expense', subType: ['none'] },
  { version: 1, order: 28, name: 'categories.defaults.expense.insurance', icon: 'verified_user', type: 'expense', subType: ['none'] },
  { version: 1, order: 29, name: 'categories.defaults.expense.tax', icon: 'description', type: 'expense', subType: ['none'] },
  { version: 2, order: 29.1, name: 'categories.defaults.expense.pf', icon: 'description', type: 'expense', subType: ['none'] },
  { version: 1, order: 30, name: 'categories.defaults.expense.telephone', icon: 'phone_in_talk', type: 'expense', subType: ['none'] },
  { version: 1, order: 31, name: 'categories.defaults.expense.cigarette', icon: 'smoking_rooms', type: 'expense', subType: ['none'] },
  { version: 1, order: 32, name: 'categories.defaults.expense.sport', icon: 'sports_and_outdoors', type: 'expense', subType: ['none'] },
  { version: 1, order: 33, name: 'categories.defaults.expense.pet', icon: 'pets', type: 'expense', subType: ['none'] },
  { version: 1, order: 34, name: 'categories.defaults.expense.electronics', icon: 'devices_other', type: 'expense', subType: ['none'] },
  { version: 1, order: 35, name: 'categories.defaults.expense.wine', icon: 'liquor', type: 'expense', subType: ['none'] },
  { version: 1, order: 36, name: 'categories.defaults.expense.gift', icon: 'featured_seasonal_and_gifts', type: 'expense', subType: ['none'] },
  { version: 1, order: 37, name: 'categories.defaults.expense.social', icon: 'group', type: 'expense', subType: ['none'] },
  { version: 1, order: 38, name: 'categories.defaults.expense.book', icon: 'book_5', type: 'expense', subType: ['none'] },
  { version: 1, order: 39, name: 'categories.defaults.expense.office', icon: 'attach_file', type: 'expense', subType: ['none'] },
  { version: 1, order: 40, name: 'categories.defaults.expense.furniture', icon: 'king_bed', type: 'expense', subType: ['none'] },
  { version: 1, order: 41, name: 'categories.defaults.expense.charity', icon: 'volunteer_activism', type: 'expense', subType: ['none'] },
  { version: 1, order: 42, name: 'categories.defaults.expense.hobbies', icon: 'palette', type: 'expense', subType: ['none'] },
  { version: 1, order: 43, name: 'categories.defaults.loan.personalLoanGiven', icon: 'person', type: 'expense', subType: ['loan'] },
  { version: 1, order: 44, name: 'categories.defaults.loan.loanPayment', icon: 'person_outline', type: 'expense', subType: ['repaid'] },
  { version: 1, order: 45, name: 'categories.defaults.loan.businessLoanGiven', icon: 'business', type: 'expense', subType: ['loan'] },
  { version: 1, order: 46, name: 'categories.defaults.loan.loan', icon: 'account_balance_wallet', type: 'expense', subType: ['loan'] },
  { version: 1, order: 47, name: 'categories.defaults.asset.savings', icon: 'money_bag', type: 'expense', subType: ['savings'] },
  { version: 2, order: 47.1, name: 'categories.defaults.asset.gold', icon: 'real_estate_agent', type: 'expense', subType: ['asset'] },
  { version: 1, order: 48, name: 'categories.defaults.asset.purchaseAsset', icon: 'apartment', type: 'expense', subType: ['asset'] },
  { version: 2, order: 48.1, name: 'categories.defaults.asset.assetCost', icon: 'payments', type: 'expense', subType: ['assetCost'] },
  // Income categories
  { version: 1, order: 49, name: 'categories.defaults.income.salary', icon: 'payments', type: 'income', subType: ['none'] },
  { version: 1, order: 50, name: 'categories.defaults.income.business', icon: 'store', type: 'income', subType: ['none'] },
  { version: 1, order: 51, name: 'categories.defaults.income.investment', icon: 'trending_up', type: 'income', subType: ['none'] },
  { version: 1, order: 52, name: 'categories.defaults.income.otherIncome', icon: 'account_balance_wallet', type: 'income', subType: ['none'] },
  { version: 1, order: 53, name: 'categories.defaults.income.freelance', icon: 'computer', type: 'income', subType: ['none'] },
  { version: 1, order: 54, name: 'categories.defaults.loan.loanRepaidToMe', icon: 'person_outline', type: 'income', subType: ['repaid'] },
  { version: 1, order: 55, name: 'categories.defaults.loan.personalLoanTaken', icon: 'person', type: 'income', subType: ['loan'] },
  { version: 1, order: 56, name: 'categories.defaults.loan.bankLoanTaken', icon: 'account_balance', type: 'income', subType: ['loan'] },
  { version: 1, order: 57, name: 'categories.defaults.asset.sellAsset', icon: 'apartment', type: 'income', subType: ['asset'] },
  { version: 2, order: 57.1, name: 'categories.defaults.asset.assetIncome', icon: 'payments', type: 'income', subType: ['assetIncome'] },
  { version: 1, order: 58, name: 'categories.defaults.income.rental', icon: 'apartment', type: 'income', subType: ['none'] },
  { version: 1, order: 59, name: 'categories.defaults.income.gift', icon: 'redeem', type: 'income', subType: ['none'] },
  { version: 1, order: 60, name: 'categories.defaults.income.interest', icon: 'savings', type: 'income', subType: ['none'] },
  { version: 1, order: 61, name: 'categories.defaults.income.bonus', icon: 'stars', type: 'income', subType: ['none'] }
 ];
