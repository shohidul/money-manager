import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../shared/translate.pipe';
import { FuelTransaction } from '../../models/transaction-types';

@Component({
  selector: 'app-fuel-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="form-fields">
      <div class="form-group">
        <label for="odometerReading">{{ 'fuel.odometerReading' | translate }}</label>
        <input
          type="number"
          id="odometerReading"
          [(ngModel)]="transaction.odometerReading"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="fuelQuantity">{{ 'fuel.fuelQuantity' | translate }}</label>
        <input
          type="number"
          id="fuelQuantity"
          [(ngModel)]="transaction.fuelQuantity"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
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

  onChange() {
    this.transactionChange.emit(this.transaction);
  }
}