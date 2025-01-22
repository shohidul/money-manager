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
      daysUntilDue: undefined,
      loanCharges: 0
    };
  }
  
  // Calculate paid amount from repaid transactions
  const paidAmount = transactions
    .filter(isRepaidTransaction)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const loanCharges = transactions
    .filter(tx => tx.loanCharges > 0)
    .reduce((sum, tx) => sum + tx.loanCharges, 0);
  
    
  return {
    totalAmount: parentTx.amount,
    paidAmount,
    remainingAmount: parentTx.amount - paidAmount,
    loanCharges: loanCharges,
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
  const groups = new Map<number, LoanTransaction[]>();
  const parentTransactions = new Set<number>();

  transactions.forEach(tx => {
    const { id, parentId, personName } = tx;

    // If it's a parent transaction, add it to the group
    if (!parentId && isLoanTransaction(tx)) {
      parentTransactions.add(id!);
      groups.set(id!, [tx]);
    } 
    // If it's a child transaction, add it to the corresponding parent group
    else if (parentId && parentTransactions.has(parentId) && isRepaidTransaction(tx)) {
      groups.get(parentId)!.push(tx);
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
        parent: parentTx!,
        transactions: [...childTxs].sort((a, b) => b.date.getTime() - a.date.getTime()),
        status: calculateLoanStatus(allTxs)
      };
    });
}