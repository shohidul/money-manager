export type TransactionType = 'income' | 'expense';
export type TransactionSubType = 'none' | 'loan' | 'repaid' | 'asset' | 'fuel';

export interface BaseTransaction {
  id?: number;
  type: TransactionType;
  subType: TransactionSubType;
  amount: number;
  categoryId: number;
  memo: string;
  date: Date;
}

export interface LoanTransactionBase extends BaseTransaction {
  subType: 'loan';
  personName: string;
  loanDate: Date;
  dueDate?: Date;
  parentId?: number;
  status?: 'pending' | 'partial' | 'completed';
}

export interface AssetTransaction extends BaseTransaction {
  assetName: string;
  transactionDate: Date;  // Date of purchase or sale
  quantity: number;
  measurementUnit: string;
}

export interface FuelTransaction extends BaseTransaction {
  odometerReading: number;
  fuelQuantity: number;
  fuelType: 'octen' | 'petrol' | 'diesel' | 'electric' | 'other';
}

export type Transaction = BaseTransaction | LoanTransactionBase | AssetTransaction | FuelTransaction;

export function isLoanTransaction(tx: Transaction): tx is LoanTransactionBase {
  return tx.subType === 'loan';
}

export function isRepaidTransaction(tx: Transaction): tx is LoanTransactionBase {
  return tx.subType === 'repaid';
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
  none: 'None',
  loan: 'Loan',
  repaid: 'Repaid',
  asset: 'Asset',
  fuel: 'Fuel'
};