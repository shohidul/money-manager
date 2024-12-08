export type TransactionType = 'income' | 'expense' | 'lend' | 'borrow' | 'asset' | 'fuel';

export interface BaseTransaction {
  id?: number;
  type: TransactionType;
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
  fuelType: 'petrol' | 'diesel' | 'electric' | 'other';
}

export type Transaction = BaseTransaction | LendBorrowTransaction | AssetTransaction | FuelTransaction;

export function isLendBorrowTransaction(tx: Transaction): tx is LendBorrowTransaction {
  return tx.type === 'lend' || tx.type === 'borrow';
}

export function isAssetTransaction(tx: Transaction): tx is AssetTransaction {
  return tx.type === 'asset';
}

export function isFuelTransaction(tx: Transaction): tx is FuelTransaction {
  return tx.type === 'fuel';
}

export const transactionTypeLabels: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  lend: 'Lent',
  borrow: 'Borrowed',
  asset: 'Asset',
  fuel: 'Fuel'
};