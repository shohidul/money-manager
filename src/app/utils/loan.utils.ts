import { LoanTransaction } from '../models/loan.model';
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
    isCompleted: totalAmount <= paidAmount,
    dueDate: transactions[0].dueDate,
    isOverdue: transactions[0].dueDate ? new Date() > transactions[0].dueDate : false,
    daysUntilDue: transactions[0].dueDate ? 
      Math.ceil((transactions[0].dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
      undefined
  };
}

export function groupLoanTransactions(transactions: LoanTransaction[]): LoanGroup[] {
  const groups = new Map<number | undefined, LoanTransaction[]>();
  const parentTransactions = new Set<number>();
  
  // First pass: identify parent transactions and create their groups
  transactions.forEach(tx => {
    if (!tx.parentId) {
      parentTransactions.add(tx.id!);
      groups.set(tx.id, [tx]);
    }
  });

  // Second pass: group child transactions with their parents
  transactions.forEach(tx => {
    if (tx.parentId && parentTransactions.has(tx.parentId)) {
      groups.get(tx.parentId)!.push(tx);
    }
  });

  // Create loan groups
  return Array.from(groups.entries())
    .map(([parentId, txs]) => ({
      parentId,
      personName: txs[0].personName,
      transactions: txs.sort((a, b) => b.date.getTime() - a.date.getTime()),
      status: calculateLoanStatus(txs)
    }));
}