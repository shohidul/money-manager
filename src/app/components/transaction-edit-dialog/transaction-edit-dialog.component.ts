import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction, isLendBorrowTransaction, isAssetTransaction, isFuelTransaction } from '../../models/transaction-types';
import { LendBorrowFormComponent } from '../transaction-forms/lend-borrow-form.component';
import { AssetFormComponent } from '../transaction-forms/asset-form.component';
import { FuelFormComponent } from '../transaction-forms/fuel-form.component';

@Component({
  selector: 'app-transaction-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LendBorrowFormComponent,
    AssetFormComponent,
    FuelFormComponent
  ],
  template: `
    <div class="dialog-overlay">
      <div class="dialog-content">
        <h2>Edit Transaction</h2>
        
        <div class="form-group">
          <label for="memo">Memo</label>
          <input
            type="text"
            id="memo"
            [(ngModel)]="editedTransaction.memo"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="amount">Amount</label>
          <input
            type="number"
            id="amount"
            [(ngModel)]="editedTransaction.amount"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input
            type="datetime-local"
            id="date"
            [ngModel]="editedTransaction.date | date:'yyyy-MM-ddTHH:mm'"
            (ngModelChange)="onDateChange($event)"
            class="form-input"
          >
        </div>

        @if (isLendBorrowTransaction(editedTransaction)) {
          <app-lend-borrow-form
            [transaction]="editedTransaction"
            (transactionChange)="onTransactionChange($event)"
          />
        }

        @if (isAssetTransaction(editedTransaction)) {
          <app-asset-form
            [transaction]="editedTransaction"
            (transactionChange)="onTransactionChange($event)"
          />
        }

        @if (isFuelTransaction(editedTransaction)) {
          <app-fuel-form
            [transaction]="editedTransaction"
            (transactionChange)="onTransactionChange($event)"
          />
        }

        <div class="dialog-actions">
          <button class="delete-button" (click)="onDelete()">Delete</button>
          <div class="right-actions">
            <button class="cancel-button" (click)="onCancel()">Cancel</button>
            <button class="save-button" (click)="onSave()">Save</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      padding: 1.5rem;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }

    .right-actions {
      display: flex;
      gap: 0.5rem;
    }

    .delete-button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background: #f44336;
      color: white;
      cursor: pointer;
    }

    .cancel-button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .save-button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: white;
      cursor: pointer;
    }
  `,
  ],
})
export class TransactionEditDialogComponent {
  @Input() transaction!: Transaction;
  @Output() save = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  editedTransaction!: Transaction;

  ngOnInit() {
    this.editedTransaction = { ...this.transaction };
  }

  onDateChange(value: string) {
    this.editedTransaction.date = new Date(value);
  }

  onTransactionChange(transaction: Transaction) {
    this.editedTransaction = { ...transaction };
  }

  onSave() {
    this.save.emit(this.editedTransaction);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.delete.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}