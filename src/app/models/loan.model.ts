export interface LoanTransaction {
  id: number;
  type: 'income' | 'expense';
  subType: 'loan';
  amount: number;
  categoryId: number;
  memo: string;
  date: Date;
  personName: string;
  dueDate?: Date;
  parentId?: number;
}

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