export type TransactionType = 'income' | 'expense';
export type TransactionSubType = 'none' | 'lend' | 'borrow' | 'asset' | 'fuel';

export interface BaseTransaction {
  id?: number;
  type: TransactionType;
  subType: TransactionSubType;
  amount: number;
  categoryId: number;
  memo: string;
  date: Date;
}

export interface LendBorrowTransaction extends BaseTransaction {
  personName: string;
  dueDate?: Date;
}

export interface AssetTransaction extends BaseTransaction {
  assetName: string;
  purchaseDate: Date;
  currentValue: number;
}

export interface FuelTransaction extends BaseTransaction {
  odometerReading: number;
  fuelQuantity: number;
  fuelType: 'octen' | 'petrol' | 'diesel' | 'electric' | 'other';
}

export type Transaction = BaseTransaction | LendBorrowTransaction | AssetTransaction | FuelTransaction;

export function isLendBorrowTransaction(tx: Transaction): tx is LendBorrowTransaction {
  return tx.subType === 'lend' || tx.subType === 'borrow';
}

export function isLend(tx: Transaction): tx is LendBorrowTransaction {
  return tx.subType === 'lend';
}

export function isBorrow(tx: Transaction): tx is LendBorrowTransaction {
  return tx.subType === 'borrow';
}

export function isAssetTransaction(tx: Transaction): tx is AssetTransaction {
  return tx.subType === 'asset';
}

export function isFuelTransaction(tx: Transaction): tx is FuelTransaction {
  return tx.subType === 'fuel';
}

export const transactionTypeLabels: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense'
};

export const transactionSubTypeLabels: Record<TransactionSubType, string> = {
  none: 'Regular',
  lend: 'Lend',
  borrow: 'Borrow',
  asset: 'Asset',
  fuel: 'Fuel'
};