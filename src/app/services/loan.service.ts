import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { LoanTransaction, LoanGroup, LoanStatus } from '../models/loan.model';
import { Transaction, isLoanTransaction, TransactionType, isRepaidTransaction } from '../models/transaction-types';
import { differenceInDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { groupLoanTransactions } from '../utils/loan.utils';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  currentMonth = format(new Date(), 'yyyy-MM');

  constructor(private dbService: DbService) {}

  async getRepaidTransactions(startDate?: Date, endDate?: Date): Promise<LoanTransaction[]> {
    try {
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = startOfMonth(startDate);
        end = endOfMonth(endDate);
      } else {
        // If no month specified, get all transactions
        start = new Date(0);
        end = new Date();
      }

      const transactions = await this.dbService.getTransactions(start, end);
      // Filter for both loan and repaid transactions
      const loanTransactions = transactions
      .filter(isRepaidTransaction);
      return loanTransactions;
    } catch (error) {
      console.error('Error fetching loan transactions:', error);
      throw error;
    }
  }

  async getRepaidTransactionsByType(type: TransactionType, startDate?: Date, endDate?: Date): Promise<LoanTransaction[]> {
    try {
      // Get all loan transactions that can be potential parents
      const transactions = await this.getRepaidTransactions(startDate, endDate);

      // Filter based on transaction type:
      // - If current transaction is income (repayment), show expense (given loans) as parents
      // - If current transaction is expense (giving loan), show income (taken loans) as parents
      return transactions.filter(tx => 
        // Only show transactions without a parent (they are parent transactions)
        // !tx.parentId && 
        // Show opposite type transactions as potential parents
        tx.type === type
      );
    } catch (error) {
      console.error('Error fetching parent loans:', error);
      throw error;
    }
  }

  async getLoansGiven(startDate?: Date, endDate?: Date): Promise<LoanGroup[]> {
    try {
      // Get parent loans (expense type)
      const parentLoans = await this.getParentLoansByType('expense', startDate, endDate);

      // Get children loans (income type repayments)
      const repaidTranx = await this.getRepaidTransactionsByType('income', startDate, endDate);

      // Combine parent and children loans, ensuring they are LoanTransaction[]
      const transactions: LoanTransaction[] = [...parentLoans, ...repaidTranx];
      
      // Group transactions
      const givenLoans = groupLoanTransactions(
        transactions.filter(tx => 
          (tx.subType === 'loan' || tx.parentId) // Include both loan and repaid transactions
        )
      );
      
      return givenLoans;
    } catch (error) {
      console.error('Error fetching loans given:', error);
      throw error;
    }
  }

  async getLoansTaken(startDate?: Date, endDate?: Date): Promise<LoanGroup[]> {
    try {
      // Get parent loans (income type)
      const parentLoans = await this.getParentLoansByType('income', startDate, endDate);
      
      // Get children loans (expense type repayments)
      const repaidTranx = await this.getRepaidTransactionsByType('expense', startDate, endDate);
      
      // Combine parent and children loans, ensuring they are LoanTransaction[]
      const transactions: LoanTransaction[] = [...parentLoans, ...repaidTranx];
      
      // Group transactions
      const takenLoans = groupLoanTransactions(
        transactions.filter(tx => 
          (tx.subType === 'loan' || tx.parentId) // Include both loan and repaid transactions
        )
      );
      
      return takenLoans;
    } catch (error) {
      console.error('Error fetching loans taken:', error);
      throw error;
    }
  }

  async getParentLoansByType(type: TransactionType, startDate?: Date, endDate?: Date): Promise<LoanTransaction[]> {
    try {
      // Get all loan transactions that can be potential parents
      const transactions = await this.getLoanTransactions(startDate, endDate);
      
      // Filter based on transaction type:
      // - If current transaction is income (repayment), show expense (given loans) as parents
      // - If current transaction is expense (giving loan), show income (taken loans) as parents
      return transactions.filter(tx => 
        // Only show transactions without a parent (they are parent transactions)
        // !tx.parentId && 
        // Show opposite type transactions as potential parents
        tx.type === type
      );
    } catch (error) {
      console.error('Error fetching parent loans:', error);
      throw error;
    }
  }

  async getLoanTransactions(startDate?: Date, endDate?: Date): Promise<LoanTransaction[]> {
    try {
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        // If no dates specified, get all transactions
        start = new Date(0);
        end = new Date();
      }

      const transactions = await this.dbService.getTransactions(start, end);
      
      // Filter using the type guard and ensure all required fields are present
      const loanTransactions = transactions
        .filter(isLoanTransaction)
        .filter(tx => tx.id && tx.personName);
      
      return loanTransactions;
    } catch (error) {
      console.error('Error fetching loan transactions:', error);
      throw error;
    }
  }

  async getCostParents(startDate?: Date, endDate?: Date): Promise<LoanTransaction[]> {
    try {
      // Get all transactions that can be potential parents
      const parentLoans = await this.getLoanTransactions(startDate, endDate);
      const repaidTranx = await this.getRepaidTransactions(startDate, endDate);
      const transactions: LoanTransaction[] = [...parentLoans, ...repaidTranx];
      return transactions;
    } catch (error) {
      console.error('Error fetching parent loans:', error);
      throw error;
    }
  }
}