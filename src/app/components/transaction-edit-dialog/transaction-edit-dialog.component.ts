import { Component, Inject, Input, Output, EventEmitter, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Transaction, isLoanTransaction, isRepaidTransaction, isAssetTransaction, isFuelTransaction } from '../../models/transaction-types';
import { AssetFormComponent } from '../transaction-forms/asset-form.component';
import { LoanFormComponent } from '../transaction-forms/loan-form.component';
import { FuelFormComponent } from '../transaction-forms/fuel-form.component';
import { Category } from '../../services/db.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { TranslateDatePipe } from '../shared/translate-date.pipe';
import { TranslateNumberPipe } from "../shared/translate-number.pipe";
import { FeatureFlagService } from '../../services/feature-flag.service';

@Component({
  selector: 'app-transaction-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AssetFormComponent,
    LoanFormComponent,
    FuelFormComponent,
    TranslatePipe,
    TranslateDatePipe,
    TranslateNumberPipe
],
  template: `
    @if (show) {
      <div class="dialog-overlay" (click)="onOverlayClick($event)">
        <div class="dialog-content">
          <div class="dialog-header">
            <h2>{{ 'transaction.title.edit' | translate }}</h2>
            <button class="edit-full-button" (click)="onEditFull()">
              @if (editedTransaction.subType === 'none' || !isAdvancedMode) {
                {{ 'transaction.edit.edit' | translate }}
              } @else {
                {{ 'transaction.edit.editFull' | translate }}
              }
              <span class="material-icons">chevron_right</span>
            </button>
          </div>

          <div class="dialog-body">
            <div class="dialog-content-grid" [class.no-form]="editedTransaction.subType === 'none'">
              @if (editedTransaction.subType === 'none' || !isAdvancedMode) {
                <div class="transaction-summary-column">
                  <div class="summary-item category-item">
                    <div class="category-content">
                      <span class="material-symbols-rounded category-icon" [class]="editedTransaction.type">{{ category.icon }}</span>
                      <div class="category-details">
                        <span class="label">{{ 'transaction.types.' + editedTransaction.type | translate }}</span>
                        <span class="category-name">{{ category.name | translate }}</span>
                        <span class="meta-info">{{ editedTransaction.memo || ('common.noMemo' | translate) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="summary-item type-item">
                    <span class="label">
                      <span class="material-icons">event</span>
                      {{ 'common.date' | translate }}
                    </span>
                    <span class="value">{{ editedTransaction.date | translateDate:'short' }}</span>
                  </div>
                  <div class="summary-item amount-item">
                    <span class="label">
                      <span class="material-icons">attach_money</span>
                      {{ 'common.amount' | translate }}
                    </span>
                    <span class="value">{{ editedTransaction.amount | translateNumber:'1.0-2' }}</span>
                  </div>
                  <div class="summary-item memo-item">
                    <span class="label">
                      <span class="material-icons">notes</span>
                      {{ 'common.memo' | translate }}
                    </span>
                    <span class="value">{{ editedTransaction.memo || ('common.noMemo' | translate) }}</span>
                  </div>
                </div>
              } @else {
                <div class="form-container">
                  <div class="summary-item category-item compact">
                    <div class="category-content">
                      <span class="material-symbols-rounded category-icon" [class]="editedTransaction.type">{{ category.icon }}</span>
                      <div class="category-details">
                        <span class="label">{{ 'transaction.types.' + editedTransaction.type | translate }} | {{ 'transaction.subTypes.' + editedTransaction.subType | translate }}</span>
                        <span class="category-name">{{ category.name | translate }}</span>
                        <span class="meta-info">{{ editedTransaction.memo || ('common.noMemo' | translate) }} | {{ editedTransaction.date | translateDate:'short'}}</span>
                      </div>
                    </div>
                    <span class="value">{{ editedTransaction.amount | translateNumber:'1.0-2' }}</span>
                  </div>

                  <div class="form-content">
                    @if (isLoanTransaction(editedTransaction) || isRepaidTransaction(editedTransaction)) {
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
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="dialog-actions">
            <button class="delete-button" (click)="onDelete()">
              {{ 'common.delete' | translate }}
            </button>
            <div class="right-actions">
              <button class="cancel-button" (click)="onCancel()">
                {{ 'common.cancel' | translate }}
              </button>
              @if(isAdvancedMode) {
                <button class="save-button" (click)="onSave()">
                  {{ 'common.save' | translate }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--background-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog-content {
      background-color: var(--surface-color);
      padding: 2.5rem;
      width: 60%;
      height: 85%;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
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
      border: 1px solid var(--border-color);
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
      background: var(--text-danger);
      color: white;
      cursor: pointer;
    }

    .cancel-button {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background: var(--background-color-hover);
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
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    @media (max-width: 768px) {
      .dialog-header h2 {
        font-size: 1.2rem;
      }

      .dialog-body {
        padding: 16px 0 !important;
      }

      .form-content {
        border-radius: 0;
      }

      .category-item {
        border-radius: 0;
      }
    }

    .edit-full-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }

    .edit-full-button .material-icons {
      color: white;
    }

    .dialog-body {
      padding: 16px;
    }

    .dialog-content-grid {
      display: grid;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dialog-content-grid.no-form {
      grid-template-columns: minmax(300px, 600px);
      justify-content: center;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-content {
      background: var(--background-color);
      border-radius: 8px;
      padding: 16px;
    }

    .transaction-summary-column {
      display: grid;
      grid-template-rows: auto repeat(3, 1fr);
      gap: 12px;
    }

    .transaction-form-column {
      display: flex;
      flex-direction: column;
    }

    .summary-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--background-color);
      border-radius: 8px;
      padding: 16px;
      transition: background-color 0.3s ease;
    }

    .label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9em;
    }

    .value {
      font-weight: 500;
      color: var(--text-primary);;
      text-align: right;
    }

    .material-icons {
      font-size: 20px;
      color: #888;
    }

    .category-item {
      padding: 24px !important;
    }

    .category-item.compact {
      padding: 16px !important;
      margin-bottom: 16px;
    }

    .category-item.compact .category-icon {
      font-size: 24px !important;
      padding: 8px;
    }

    .category-item.compact .category-details {
      gap: 2px;
    }

    .meta-info {
      font-size: 0.9em;
      color: #666;
    }

    .category-content {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .category-icon {
      font-size: 32px !important;
      padding: 12px;
      background: var(--background-color-hover);
      border-radius: 50%;
    }

    .category-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-name {
      font-size: 1.2em;
      font-weight: 600;
      color: var(--text-primary);
    }

    @media (max-width: 768px) {
      .dialog-content-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .dialog-content-grid.no-form {
        grid-template-columns: minmax(280px, 400px);
      }

      .category-item {
        padding: 16px !important;
      }

      .category-icon {
        font-size: 24px !important;
        padding: 8px;
      }
    }
  `]
})
export class TransactionEditDialogComponent implements OnInit {
  @Input() transaction!: Transaction;
  @Input() category!: Category;
  @Output() save = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  editedTransaction!: Transaction;
  isLoanTransaction = isLoanTransaction;
  isRepaidTransaction = isRepaidTransaction;
  isAssetTransaction = isAssetTransaction;
  isFuelTransaction = isFuelTransaction;
  show = true;
  isAdvancedMode: boolean = false;

  constructor(private router: Router, private featureFlagService: FeatureFlagService) {}

  ngOnInit() {
    this.featureFlagService.getAppMode().subscribe(
      isAdvanced => this.isAdvancedMode = isAdvanced
    );

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
    this.show = false;
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.delete.emit();
      this.show = false;
    }
  }

  onCancel() {
    this.cancel.emit();
    this.show = false;
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.onCancel();
    }
  }
}