import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DbService, Transaction } from '../../services/db.service';
import { MenuService } from '../../services/menu.service';
import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { TransactionEditDialogComponent } from '../../components/transaction-edit-dialog/transaction-edit-dialog.component';
import { startOfMonth, endOfMonth, format } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MonthPickerComponent, TransactionEditDialogComponent],
  template: `
    <div class="dashboard">
      <div class="top-actions">
        <button class="menu-button" (click)="toggleMenu()">
          <span class="material-icons">menu</span>
        </button>
        <app-month-picker
          [currentMonth]="currentMonth"
          (monthChange)="onMonthChange($event)"
        />
        <button class="refresh-button" (click)="loadTransactions()">
          <span class="material-icons">refresh</span>
        </button>
      </div>

      <div class="overview card">
        <div class="stat-item">
          <span class="label">Income</span>
          <span class="amount">{{ totalIncome | number:'1.0-2' }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Expense</span>
          <span class="amount">{{ totalExpense | number:'1.0-2' }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Balance</span>
          <span class="amount">
            {{ balance | number:'1.0-2' }}
          </span>
        </div>
      </div>

      <div class="transactions">
        <div class="transaction-list">
          <div *ngFor="let group of transactionGroups" class="transaction-group card">
            <div class="date-header">
              <span>{{ group.date | date: 'MM/dd E' }}</span>
              <span class="total">
                <span *ngIf="group.totalIncome > 0">Income: {{ group.totalIncome | number:'1.0-2' }}</span>
                &nbsp;&nbsp;
                <span *ngIf="group.totalExpense > 0">Expense: {{ group.totalExpense | number:'1.0-2' }}</span>
              </span>
            </div>
            <div *ngFor="let transaction of group.transactions" 
                 class="transaction-item"
                 (click)="editTransaction(transaction)">
              <span class="material-symbols-rounded" [class]="transaction.type">
                {{ getCategoryIcon(transaction.categoryId) }}
              </span>
              <div class="transaction-details">
                <span class="time">{{ transaction.date | date: 'shortTime' }}</span>
                <span class="memo">{{ transaction.memo ? transaction.memo : getCategoryName(transaction.categoryId) }}</span>
              </div>
              <span class="amount" [class]="transaction.type">
                {{ transaction.type === 'income' ? '' : '-' }}{{ transaction.amount | number:'1.0-2' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <a routerLink="/add-transaction" class="fab">
        <span class="material-icons">add</span>
      </a>

      @if (selectedTransaction) {
        <app-transaction-edit-dialog
          [transaction]="selectedTransaction"
          (save)="onTransactionSave($event)"
          (delete)="onTransactionDelete()"
          (cancel)="closeEditDialog()"
        />
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .top-actions {
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
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .menu-button:hover, .refresh-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    @media (min-width: 769px) {
      .menu-button {
        display: none;
      }
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
      gap: 0.2rem;
      position: relative;
    }

    .stat-item:not(:last-child)::after {
      content: '|';
      position: absolute;
      right: -0.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: #ccc;
    }

    .label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .overview .amount {
      color: #333333;
    }

    .transaction-list {
      display: flex;
      flex-direction: column;
    }

    .transaction-list .card {
      padding: 0 !important;
    }

    .date-header {
      display: flex;
      justify-content: space-between;
      padding: 1rem 1rem 0.5rem 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      border-bottom: 1px solid #f5f5f5;
    }

    .transaction-item {
      display: flex;
      align-items: self-end;
      gap: 1rem;
      padding: 0.1rem 1rem 0.8rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f5f5f5;
      font-size: 0.875rem;
    }

    .transaction-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-details .time {
      display: block;
      font-size: 0.65rem;
      color: #999;
      margin-top: 0.25rem;
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
  categories: any[] = [];
  transactionGroups: any[] = [];
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  selectedTransaction: Transaction | null = null;

  constructor(
    private dbService: DbService,
    private menuService: MenuService
  ) {}

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
    
    const transactions = await this.dbService.getTransactions(startDate, endDate);
    this.transactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

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
    const groups = new Map();

    this.transactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: transaction.date,
          transactions: [],
          totalIncome: 0,
          totalExpense: 0
        });
      }

      const group = groups.get(dateKey);
      group.transactions.push(transaction);
      
      if (transaction.type === 'income') {
        group.totalIncome += transaction.amount;
      } else {
        group.totalExpense += transaction.amount;
      }
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

  onMonthChange(month: string) {
    this.currentMonth = month;
    this.loadTransactions();
  }

  editTransaction(transaction: Transaction) {
    this.selectedTransaction = { ...transaction };
  }

  async onTransactionSave(transaction: Transaction) {
    await this.dbService.updateTransaction(transaction);
    await this.loadTransactions();
    this.closeEditDialog();
  }

  async onTransactionDelete() {
    if (this.selectedTransaction) {
      await this.dbService.deleteTransaction(this.selectedTransaction.id!);
      await this.loadTransactions();
      this.closeEditDialog();
    }
  }

  closeEditDialog() {
    this.selectedTransaction = null;
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }
}