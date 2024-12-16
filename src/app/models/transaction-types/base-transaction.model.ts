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