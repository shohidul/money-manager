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

  async getRepaidTransactions(month?: string): Promise<LoanTransaction[]> {
    try {
      let startDate: Date;
      let endDate: Date;

      if (month) {
        const date = new Date(month);
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
      } else {
        // If no month specified, get all transactions
        startDate = new Date(0);
        endDate = new Date();
      }

      const transactions = await this.dbService.getTransactions(startDate, endDate);
      // Filter for both loan and repaid transactions
      const loanTransactions = transactions
      .filter(isRepaidTransaction);
      return loanTransactions;
    } catch (error) {
      console.error('Error fetching loan transactions:', error);
      throw error;
    }
  }

  async getChildrenLoansByType(type: TransactionType): Promise<LoanTransaction[]> {
    try {
      // Get all loan transactions that can be potential parents
      const transactions = await this.getRepaidTransactions();

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

  async getLoansGiven(month?: string): Promise<LoanGroup[]> {
    try {
      // Get parent loans (expense type)
      const parentLoans = await this.getParentLoansByType('expense');

      // Get children loans (income type repayments)
      const childrenLoans = await this.getChildrenLoansByType('income');

      // Combine parent and children loans, ensuring they are LoanTransaction[]
      const transactions: LoanTransaction[] = [...parentLoans, ...childrenLoans];
      
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

  async getLoansTaken(month?: string): Promise<LoanGroup[]> {
    try {
      // Get parent loans (income type)
      const parentLoans = await this.getParentLoansByType('income');
      
      // Get children loans (expense type repayments)
      const childrenLoans = await this.getChildrenLoansByType('expense');
      
      // Combine parent and children loans, ensuring they are LoanTransaction[]
      const transactions: LoanTransaction[] = [...parentLoans, ...childrenLoans];
      
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

  async getParentLoansByType(type: TransactionType): Promise<LoanTransaction[]> {
    try {
      // Get all loan transactions that can be potential parents
      const transactions = await this.getLoanTransactions();
      
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

  async getLoanTransactions(month?: string): Promise<LoanTransaction[]> {
    try {
      let startDate: Date;
      let endDate: Date;

      if (month) {
        const date = new Date(month);
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
      } else {
        // If no month specified, get all transactions
        startDate = new Date(0);
        endDate = new Date();
      }

      const transactions = await this.dbService.getTransactions(startDate, endDate);
      
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
}