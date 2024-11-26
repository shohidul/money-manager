import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction, IncomeCategory, ExpenseCategory } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Add Transaction</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="description">Description</label>
          <input
            type="text"
            id="description"
            class="form-control"
            [(ngModel)]="transaction.description"
            name="description"
            required
          />
        </div>
        <div class="form-group">
          <label for="amount">Amount</label>
          <input
            type="number"
            id="amount"
            class="form-control"
            [(ngModel)]="transaction.amount"
            name="amount"
            required
          />
        </div>
        <div class="form-group">
          <label for="type">Type</label>
          <select
            id="type"
            class="form-control"
            [(ngModel)]="transaction.type"
            name="type"
            (change)="onTypeChange()"
            required
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div class="form-group">
          <label for="category">Category</label>
          <select
            id="category"
            class="form-control"
            [(ngModel)]="transaction.category"
            name="category"
            required
          >
            <option *ngFor="let category of availableCategories" [value]="category">
              {{ formatCategory(category) }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Add Transaction</button>
      </form>
    </div>
  `
})
export class TransactionFormComponent {
  transaction: Partial<Transaction> = {
    description: '',
    amount: 0,
    type: 'expense',
    category: 'food'
  };

  incomeCategories: IncomeCategory[] = ['salary', 'freelance', 'investments', 'gifts', 'other_income'];
  expenseCategories: ExpenseCategory[] = ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'health', 'other_expense'];

  @Output() addTransaction = new EventEmitter<Transaction>();

get availableCategories(): (IncomeCategory | ExpenseCategory)[] {
  return this.transaction.type === 'income' ? this.incomeCategories : this.expenseCategories;
}


  onTypeChange() {
    this.transaction.category = this.transaction.type === 'income' ? 'salary' : 'food';
  }

  formatCategory(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onSubmit() {
    const newTransaction: Transaction = {
      id: Date.now(),
      description: this.transaction.description!,
      amount: this.transaction.amount!,
      type: this.transaction.type!,
      category: this.transaction.category!,
      date: new Date()
    };

    this.addTransaction.emit(newTransaction);
    this.transaction = {
      description: '',
      amount: 0,
      type: 'expense',
      category: 'food'
    };
  }
}