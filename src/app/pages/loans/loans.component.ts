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
import { TranslatePipe } from '../../components/shared/translate.pipe';
import { TranslateNumberPipe } from '../../components/shared/translate-number.pipe';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, LoanListComponent, LoanChartsComponent, FilterBarComponent, TranslatePipe, TranslateNumberPipe],
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
        [showStatus]="activeTab === 'list'"
        (filtersChange)="onFiltersChange($event)"
        (startDateChange)="onStartDateChange($event)"
        (endDateChange)="onEndDateChange($event)"
        />

        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">{{'loan.loans' | translate}}</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">{{'loan.analytics' | translate}}</button>
        </div>
        
        @if (activeTab === 'list') {
          <app-loan-list 
            [givenLoans]="givenLoans" 
            [takenLoans]="takenLoans" 
            [remainingGiven]="remainingGiven" 
            [remainingTaken]="remainingTaken" 
            [activeGivenLoans]="activeGivenLoans" 
            [activeTakenLoans]="activeTakenLoans"
          />
        } @else {
          <app-loan-charts 
            [filters]="filters"
          />
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
  activeGivenLoans = 0;
  activeTakenLoans = 0;
  remainingGiven: number = 0;
  remainingTaken: number = 0;

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
            case 'remaining': 
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

      // Active loans count
      this.activeGivenLoans = this.givenLoans.filter(loan => !loan.status.isCompleted).length;
      this.activeTakenLoans = this.takenLoans.filter(loan => !loan.status.isCompleted).length;

      // Calculate totals
      // this.totalGiven = this.givenLoans.reduce((sum, group) => sum + group.status.totalAmount, 0);
      // this.totalTaken = this.takenLoans.reduce((sum, group) => sum + group.status.totalAmount, 0);

      // Calculate remaining amounts
      this.remainingGiven = this.givenLoans.reduce((sum, group) => sum + group.status.remainingAmount, 0);
      this.remainingTaken = this.takenLoans.reduce((sum, group) => sum + group.status.remainingAmount, 0);
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
        daysUntilDue: undefined,
        loanCharges: 0
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
        : undefined,
      loanCharges: parentTransaction.loanCharges || 0
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