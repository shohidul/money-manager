export type TransactionType = 'income' | 'expense';
export type TransactionSubType = 'none' | 'loan' | 'repaid' | 'loanCost' | 'asset' | 'assetCost' | 'assetIncome' | 'fuel';

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
  loanCharges: number;
  loanDate: Date;
  dueDate?: Date;
  parentId?: number;
  status?: 'remaining' | 'partial' | 'completed';
}

export interface AssetTransaction extends BaseTransaction {
  assetName: string;
  transactionDate: Date;  // Date of purchase or sale
  quantity: number;
  measurementUnit: string;
  currentValue: number;
  parentId?: number;
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

export function isAssetCostTransaction(tx: Transaction): tx is AssetTransaction {
  return tx.subType === 'assetCost';
}

export function isAssetIncomeTransaction(tx: Transaction): tx is AssetTransaction {
  return tx.subType === 'assetIncome';
}

export function isFuelTransaction(tx: Transaction): tx is FuelTransaction {
  return tx.subType === 'fuel';
}