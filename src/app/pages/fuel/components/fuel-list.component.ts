import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { isFuelTransaction, FuelTransaction } from '../../../models/transaction-types';
import { calculateMileage } from '../../../utils/fuel.utils';
import { FilterOptions } from '../../../utils/transaction-filters';

@Component({
  selector: 'app-fuel-list',
  standalone: true,
  imports: [CommonModule, FilterBarComponent],
  template: `
    <div class="fuel-list">
      <app-filter-bar
        [filters]="filters"
        (filtersChange)="onFiltersChange($event)"
      />

      <div class="transactions card">
        @for (tx of fuelTransactions; track tx.id) {
          <div class="transaction-item">
            <span class="material-symbols-rounded">local_gas_station</span>
            <div class="transaction-details">
              <span class="date">{{ tx.date | date:'MMM d, y h:mm a' }}</span>
              <span class="memo">{{ tx.memo }}</span>
              <div class="fuel-info">
                <span>{{ tx.fuelQuantity }}L {{ tx.fuelType }}</span>
                <span>{{ tx.odometerReading }} km</span>
                <span>{{ getMileage(tx) | number:'1.1-1' }} km/L</span>
                <span>{{ tx.amount / tx.fuelQuantity | number:'1.2-2' }}/L</span>
              </div>
            </div>
            <span class="amount">{{ tx.amount | currency }}</span>
          </div>
        }

        @if (fuelTransactions.length === 0) {
          <div class="empty-state">
            <span class="material-symbols-rounded">local_gas_station</span>
            <p>No fuel entries found</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .transactions {
      margin-top: 1rem;
    }

    .transaction-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color-light);
    }

    .transaction-item:last-child {
      border-bottom: none;
    }

    .transaction-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .date {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .memo {
      font-weight: 500;
    }

    .fuel-info {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .amount {
      font-weight: 500;
      color: var(--text-primary);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .empty-state .material-symbols-rounded {
      font-size: 48px;
      margin-bottom: 1rem;
    }

    .add-button {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  `]
})
export class FuelListComponent implements OnChanges {
  @Input() transactions: FuelTransaction[] = [];
  @Input() filters: FilterOptions = {};
  @Output() filtersChange = new EventEmitter<FilterOptions>();

  fuelTransactions: FuelTransaction[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.fuelTransactions = this.transactions
        .filter(isFuelTransaction)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }

  getMileage(transaction: FuelTransaction): number {
    const prevTransaction = this.fuelTransactions
      .find(t => t.date < transaction.date && t.odometerReading < transaction.odometerReading);
    
    return calculateMileage(transaction, prevTransaction);
  }

  onFiltersChange(filters: FilterOptions) {
    this.filtersChange.emit(filters);
  }
}