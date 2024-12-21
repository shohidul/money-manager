export type TransactionType = 'income' | 'expense';
export type TransactionSubType = 'none' | 'loan' | 'asset' | 'fuel';

export interface BaseTransaction {
  id?: number;
  type: TransactionType;
  subType: TransactionSubType;
  amount: number;
  categoryId: number;
  memo: string;
  date: Date;
}

export interface LoanTransaction extends BaseTransaction {
  personName: string;
  loanDate: Date;
  dueDate?: Date;
}

export interface AssetTransaction extends BaseTransaction {
  assetName: string;
  transactionDate: Date;  // Date of purchase or sale
  currentValue: number;
}

export interface FuelTransaction extends BaseTransaction {
  odometerReading: number;
  fuelQuantity: number;
  fuelType: 'octen' | 'petrol' | 'diesel' | 'electric' | 'other';
}

export type Transaction = BaseTransaction | LoanTransaction | AssetTransaction | FuelTransaction;

export function isLoanTransaction(tx: Transaction): tx is LoanTransaction {
  return tx.subType === 'loan';
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
  loan: 'Loan',
  asset: 'Asset',
  fuel: 'Fuel'
};