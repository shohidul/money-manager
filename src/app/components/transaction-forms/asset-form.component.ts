import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../shared/translate.pipe';
import { AssetTransaction } from '../../models/transaction-types';
import { AssetService } from '../../services/asset.service';
import { AutocompleteInputComponent } from '../shared/autocomplete-input.component';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteInputComponent, TranslatePipe],
  template: `
    <div class="form-fields">
      <div class="form-group">
        <label for="assetName">{{ 'asset.name' | translate }}</label>
        <app-autocomplete-input
          id="assetName"
          type="text"
          [(value)]="transaction.assetName"
          (inputChange)="onAssetNameChange($event)"
          [suggestions]="suggestions"
          [required]="true"
          inputClass="form-input"
        />
      </div>
      
      <div class="form-group">
        <label for="transactionDate">{{ 'asset.transactionDate' | translate }}</label>
        <input
          type="date"
          id="transactionDate"
          [ngModel]="transaction.transactionDate | date:'yyyy-MM-dd'"
          (ngModelChange)="onTransactionDateChange($event)"
          class="form-input"
          required
        >
      </div>

      <div class="form-group">
        <label for="currentValue">{{ 'asset.currentValue' | translate }}</label>
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
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
    }
  `]
})
export class AssetFormComponent {
  @Input() transaction!: AssetTransaction;
  @Output() transactionChange = new EventEmitter<AssetTransaction>();

  suggestions: string[] = [];
  private lastQuery = '';

  constructor(private assetService: AssetService) {}

  async onAssetNameChange(value: string) {
    if (value !== this.lastQuery) {
      this.lastQuery = value;
      this.suggestions = await this.assetService.getAssetSuggestions(value);
    }
    this.onChange();
  }

  onTransactionDateChange(dateStr: string) {
    this.transaction.transactionDate = new Date(dateStr);
    this.onChange();
  }

  onChange() {
    this.transactionChange.emit(this.transaction);
  }
}