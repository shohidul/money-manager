import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanGroup } from '../../../models/loan.model';
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { LoanListItemComponent } from './loan-list-item.component';
import { FilterOptions } from '../../../utils/transaction-filters';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, FilterBarComponent, LoanListItemComponent],
  template: `
    <div class="loan-lists">
      <app-filter-bar
        [filters]="filters"
        [showStatus]="true"
        (filtersChange)="onFiltersChange($event)"
      />

      <div class="lists-container">
        <div class="loan-section">
          <h3>Loans Given</h3>
          <div class="loan-items">
            @for (group of givenLoans; track group.parentId) {
              <app-loan-list-item [group]="group" />
            }
          </div>
        </div>

        <div class="loan-section">
          <h3>Loans Taken</h3>
          <div class="loan-items">
            @for (group of takenLoans; track group.parentId) {
              <app-loan-list-item [group]="group" />
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lists-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .lists-container {
        grid-template-columns: 1fr;
      }
    }

    .loan-section h3 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }
  `]
})
export class LoanListComponent {
  @Input() givenLoans: LoanGroup[] = [];
  @Input() takenLoans: LoanGroup[] = [];
  
  filters: FilterOptions = {
    status: 'all'
  };

  onFiltersChange(filters: FilterOptions) {
    // Emit filters to parent component
  }
}