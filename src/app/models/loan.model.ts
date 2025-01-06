import { LoanTransactionBase } from './transaction-types';

export type LoanTransaction = LoanTransactionBase;

export interface LoanStatus {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isCompleted: boolean;
  dueDate?: Date;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface LoanGroup {
  parentId?: number;
  personName: string;
  parent: LoanTransaction;
  transactions: LoanTransaction[];
  status: LoanStatus;
}