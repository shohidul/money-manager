import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Transaction, categoryIcons } from '../../models/transaction.model';

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
              {{ categoryIcons[transaction.category] }}
            </span>
            <div class="transaction-details">
              <strong>{{ transaction.description }}</strong>
              <small>
                {{ formatCategory(transaction.category) }} • 
                {{ transaction.date | date:'short' }}
              </small>
            </div>
          </div>
          <span [class]="transaction.type">
            {{ transaction.type === 'income' ? '+' : '-' }}
            {{ transaction.amount | currency }}
          </span>
        </li>
      </ul>
    </div>
  `,
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];
  categoryIcons = categoryIcons;

  formatCategory(category: string): string {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
