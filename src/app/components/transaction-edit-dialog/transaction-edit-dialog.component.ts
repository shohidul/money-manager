import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Transaction, isLoanTransaction, isAssetTransaction, isFuelTransaction } from '../../models/transaction-types';
import { LoanFormComponent } from '../transaction-forms/loan-form.component';
import { AssetFormComponent } from '../transaction-forms/asset-form.component';
import { FuelFormComponent } from '../transaction-forms/fuel-form.component';

@Component({
  selector: 'app-transaction-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LoanFormComponent,
    AssetFormComponent,
    FuelFormComponent
  ],
  template: `
    <div class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>Edit Transaction</h2>
          <button class="edit-full-button" (click)="onEditFull()">
            Edit More
            <span class="material-icons">chevron_right</span>
          </button>
        </div>

        @if (isLoanTransaction(editedTransaction)) {
          <app-loan-form
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
  styles: [`
  
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
      padding: 3.5rem;
      width: 60%;
      height: 85%;
      max-height: 90vh;
      overflow-y: auto;
      display: flex
  ;
      flex-direction: column;
      justify-content: space-between;
    }

    @media (max-width: 768px) {
      .dialog-content {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100vh;
      }
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

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .edit-full-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
    }
  `]
})
export class TransactionEditDialogComponent {
  @Input() transaction!: Transaction;
  @Output() save = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  editedTransaction!: Transaction;
  isLoanTransaction = isLoanTransaction;
  isAssetTransaction = isAssetTransaction;
  isFuelTransaction = isFuelTransaction;

  constructor(private router: Router) {}

  ngOnInit() {
    this.editedTransaction = { ...this.transaction };
  }

  onTransactionChange(transaction: Transaction) {
    this.editedTransaction = { ...transaction };
  }

  onEditFull() {
    this.router.navigate(['/add-transaction'], {
      queryParams: {
        type: this.transaction.type,
        subType: this.transaction.subType,
        editedTransaction: JSON.stringify(this.transaction)
      }
    });
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