import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DbService, Transaction, Category } from '../../services/db.service';
import { startOfMonth, endOfMonth, format } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="top-bar">
        <button class="menu-button">
          <span class="material-icons">menu</span>
        </button>
        <input 
          type="month" 
          [value]="currentMonth"
          (change)="onMonthChange($event)"
          class="month-picker"
        >
        <button class="refresh-button" (click)="loadTransactions()">
          <span class="material-icons">refresh</span>
        </button>
      </header>

      <div class="overview card">
        <div class="stat-item">
          <span class="label">Income</span>
          <span class="amount income">+{{ totalIncome | currency }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Expense</span>
          <span class="amount expense">-{{ totalExpense | currency }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Balance</span>
          <span class="amount" [class.income]="balance >= 0" [class.expense]="balance < 0">
            {{ balance | currency }}
          </span>
        </div>
      </div>

      <div class="transactions card">
        <h2>Recent Transactions</h2>
        <div class="transaction-list">
          <div *ngFor="let group of transactionGroups" class="transaction-group">
            <div class="date-header">
              <span>{{ group.date | date:'mediumDate' }}</span>
              <span class="total">{{ group.total | currency }}</span>
            </div>
            <div *ngFor="let transaction of group.transactions" 
                 class="transaction-item"
                 (click)="editTransaction(transaction)">
              <div class="transaction-icon">
                <span class="material-icons" [class]="transaction.type">
                  {{ getCategoryIcon(transaction.categoryId) }}
                </span>
              </div>
              <div class="transaction-details">
                <span class="memo">{{ transaction.memo }}</span>
                <span class="category">{{ getCategoryName(transaction.categoryId) }}</span>
              </div>
              <span class="amount" [class]="transaction.type">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | currency }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <a routerLink="/add-transaction" class="fab">
        <span class="material-icons">add</span>
      </a>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .menu-button, .refresh-button {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 50%;
    }

    .menu-button:hover, .refresh-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .month-picker {
      padding: 0.5rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }

    .overview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      text-align: center;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .amount {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .transaction-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .date-header {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .transaction-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .transaction-icon {
      padding: 0.5rem;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.04);
    }

    .transaction-details {
      flex: 1;
    }

    .memo {
      display: block;
      font-weight: 500;
    }

    .category {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentMonth = format(new Date(), 'yyyy-MM');
  transactions: Transaction[] = [];
  categories: Category[] = [];
  transactionGroups: any[] = [];
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.loadTransactions();
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async loadTransactions() {
    const date = new Date(this.currentMonth);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    
    this.transactions = await this.dbService.getTransactions(startDate, endDate);
    this.calculateTotals();
    this.groupTransactions();
  }

  calculateTotals() {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.balance = this.totalIncome - this.totalExpense;
  }

  groupTransactions() {
    const groups = new Map<string, any>();
    
    this.transactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: transaction.date,
          transactions: [],
          total: 0
        });
      }
      
      const group = groups.get(dateKey);
      group.transactions.push(transaction);
      group.total += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    });

    this.transactionGroups = Array.from(groups.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getCategoryIcon(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.icon || 'help';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  onMonthChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentMonth = input.value;
    this.loadTransactions();
  }

  editTransaction(transaction: Transaction) {
    // TODO: Implement edit transaction
    console.log('Edit transaction:', transaction);
  }
}