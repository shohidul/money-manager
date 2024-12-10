import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuelTransaction } from '../../models/transaction-types';

@Component({
  selector: 'app-fuel-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-fields">
      <div class="form-group">
        <label for="odometerReading">Odometer Reading</label>
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
        <label for="fuelQuantity">Fuel Quantity</label>
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
        <label for="fuelType">Fuel Type</label>
        <select
          id="fuelType"
          [(ngModel)]="transaction.fuelType"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
          <option value="Octen">Octen</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Other">Other</option>
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
      border: 1px solid rgba(0, 0, 0, 0.12);
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