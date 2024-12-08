import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LendBorrowTransaction } from '../../models/transaction-types';

@Component({
  selector: 'app-lend-borrow-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-fields">
      <div class="form-group">
        <label for="personName">Person/Entity Name</label>
        <input
          type="text"
          id="personName"
          [(ngModel)]="transaction.personName"
          (ngModelChange)="onChange()"
          class="form-input"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          [ngModel]="transaction.dueDate | date:'yyyy-MM-dd'"
          (ngModelChange)="onDueDateChange($event)"
          class="form-input"
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
export class LendBorrowFormComponent {
  @Input() transaction!: LendBorrowTransaction;
  @Output() transactionChange = new EventEmitter<LendBorrowTransaction>();

  onChange() {
    this.transactionChange.emit(this.transaction);
  }

  onDueDateChange(date: string) {
    this.transaction.dueDate = date ? new Date(date) : undefined;
    this.onChange();
  }
}