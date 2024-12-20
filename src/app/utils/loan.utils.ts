import { LoanTransaction } from '../models/transaction-types';
import { LoanGroup, LoanStatus } from '../models/loan.model';

export function calculateLoanStatus(transactions: LoanTransaction[]): LoanStatus {
  const totalAmount = transactions[0].amount;
  const paidAmount = transactions
    .slice(1)
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  return {
    totalAmount,
    paidAmount,
    remainingAmount: totalAmount - paidAmount,
    isCompleted: totalAmount <= paidAmount
  };
}

export function groupLoanTransactions(transactions: LoanTransaction[]): LoanGroup[] {
  const groups = new Map<number, LoanTransaction[]>();
  
  // Group by parent transaction
  transactions.forEach(tx => {
    const parentId = tx.parentId || tx.id;
    if (!groups.has(parentId)) {
      groups.set(parentId, []);
    }
    groups.get(parentId)!.push(tx);
  });

  return Array.from(groups.entries()).map(([parentId, txs]) => ({
    parentId,
    personName: txs[0].personName,
    transactions: txs.sort((a, b) => b.date.getTime() - a.date.getTime()),
    status: calculateLoanStatus(txs)
  }));
}