import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { isFuelTransaction, FuelTransaction } from '../../../models/transaction-types';
import { calculateMileage } from '../../../utils/fuel.utils';
import { Category } from '../../../services/db.service';
import { TranslatePipe } from "../../../components/shared/translate.pipe";
import { TranslateNumberPipe } from "../../../components/shared/translate-number.pipe";
import { TranslateDatePipe } from "../../../components/shared/translate-date.pipe";

@Component({
  selector: 'app-fuel-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslateNumberPipe, TranslateDatePipe],
  template: `
  <div class="fuel-list">
    <div class="transactions card">
      <div *ngIf="transactionGroups.length > 0; else noTransactions">
        <div class="category-group" *ngFor="let group of transactionGroups">
          <div class="category-header">
            <div class="category-details">
              <span class="category-name">
                {{ getCategoryName(group.categoryId) | translate }}
              </span>
              <span class="category-summary">
                {{ 'categories.subTypes.fuel' | translate }} {{ group.totalFuel | translateNumber:'1.1-1' }} {{ 'fuel.L' | translate }} | 
                {{ 'fuel.mileage' | translate }} {{ group.averageMileage | translateNumber:'1.1-1' }} {{ 'fuel.kmPerLiter' | translate }} |
                {{ 'common.total' | translate }} {{ group.total | translateNumber:'1.0-2' }}
              </span>
            </div>
          </div>
          <div class="transaction-item" *ngFor="let transaction of group.transactions">
            <span class="material-symbols-rounded" [class]="transaction.type">
              {{ getCategoryIcon(transaction.categoryId) }}
            </span>
            <div class="transaction-details">
              <span class="small-text">
                {{ transaction.date | translateDate }}, {{ transaction.date | translateDate: 'shortTime' }}
              </span>
              <span class="small-text">
                {{ transaction.fuelType === undefined 
                  ? ('categories.subTypes.fuel' | translate) 
                  : ('fuel.types.' + transaction.fuelType | lowercase | translate) }}

                {{ transaction.fuelQuantity || 0 | translateNumber:'1.0-2' }} {{ 'fuel.L' | translate }} | 
                {{ 'fuel.odo' | translate }} {{ transaction.odometerReading || 0 | translateNumber:'1.0-0' }} {{ 'fuel.km' | translate }} | 
                {{ 'fuel.mileage' | translate }} {{ getMileage(transaction) || 0 | translateNumber:'1.0-2' }} {{ 'fuel.kmPerLiter' | translate }} |
                {{ 'fuel.price' | translate }} {{ (transaction.fuelQuantity ? (transaction.amount / transaction.fuelQuantity) : 0) | translateNumber:'1.0-2' }} 
              </span>
              <span class="memo" *ngIf="transaction.memo">{{ transaction.memo }}</span>
            </div>
            <span class="amount">
              {{ transaction.amount | translateNumber:'1.0-2' }}
            </span>
          </div>
        </div>
      </div>
      <ng-template #noTransactions>
        <div class="empty-state">
          <span class="material-symbols-rounded">local_gas_station</span>
          <p>{{ 'fuel.notFound' | translate }}</p>
        </div>
      </ng-template>
    </div>
  </div>
`,

  styles: [`
    .transactions {
      margin-top: 1rem;
    }

    .transactions.card {
      padding: 0 !important;
    }

    .category-group {
      margin-bottom: 1rem;
    }

    .category-header {
      display: flex;
      align-items: center;
      padding: 1.5rem 2rem 0.5rem 2rem;
      background-color: var(--background-color-alt);
      border-bottom: 1px solid var(--background-color);
    }

    .category-header .material-symbols-rounded {
      font-size: 24px;
      margin-right: 0.5rem;
    }

    .category-details {
      flex: 1;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .category-name {
      font-weight: 500;
    }

    .category-summary {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 2rem;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--background-color);
      font-size: 0.8rem;
    }

    .transaction-item:hover {
      background-color: var(--background-color-hover);
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-details .small-text {
      display: block;
      margin-top: 0.25rem;
    }

    .memo {
      display: block;
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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .empty-state .material-symbols-rounded {
      font-size: 48px;
      margin-bottom: 1rem;
      opacity: 0.5;
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
  @Input() transactionGroups: {
    categoryId: number;
    transactions: FuelTransaction[];
    total: number;
    totalFuel: number;
    averageMileage: number;
  }[] = [];

  @Input() fuelCategories: Category[] = [];

  get fuelTransactions(): FuelTransaction[] {
    return this.transactionGroups.flatMap(group => group.transactions);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactionGroups']) {
      this.transactionGroups = this.transactionGroups.map(group => ({
        ...group,
        transactions: group.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));
    }
  }

  getMileage(transaction: FuelTransaction): number {
    const prevTransaction = this.fuelTransactions
      .find(t => t.date < transaction.date && t.odometerReading < transaction.odometerReading);
    
    return calculateMileage(transaction, prevTransaction);
  }

  getCategoryIcon(categoryId: number): string {
    return this.fuelCategories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  getCategoryName(categoryId: number): string {
    const category = this.fuelCategories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  }
}