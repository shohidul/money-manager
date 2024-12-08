import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Transaction, isLendBorrowTransaction, isAssetTransaction, isFuelTransaction } from '../../models/transaction-types';
import { categoryIcons } from '../../data/category-icons';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="card">
      <h2>Recent Transactions</h2>
      <ul class="transaction-list">
        <li *ngFor="let transaction of transactions" class="transaction-item">
          <div class="transaction-info">
            <span class="material-symbols-rounded category-icon" [class]="transaction.type">
              {{ categoryIcons[transaction.categoryId] }}
            </span>
            <div class="transaction-details">
              <strong>{{ transaction.memo }}</strong>
              <div class="transaction-metadata">
                @if (isLendBorrowTransaction(transaction)) {
                  <span class="metadata-item">
                    <span class="material-icons">person</span>
                    {{ transaction.personName }}
                  </span>
                  @if (transaction.dueDate) {
                    <span class="metadata-item">
                      <span class="material-icons">event</span>
                      Due: {{ transaction.dueDate | date:'shortDate' }}
                    </span>
                  }
                }

                @if (isAssetTransaction(transaction)) {
                  <span class="metadata-item">
                    <span class="material-icons">real_estate_agent</span>
                    {{ transaction.assetName }}
                  </span>
                  <span class="metadata-item">
                    <span class="material-icons">trending_up</span>
                    Current: {{ transaction.currentValue | currency }}
                  </span>
                }

                @if (isFuelTransaction(transaction)) {
                  <span class="metadata-item">
                    <span class="material-icons">speed</span>
                    {{ transaction.odometerReading }} km
                  </span>
                  <span class="metadata-item">
                    <span class="material-icons">local_gas_station</span>
                    {{ transaction.fuelQuantity }}L ({{ transaction.fuelType }})
                  </span>
                }

                <small>
                  {{ getCategoryName(transaction.categoryId) }} • 
                  {{ transaction.date | date:'short' }}
                </small>
              </div>
            </div>
          </div>
          <span [class]="getAmountClass(transaction)">
            {{ getAmountPrefix(transaction) }}
            {{ transaction.amount | currency }}
          </span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .transaction-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .transaction-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .transaction-info {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex: 1;
      min-width: 0;
    }

    .category-icon {
      padding: 0.5rem;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.04);
    }

    .transaction-details {
      flex: 1;
      min-width: 0;
    }

    .transaction-metadata {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .metadata-item .material-icons {
      font-size: 1rem;
    }

    small {
      display: block;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .income { color: #4caf50; }
    .expense { color: #f44336; }
    .lend { color: #2196f3; }
    .borrow { color: #ff9800; }
    .asset { color: #9c27b0; }
    .fuel { color: #795548; }
  `]
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];
  @Input() categories: any[] = [];
  categoryIcons = categoryIcons;

  isLendBorrowTransaction = isLendBorrowTransaction;
  isAssetTransaction = isAssetTransaction;
  isFuelTransaction = isFuelTransaction;

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  getAmountClass(transaction: Transaction): string {
    return transaction.type;
  }

  getAmountPrefix(transaction: Transaction): string {
    switch (transaction.type) {
      case 'income':
        return '+';
      case 'expense':
      case 'fuel':
        return '-';
      case 'lend':
        return '→';
      case 'borrow':
        return '←';
      case 'asset':
        return '∆';
      default:
        return '';
    }
  }
}