import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../shared/translate.pipe';
import { AssetTransaction } from '../../models/transaction-types';
import { AssetService } from '../../services/asset.service';
import { AutocompleteInputComponent } from '../shared/autocomplete-input.component';
import { TranslateNumberPipe } from "../shared/translate-number.pipe";
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteInputComponent, TranslatePipe, TranslateNumberPipe],
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
      <div class="form-inline">
        <div class="form-group">
          <label for="quantity">{{ 'asset.quantity' | translate }}</label>
          <input
            id="quantity"
            type="text"
            class="form-input"
            [ngModel]="getQuantity() | translateNumber"
            (input)="onQuantityInput($event)"
            placeholder="{{ '00.0' | translateNumber }}"
          />
        </div>
        <div class="form-group">
          <label for="measurementUnit">{{ 'asset.measurementUnit' | translate }}</label>
          <select
            id="measurementUnit"
            [(ngModel)]="transaction.measurementUnit"
            (ngModelChange)="onChange()"
            class="form-input"
            required
          >
            <option value="asset.units.gram">{{ 'asset.units.gram' | translate }}</option>
            <option value="asset.units.kg">{{ 'asset.units.kg' | translate }}</option>
            <option value="asset.units.ton">{{ 'asset.units.ton' | translate }}</option>
            <option value="asset.units.carats">{{ 'asset.units.carats' | translate }}</option>
            <option value="asset.units.tola">{{ 'asset.units.tola' | translate }}</option>
            <option value="asset.units.ounce">{{ 'asset.units.ounce' | translate }}</option>
            <option value="asset.units.acre">{{ 'asset.units.acre' | translate }}</option>
            <option value="asset.units.hectare">{{ 'asset.units.hectare' | translate }}</option>
            <option value="asset.units.squareMeter">{{ 'asset.units.squareMeter' | translate }}</option>
            <option value="asset.units.sqft">{{ 'asset.units.sqft' | translate }}</option>
            <option value="asset.units.sqyd">{{ 'asset.units.sqyd' | translate }}</option>
            <option value="asset.units.plot">{{ 'asset.units.plot' | translate }}</option>
            <option value="asset.units.katha">{{ 'asset.units.katha' | translate }}</option>
            <option value="asset.units.bigha">{{ 'asset.units.bigha' | translate }}</option>
            <option value="asset.units.shares">{{ 'asset.units.shares' | translate }}</option>
            <option value="asset.units.piece">{{ 'asset.units.piece' | translate }}</option>
            <option value="asset.units.unit">{{ 'asset.units.unit' | translate }}</option>
            <option value="asset.units.liters">{{ 'asset.units.liters' | translate }}</option>
            <option value="asset.units.ml">{{ 'asset.units.ml' | translate }}</option>
            <option value="asset.units.gallon">{{ 'asset.units.gallon' | translate }}</option>
            <option value="asset.units.meter">{{ 'asset.units.meter' | translate }}</option>
            <option value="asset.units.barrel">{{ 'asset.units.barrel' | translate }}</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-inline {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-grow: 1;
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

  constructor(private assetService: AssetService, private translationService: TranslationService) {}

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

  getQuantity(): string {
    this.transaction.quantity = this.transaction.quantity || 0;
    return this.transaction.quantity.toString() || '';
  }

  onQuantityInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawInput = inputElement?.value || '';
  
    // Remove commas to make it a parseable string
    const parseableString = rawInput.replace(/,/g, '');
  
    // Convert to english numbers before saving
    const result = new TranslateNumberPipe(this.translationService).transformByLocale(parseableString, 'en');
  
    this.transaction.quantity = parseFloat(result) || 0;
    this.transactionChange.emit(this.transaction);
  }
}