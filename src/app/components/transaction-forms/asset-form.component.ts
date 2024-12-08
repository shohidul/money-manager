import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetTransaction } from '../../models/transaction-types';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-fields">
      <div class="form-group">
        <label for="assetName">Asset Name</label>
        <input
          type="text"
          id="assetName"
          [(ngModel)]="transaction.assetName"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="purchaseDate">Purchase Date</label>
        <input
          type="date"
          id="purchaseDate"
          [ngModel]="transaction.purchaseDate | date:'yyyy-MM-dd'"
          (ngModelChange)="onPurchaseDateChange($event)"
          class="form-input"
          required
        >
      </div>

      <div class="form-group">
        <label for="currentValue">Current Value</label>
        <input
          type="number"
          id="currentValue"
          [(ngModel)]="transaction.currentValue"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
      </div>
    </div>
  `,
  styles: [`
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-input {
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      font-size: 1rem;
    }
  `]
})
export class AssetFormComponent {
  @Input() transaction!: AssetTransaction;
  @Output() transactionChange = new EventEmitter<AssetTransaction>();

  onChange() {
    this.transactionChange.emit(this.transaction);
  }

  onPurchaseDateChange(date: string) {
    this.transaction.purchaseDate = new Date(date);
    this.onChange();
  }
}