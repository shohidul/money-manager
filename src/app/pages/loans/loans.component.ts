import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { LoanListComponent } from './components/loan-list.component';
import { LoanChartsComponent } from './components/loan-charts.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { LoanTransaction, LoanGroup, LoanStatus } from '../../models/loan.model';
import { differenceInDays } from 'date-fns';
import { FilterOptions } from '../../utils/transaction-filters';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, LoanListComponent, LoanChartsComponent, FilterBarComponent],
  template: `
    <div class="loans">
      <app-mobile-header
        title="Loan Management"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <app-filter-bar
        [filters]="filters"
        [showStatus]="true"
        (filtersChange)="onFiltersChange($event)"
        (startDateChange)="onStartDateChange($event)"
        (endDateChange)="onEndDateChange($event)"
        />

        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Loans</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">Analytics</button>
        </div>
        
        @if (activeTab === 'list') {
          <app-loan-list 
            [givenLoans]="givenLoans" 
            [takenLoans]="takenLoans" 
            [totalGiven]="totalGiven" 
            [totalTaken]="totalTaken" 
          />
        } @else {
          <app-loan-charts />
        }
      </div>
    </div>
  `,
  styles: [`
    .loans {
      max-width: 1000px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .tabs button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background: var(--background-color-hover);
      cursor: pointer;
    }

    .tabs button.active {
      background: var(--primary-color);
      color: white;
    }
  `]
})
export class LoansComponent {
  activeTab: 'list' | 'charts' = 'list';
  filters: FilterOptions = {};
  givenLoans: LoanGroup[] = [];
  takenLoans: LoanGroup[] = [];
  totalGiven: number = 0;
  totalTaken: number = 0;

  constructor(private loanService: LoanService) {}

  async ngOnInit() {
    // Initialize with all loans
    await this.loadLoans();
  }

  async loadLoans() {
    try {
      let startDate: Date;
      let endDate: Date;
  
      // Determine date range for filtering
      if (this.filters.startDate) {
        startDate = this.filters.startDate;
      } else {
        // Default to start of current year
        startDate = new Date(new Date().getFullYear(), 0, 1);
      }
  
      if (this.filters.endDate) {
        endDate = this.filters.endDate;
      } else {
        // Default to current date
        endDate = new Date();
      }

      const [givenLoans, takenLoans] = await Promise.all([
        this.loanService.getLoansGiven(startDate, endDate),
        this.loanService.getLoansTaken(startDate, endDate)
      ]);

      // Assign grouped loans directly since they're already grouped by the service
      this.givenLoans = givenLoans;
      this.takenLoans = takenLoans;

      // Filter loans based on status
      const filterByStatus = (loans: LoanGroup[]) => {
        if (!this.filters.status || this.filters.status === 'all') return loans;
        
        return loans.filter(loan => {
          switch (this.filters.status) {
            case 'pending': 
              return loan.status.remainingAmount === loan.status.totalAmount;
            case 'partial': 
              return loan.status.remainingAmount > 0 && 
                     loan.status.remainingAmount < loan.status.totalAmount;
            case 'completed': 
              return loan.status.remainingAmount <= 0;
            default: 
              return true;
          }
        });
      };

      this.givenLoans = filterByStatus(this.givenLoans);
      this.takenLoans = filterByStatus(this.takenLoans);

      // Calculate totals
      this.totalGiven = this.givenLoans.reduce((sum, group) => sum + group.status.totalAmount, 0);
      this.totalTaken = this.takenLoans.reduce((sum, group) => sum + group.status.totalAmount, 0);
    } catch (error) {
      console.error('Error loading loans:', error);
    }
  }

  calculateLoanStatus(transactions: LoanTransaction[]): LoanStatus {
    // If no transactions, return default status
    if (transactions.length === 0) {
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

    // Get the parent transaction (first transaction in the group)
    const parentTransaction = transactions[0];
    
    // Calculate total amount from the parent transaction
    const totalAmount = parentTransaction.amount;

    // Calculate paid amount by finding child transactions with this parent's ID
    const paidAmount = transactions
      .filter(tx => tx.parentId === parentTransaction.id)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const remainingAmount = totalAmount - paidAmount;
    const isCompleted = remainingAmount <= 0;

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      isCompleted,
      dueDate: parentTransaction.dueDate,
      isOverdue: parentTransaction.dueDate ? new Date() > parentTransaction.dueDate : false,
      daysUntilDue: parentTransaction.dueDate 
        ? differenceInDays(parentTransaction.dueDate, new Date()) 
        : undefined
    };
  }

  onFiltersChange(filters: FilterOptions) {
    this.filters = filters;
    this.loadLoans();
  }

  onStartDateChange(date: Date) {
    this.filters.startDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    this.loadLoans();
  }

  onEndDateChange(date: Date) {
    this.filters.endDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    this.loadLoans();
  }

  goBack() {
    window.history.back();
  }
}