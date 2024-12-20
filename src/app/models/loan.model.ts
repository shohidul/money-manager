export type LoanTransaction = [];

export interface LoanStatus {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isCompleted: boolean;
}

export interface LoanGroup {
  parentId: number;
  personName: string;
  transactions: LoanTransaction[];
  status: LoanStatus;
}