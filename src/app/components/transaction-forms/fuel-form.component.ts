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
      <div class="form-inline">
        <div class="form-group">
          <label for="odometerReading">{{ 'fuel.odometerReading' | translate }}</label>
          <input
            id="odometerReading"
            type="text"
            class="form-input"
            [ngModel]="getOdometerReading() | translateNumber :'1.0-0' :false"
            (input)="onOdometerReadingInput($event)"
            placeholder="{{ '0' | translateNumber }}"
          />
        </div>
        <div class="form-group">
          <label for="fuelQuantity">{{ 'fuel.fuelQuantity' | translate }}</label>
          <input
            id="fuelQuantity"
            type="text"
            class="form-input"
            [ngModel]="getFuelQuantity() | translateNumber :'1.0-2' :false"
            (input)="onFuelQuantityInput($event)"
            placeholder="{{ '0.00' | translateNumber }}"
          />
        </div>
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
      margin-bottom: 1rem;
      background: var(--background-color);
      border-radius: 8px;
      padding: 16px;
    }

    .form-inline {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
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

  currentLanuage = '';

  constructor(private translationService: TranslationService) {}

  ngOnInit(){
    this.currentLanuage = this.translationService.getCurrentLanguage();
  }

  onChange() {
    this.transactionChange.emit(this.transaction);
  }

  getOdometerReading(): string {
    this.transaction.odometerReading = this.transaction.odometerReading || 0;
    return this.transaction.odometerReading.toString() || '';
  }

  onOdometerReadingInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let rawInput = inputElement?.value || '';

    if(this.currentLanuage !== 'en'){
      rawInput = new TranslateNumberPipe(this.translationService).transformByLocale(rawInput, 'en', '1.0-0', false);
    }    

    // Remove all non-numeric characters
    rawInput = rawInput.replace(/\D/g, '');
    
    this.transaction.odometerReading = parseInt(rawInput) || 0;
    this.transactionChange.emit(this.transaction);
  
    if(this.currentLanuage !== 'en'){
      rawInput = new TranslateNumberPipe(this.translationService).transformByLocale(rawInput, this.currentLanuage, '1.0-0', false);
    }

    // Update input field to reflect the changes
    inputElement.value = rawInput;
  }
  

  getFuelQuantity(): string {
    this.transaction.fuelQuantity = this.transaction.fuelQuantity || 0;
    return this.transaction.fuelQuantity.toString() || '';
  }

  onFuelQuantityInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let rawInput = inputElement?.value || '';

    if(this.currentLanuage !== 'en'){
      rawInput = new TranslateNumberPipe(this.translationService).transformByLocale(rawInput, 'en', '1.0-0', false);
    }    
  
    // Allow only numbers and one decimal point
    rawInput = rawInput.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point exists
    const parts = rawInput.split('.');
    if (parts.length > 2){
      rawInput = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      rawInput = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    this.transaction.fuelQuantity = parseFloat(rawInput) || 0;
    this.transactionChange.emit(this.transaction);

    if(this.currentLanuage !== 'en'){
      rawInput = new TranslateNumberPipe(this.translationService).transformByLocale(rawInput, this.currentLanuage, '1.0-0', false);
    }

    // Update input field to reflect the changes
    inputElement.value = rawInput;
  }
}