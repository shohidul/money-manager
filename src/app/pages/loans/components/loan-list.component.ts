import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { LoanSummaryComponent } from './loan-summary.component';
import { LoanItemComponent } from './loan-item.component';
import { LoanService } from '../../../services/loan.service';
import { LoanTransaction, LoanGroup, LoanStatus } from '../../../models/loan.model';
import { differenceInDays } from 'date-fns';
import { format } from 'date-fns';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';
import { FilterOptions } from '../../../utils/transaction-filters';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterBarComponent,
    LoanSummaryComponent,
    LoanItemComponent,
    TranslatePipe,
    TranslateDatePipe,
    TranslateNumberPipe
  ],
  template: `
    <div class="loan-list">
      <app-filter-bar
        [filters]="filters"
        [showStatus]="true"
        (filtersChange)="onFiltersChange($event)"
        (monthChange)="onMonthChange($event)"
      />

      <app-loan-summary
        [totalGiven]="totalGiven"
        [totalTaken]="totalTaken"
      />

      <div class="loan-groups">
        <div class="loan-section">
          <h3>{{ 'loan.loansGiven' | translate }}</h3>
          <div class="loan-items">
            @for (group of givenLoans; track group.parentId) {
              <app-loan-item [group]="group" />
            }
            @if (givenLoans.length === 0) {
              <div class="empty-state">{{ 'loan.noLoansGiven' | translate }}</div>
            }
          </div>
        </div>

        <div class="loan-section">
          <h3>{{ 'loan.loansTaken' | translate }}</h3>
          <div class="loan-items">
            @for (group of takenLoans; track group.parentId) {
              <app-loan-item [group]="group" />
            }
            @if (takenLoans.length === 0) {
              <div class="empty-state">{{ 'loan.noLoansTaken' | translate }}</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .loan-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .loan-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--surface-color);
      padding: 1rem;
      border-radius: 8px;
    }

    .loan-section h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 500;
    }

    .loan-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .empty-state {
      text-align: center;
      color: var(--text-secondary);
      padding: 1rem;
      background: var(--surface-variant);
      border-radius: 4px;
    }
  `]
})
export class LoanListComponent implements OnInit {
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
      const [givenLoans, takenLoans] = await Promise.all([
        this.loanService.getLoansGiven(this.filters.month),
        this.loanService.getLoansTaken(this.filters.month)
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

  onMonthChange(month: string) {
    this.filters.month = month;
    this.loadLoans();
  }
}