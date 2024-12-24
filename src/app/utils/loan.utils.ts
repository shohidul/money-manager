import { LoanTransaction } from '../models/loan.model';
import { LoanGroup, LoanStatus } from '../models/loan.model';
import { isLoanTransaction, isRepaidTransaction } from '../models/transaction-types';

export function calculateLoanStatus(transactions: LoanTransaction[]): LoanStatus {
  // Find the parent transaction (loan type)
  const parentTx = transactions.find(isLoanTransaction);
  
  // If no parent transaction found, return default status
  if (!parentTx) {
    return {
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      isCompleted: true,
      dueDate: undefined,
      isOverdue: false,
      daysUntilDue: undefined
    };
  }
  
  // Calculate paid amount from repaid transactions
  const paidAmount = transactions
    .filter(isRepaidTransaction)
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  return {
    totalAmount: parentTx.amount,
    paidAmount,
    remainingAmount: parentTx.amount - paidAmount,
    isCompleted: parentTx.amount <= paidAmount,
    dueDate: parentTx.dueDate instanceof Date ? parentTx.dueDate : new Date(parentTx.dueDate || Date.now()),
    isOverdue: parentTx.dueDate ? new Date() > (parentTx.dueDate instanceof Date ? parentTx.dueDate : new Date(parentTx.dueDate)) : false,
    daysUntilDue: parentTx.dueDate ? 
      Math.ceil(
        ((parentTx.dueDate instanceof Date ? parentTx.dueDate : new Date(parentTx.dueDate)).getTime() - new Date().getTime()) 
        / (1000 * 60 * 60 * 24)
      ) : 
      undefined
  };
}

export function groupLoanTransactions(transactions: LoanTransaction[]): LoanGroup[] {
  const groups = new Map<number | undefined, LoanTransaction[]>();
  const parentTransactions = new Set<number>();

  // First pass: identify parent transactions and create their groups
  transactions.forEach(tx => {
    if (!tx.parentId && isLoanTransaction(tx)) {
      parentTransactions.add(tx.id!);
      groups.set(tx.id, [tx]);
    }
  });

  // Second pass: group child transactions with their parents
  transactions.forEach(tx => {
    if (tx.parentId && parentTransactions.has(tx.parentId) && isRepaidTransaction(tx)) {
      groups.get(tx.parentId)!.push(tx);
    }
  });

  // Create loan groups
  return Array.from(groups.entries())
    .map(([parentId, txs]) => {
      // Separate parent and child transactions
      const parentTx = txs.find(isLoanTransaction);
      const childTxs = txs.filter(isRepaidTransaction);
      
      // Combine parent and child transactions for status calculation
      const allTxs = parentTx ? [parentTx, ...childTxs] : txs;
      
      return {
        parentId,
        personName: parentTx?.personName || txs[0].personName,
        transactions: txs.sort((a, b) => b.date.getTime() - a.date.getTime()),
        status: calculateLoanStatus(allTxs)
      };
    });
}