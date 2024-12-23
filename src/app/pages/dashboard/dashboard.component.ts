import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Category, DbService } from '../../services/db.service';
import {
  Transaction,
  isFuelTransaction,
  isLoanTransaction,
  isRepaidTransaction,
  isAssetTransaction,
} from '../../models/transaction-types';
import { MenuService } from '../../services/menu.service';
import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { TransactionEditDialogComponent } from '../../components/transaction-edit-dialog/transaction-edit-dialog.component';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { calculateMileage } from '../../utils/fuel.utils';
import { TranslatePipe } from '../../components/shared/translate.pipe';
import { TranslateDatePipe } from '../../components/shared/translate-date.pipe';
import { TranslateNumberPipe } from '../../components/shared/translate-number.pipe';
import { LoanService } from '../../services/loan.service';
import { LoanTransaction } from '../../models/loan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MonthPickerComponent,
    TransactionEditDialogComponent,
    TranslatePipe,
    TranslateDatePipe,
    TranslateNumberPipe
  ],
  template: `
    <div class="dashboard">
      <div class="top-actions card">
        <button class="menu-button" (click)="toggleMenu()">
          <span class="material-icons">menu</span>
        </button>
        <app-month-picker
          [currentMonth]="currentMonth"
          (monthChange)="onMonthChange($event)"
        />
        <button class="sync-button" (click)="loadTransactions()">
          <span class="material-icons">sync</span>
        </button>
      </div>

      <div class="overview card">
        <div class="stat-item">
          <span class="label">{{ 'dashboard.income' | translate }}</span>
          <span class="amount">{{ totalIncome | translateNumber:'1.0-2' }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'dashboard.expense' | translate }}</span>
          <span class="amount">{{ totalExpense | translateNumber:'1.0-2' }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'dashboard.balance' | translate }}</span>
          <span class="amount">
            {{ balance | translateNumber:'1.0-2' }}
          </span>
        </div>
      </div>
      <div class="transactions">
        <div class="transaction-list">
          <div *ngFor="let group of transactionGroups" class="transaction-group card">
            <div class="date-header">
              <span>{{ group.date | translateDate: 'MM/dd E' }}</span>
              <span class="total">
                <span *ngIf="group.totalIncome > 0">{{ 'dashboard.income' | translate }}: {{ group.totalIncome | translateNumber:'1.0-2' }}</span>
                <span *ngIf="group.totalExpense > 0">&nbsp;&nbsp;&nbsp;{{ 'dashboard.expense' | translate }}: {{ group.totalExpense | translateNumber:'1.0-2' }}</span>
              </span>
            </div>
            <div *ngFor="let tx of group.transactions" 
                 class="transaction-item"
                 (click)="editTransaction(tx)">
              <span class="material-symbols-rounded" [class]="tx.type">
                {{ getCategoryIcon(tx.categoryId) }}
              </span>
              <div class="transaction-details">
                <span class="small-text">{{ tx.date | translateDate: 'shortTime' }}</span>
                <span class="memo">{{ tx.memo ? tx.memo : getCategoryName(tx.categoryId) | translate }}</span>

                @if (isAssetTransaction(tx)) {
                  <span class="small-text">
                    {{ tx.assetName || 'N/A' }}
                  </span>
                }

                @if (isLoanTransaction(tx)) {
                  <span class="small-text">
                    {{ tx.personName || 'Unnamed' }} | 
                    {{ 'loan.dueDate' | translate }}: {{ tx.dueDate ? (tx.dueDate | translateDate: 'shortDate') : 'N/A' }} |
                    {{ 'loan.'+(tx.status || 'pending')  | translate  }} 
                  </span>
                }

                @if (isRepaidTransaction(tx)) {
                  <span class="small-text">
                    <ng-container *ngIf="getParentLoan(tx.parentId) as parentLoan">
                      {{ (tx.type === 'income' ? 'loan.lentTo' : 'loan.borrowedFrom') | translate }} {{ parentLoan?.personName ?? 'Unnamed' }} | 
                      {{ parentLoan?.amount ?? 0 | translateNumber }} | 
                      {{ 'loan.dueDate' | translate }}: 
                      {{
                        parentLoan.dueDate 
                          ? (parentLoan.dueDate | translateDate: 'shortDate') 
                          : 'N/A'
                      }} |
                      {{ 'loan.'+(parentLoan.status || 'pending') | translate }}
                    </ng-container>
                  </span>
                }

                @if (isFuelTransaction(tx)) {
                  <span class="small-text">
                    {{ tx.fuelType || '' }}
                    {{ tx.fuelQuantity || 0 }} {{ 'fuel.L' | translate }} | 
                    {{ 'fuel.odo' | translate }} {{ tx.odometerReading || 0 }} {{ 'fuel.km' | translate }} | 
                    {{ 'fuel.mileage' | translate }} {{ (getMileage(tx) || 0) | translateNumber:'1.1-1' }} {{ 'fuel.kmPerLiter' | translate }}
                  </span>
                }

              </div>
              <span class="amount">
                {{ tx.type === 'income' ? '' : '-' }}{{ tx.amount | translateNumber:'1.0-2' }}
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
          [category]="selectedTransactionCategory"
          (save)="onTransactionSave($event)"
          (delete)="onTransactionDelete()"
          (cancel)="closeEditDialog()"
        />
      }
    </div>
  `,

  styles: [
    `
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
    position: sticky;
    top: -16px;
    z-index: 100;
  }

  .menu-button, .sync-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-button:hover, .sync-button:hover {
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
    align-items: center;
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

  .transaction-details .small-text {
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
`,
  ],
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
  selectedTransactionCategory: any | null = null; 
  isFuelTransaction = isFuelTransaction;
  isLoanTransaction = isLoanTransaction;
  isRepaidTransaction = isRepaidTransaction;
  isAssetTransaction = isAssetTransaction;
  parentLoanTransactions: LoanTransaction[] = [];

  constructor(private router: Router, private dbService: DbService, private menuService: MenuService, private loanService: LoanService) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.loadTransactions();

    this.parentLoanTransactions = await this.loanService.getLoanTransactions();
  }

   getParentLoan(id: number | undefined): LoanTransaction | null {
    try {
      const transactions = this.parentLoanTransactions;
      const parentLoan = transactions.find(tx => tx.id === id);
      
      if (!parentLoan) {
        return null;
      }
      
      return parentLoan;
    } catch (error) {
      console.error('Error fetching parent loan:', error);
      throw error;
    }
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async loadTransactions() {
    const date = new Date(this.currentMonth);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    const transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    this.transactions = transactions.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    this.calculateTotals();
    this.groupTransactions();
  }

  calculateTotals() {
    this.totalIncome = this.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.balance = this.totalIncome - this.totalExpense;
  }

  groupTransactions() {
    const groups = new Map();

    this.transactions.forEach((transaction) => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: transaction.date,
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
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

    this.transactionGroups = Array.from(groups.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  getCategoryIcon(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category?.icon || 'help';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  getCategory(categoryId: number): Category | null {
    const category = this.categories.find((c) => c.id === categoryId);
    return category || null;
  }

  onMonthChange(month: string) {
    this.currentMonth = month;
    this.loadTransactions();
  }

  editTransaction(transaction: Transaction) {
    // if (transaction.subType === 'none') {
    //   this.navigateToEdit(transaction);
    // } else {
      this.selectedTransaction = { ...transaction };
      this.selectedTransactionCategory = this.getCategory(transaction.categoryId);
    // }
  }

  navigateToEdit(transaction: Transaction) {
    this.router.navigate(['/add-transaction'], {
      queryParams: {
        type: transaction.type,
        subType: transaction.subType,
        editedTransaction: JSON.stringify(transaction)
      }
    });
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

  getMileage(currentTransaction: Transaction): number {
    if (!isFuelTransaction(currentTransaction)) return 0;

    const prevTransaction = this.transactions
      .filter(isFuelTransaction)
      .filter((t) => t.date < currentTransaction.date)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    if (!prevTransaction) return 0;

    return calculateMileage(currentTransaction, prevTransaction);
  }
}