import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../../services/db.service';
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { LoanSummaryComponent } from './loan-summary.component';
import { LoanItemComponent } from './loan-item.component';
import { Transaction, isLoanTransaction } from '../../../models/transaction-types';
import { LoanTransaction } from '../../../models/loan.model';
import { FilterOptions } from '../../../utils/transaction-filters';
import { LoanGroup } from '../../../models/loan.model';
import { groupLoanTransactions } from '../../../utils/loan.utils';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterBarComponent,
    LoanSummaryComponent,
    LoanItemComponent
  ],
  template: `
    <div class="loan-list">
      <app-filter-bar
        [filters]="filters"
        [showStatus]="true"
        (filtersChange)="onFiltersChange($event)"
      />

      <app-loan-summary
        [totalGiven]="totalGiven"
        [totalTaken]="totalTaken"
      />

      <div class="loan-groups">
        <div class="loan-section">
          <h3>Loans Given</h3>
          <div class="loan-items">
            @for (group of givenLoans; track group.parentId) {
              <app-loan-item [group]="group" />
            }
            @if (givenLoans.length === 0) {
              <div class="empty-state">No loans given</div>
            }
          </div>
        </div>

        <div class="loan-section">
          <h3>Loans Taken</h3>
          <div class="loan-items">
            @for (group of takenLoans; track group.parentId) {
              <app-loan-item [group]="group" />
            }
            @if (takenLoans.length === 0) {
              <div class="empty-state">No loans taken</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-groups {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .loan-groups {
        grid-template-columns: 1fr;
      }
    }

    .loan-section h3 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class LoanListComponent implements OnInit {
  filters: FilterOptions = { status: 'all' };
  loanTransactions: LoanTransaction[] = [];
  givenLoans: LoanGroup[] = [];
  takenLoans: LoanGroup[] = [];
  totalGiven = 0;
  totalTaken = 0;

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    const transactions = await this.dbService.getTransactions(
      this.filters.startDate || new Date(0),
      this.filters.endDate || new Date()
    );

    // this.loanTransactions = transactions
    //   .filter(isLoanTransaction)
    //   .sort((a, b) => b.date.getTime() - a.date.getTime());

    const groups = groupLoanTransactions(this.loanTransactions);
    
    this.givenLoans = groups.filter(g => g.transactions[0].type === 'expense');
    this.takenLoans = groups.filter(g => g.transactions[0].type === 'income');

    this.totalGiven = this.givenLoans.reduce((sum, g) => sum + g.status.totalAmount, 0);
    this.totalTaken = this.takenLoans.reduce((sum, g) => sum + g.status.totalAmount, 0);
  }

  async onFiltersChange(filters: FilterOptions) {
    this.filters = filters;
    await this.loadTransactions();
  }
}