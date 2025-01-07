import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../shared/translate.pipe';
import { FuelTransaction } from '../../models/transaction-types';
import { TranslateNumberPipe } from "../shared/translate-number.pipe";
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-fuel-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslateNumberPipe],
  template: `
    <div class="form-fields">
      <div class="form-group">
        <label for="odometerReading">{{ 'fuel.odometerReading' | translate }}</label>
        <input
          id="odometerReading"
          type="text"
          class="form-input"
          [ngModel]="getOdometerReading() | translateNumber"
          (input)="onOdometerReadingInput($event)"
          placeholder="{{ '00.0' | translateNumber }}"
        />
      </div>
      <div class="form-group">
        <label for="fuelQuantity">{{ 'fuel.fuelQuantity' | translate }}</label>
        <input
          id="fuelQuantity"
          type="text"
          class="form-input"
          [ngModel]="getFuelQuantity() | translateNumber"
          (input)="onFuelQuantityInput($event)"
          placeholder="{{ '00.0' | translateNumber }}"
        />
      </div>

      <div class="form-group">
        <label for="fuelType">{{ 'fuel.fuelType' | translate }}</label>
        <select
          id="fuelType"
          [(ngModel)]="transaction.fuelType"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
          <option value="Octen">{{ 'fuel.types.octen' | translate }}</option>
          <option value="Petrol">{{ 'fuel.types.petrol' | translate }}</option>
          <option value="Diesel">{{ 'fuel.types.diesel' | translate }}</option>
          <option value="Electric">{{ 'fuel.types.electric' | translate }}</option>
          <option value="Other">{{ 'fuel.types.other' | translate }}</option>
        </select>
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
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 1rem;
    }
  `]
})
export class FuelFormComponent {
  @Input() transaction!: FuelTransaction;
  @Output() transactionChange = new EventEmitter<FuelTransaction>();

  constructor(private translationService: TranslationService) {}

  onChange() {
    this.transactionChange.emit(this.transaction);
  }

  getOdometerReading(): string {
    this.transaction.odometerReading = this.transaction.odometerReading || 0;
    return this.transaction.odometerReading.toString() || '';
  }

  onOdometerReadingInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawInput = inputElement?.value || '';
  
    // Remove commas to make it a parseable string
    const parseableString = rawInput.replace(/,/g, '');
  
    // Convert to english numbers before saving
    const result = new TranslateNumberPipe(this.translationService).transformByLocale(parseableString, 'en');
  
    this.transaction.odometerReading = parseFloat(result) || 0;
    this.transactionChange.emit(this.transaction);
  }

  getFuelQuantity(): string {
    this.transaction.fuelQuantity = this.transaction.fuelQuantity || 0;
    return this.transaction.fuelQuantity.toString() || '';
  }

  onFuelQuantityInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawInput = inputElement?.value || '';
  
    // Remove commas to make it a parseable string
    const parseableString = rawInput.replace(/,/g, '');
  
    // Convert to english numbers before saving
    const result = new TranslateNumberPipe(this.translationService).transformByLocale(parseableString, 'en');
  
    this.transaction.fuelQuantity = parseFloat(result) || 0;
    this.transactionChange.emit(this.transaction);
  }
}