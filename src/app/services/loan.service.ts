import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { LoanTransaction, LoanGroup } from '../models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  constructor(private dbService: DbService) {}

  async getLoanTransactions(startDate: Date, endDate: Date): Promise<LoanTransaction[]> {
    const transactions = await this.dbService.getTransactions(startDate, endDate);
    return transactions.filter(tx => tx.subType === 'loan') as LoanTransaction[];
  }

  async getLoansGiven(): Promise<LoanGroup[]> {
    const transactions = await this.getLoanTransactions(new Date(0), new Date());
    return this.groupLoans(transactions.filter(tx => tx.type === 'expense'));
  }

  async getLoansTaken(): Promise<LoanGroup[]> {
    const transactions = await this.getLoanTransactions(new Date(0), new Date());
    return this.groupLoans(transactions.filter(tx => tx.type === 'income'));
  }

  private groupLoans(transactions: LoanTransaction[]): LoanGroup[] {
    // Group parent loans (transactions without parentId)
    const parentLoans = transactions.filter(tx => !tx.parentId);
    
    return parentLoans.map(parentLoan => {
      const relatedPayments = transactions.filter(tx => 
        tx.parentId === parentLoan.id
      );

      const totalPaid = relatedPayments.reduce((sum, tx) => sum + tx.amount, 0);
      const remainingAmount = parentLoan.amount - totalPaid;

      return {
        parentId: parentLoan.id,
        personName: parentLoan.personName,
        transactions: [parentLoan, ...relatedPayments],
        status: {
          totalAmount: parentLoan.amount,
          paidAmount: totalPaid,
          remainingAmount,
          isCompleted: remainingAmount <= 0
        }
      };
    });
  }

  isDueSoon(dueDate?: Date): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue > 0;
  }

  isOverdue(dueDate?: Date): boolean {
    if (!dueDate) return false;
    return dueDate < new Date();
  }
}