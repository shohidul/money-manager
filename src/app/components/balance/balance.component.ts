import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="card">
      <h2>Balance Overview</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
        <div>
          <h3>Income</h3>
          <p class="income">{{ totalIncome | currency }}</p>
        </div>
        <div>
          <h3>Expenses</h3>
          <p class="expense">{{ totalExpenses | currency }}</p>
        </div>
        <div>
          <h3>Balance</h3>
          <p [class]="balance >= 0 ? 'income' : 'expense'">{{ balance | currency }}</p>
        </div>
      </div>
    </div>
  `,
})
export class BalanceComponent {
  @Input() transactions: Transaction[] = [];

  get totalIncome() {
    return this.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses() {
    return this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get balance() {
    return this.totalIncome - this.totalExpenses;
  }
}
