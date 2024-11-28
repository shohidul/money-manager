import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculator-sheet">
      <div class="sheet-header">
        <div class="category-info">
          <span class="material-symbols-rounded">{{ categoryIcon }}</span>
          <input 
            type="text" 
            [(ngModel)]="memo" 
            (ngModelChange)="memoChange.emit($event)"
            placeholder="Add memo"
            class="memo-input"
          >
        </div>
        <div class="amount">{{ displayAmount }}</div>
      </div>

      <div class="keypad">
        <button *ngFor="let key of numericKeys" (click)="onKeyPress(key)" class="key">
          {{ key }}
        </button>
        <button (click)="onKeyPress('date')" class="key function-key">
          <span class="material-icons">event</span>
        </button>
        <button (click)="onKeyPress('+')" class="key operator-key">+</button>
        <button (click)="onKeyPress('-')" class="key operator-key">−</button>
        <button (click)="onKeyPress('=')" class="key equals-key">
          <span class="material-icons">{{ isCalculating ? 'done' : 'equals' }}</span>
        </button>
      </div>

      @if (showDatePicker) {
        <div class="date-picker">
          <input 
            type="date" 
            [value]="selectedDate | date:'yyyy-MM-dd'"
            (change)="onDateChange($event)"
            max="{{ today | date:'yyyy-MM-dd' }}"
          >
        </div>
      }
    </div>
  `,
  styles: [`
    .calculator-sheet {
      background: var(--surface-color);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      overflow: hidden;
    }

    .sheet-header {
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .memo-input {
      flex: 1;
      border: none;
      padding: 0.5rem;
      font-size: 1rem;
      background: none;
    }

    .memo-input:focus {
      outline: none;
    }

    .amount {
      font-size: 1.5rem;
      font-weight: 500;
      text-align: right;
    }

    .keypad {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: rgba(0, 0, 0, 0.08);
    }

    .key {
      padding: 1.25rem;
      border: none;
      background: white;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .key:active {
      background: rgba(0, 0, 0, 0.04);
    }

    .function-key {
      color: var(--text-secondary);
    }

    .operator-key {
      background: #f8f9fa;
      color: var(--primary-color);
    }

    .equals-key {
      background: var(--primary-color);
      color: white;
    }

    .date-picker {
      padding: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }

    .date-picker input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
    }
  `]
})
export class CalculatorSheetComponent {
  @Input() categoryIcon = 'help';
  @Input() initialAmount = '0';
  
  @Output() amountChange = new EventEmitter<number>();
  @Output() memoChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<Date>();
  @Output() save = new EventEmitter<void>();

  numericKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '⌫'];
  memo = '';
  amount = '0';
  operator = '';
  prevAmount = 0;
  isCalculating = false;
  showDatePicker = false;
  selectedDate = new Date();
  today = new Date();

  get displayAmount(): string {
    return Number(this.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onKeyPress(key: string) {
    switch (key) {
      case '⌫':
        this.amount = this.amount.slice(0, -1) || '0';
        break;
      case '+':
      case '-':
        this.operator = key;
        this.prevAmount = Number(this.amount);
        this.amount = '0';
        this.isCalculating = true;
        break;
      case '=':
        if (this.isCalculating) {
          const currentAmount = Number(this.amount);
          this.amount = String(this.operator === '+' 
            ? this.prevAmount + currentAmount 
            : this.prevAmount - currentAmount
          );
          this.isCalculating = false;
          this.operator = '';
        } else {
          this.save.emit();
        }
        break;
      case 'date':
        this.showDatePicker = !this.showDatePicker;
        break;
      case '.':
        if (!this.amount.includes('.')) {
          this.amount += '.';
        }
        break;
      default:
        if (this.amount === '0' && key !== '.') {
          this.amount = key;
        } else {
          this.amount += key;
        }
    }

    this.amountChange.emit(Number(this.amount));
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = new Date(input.value);
    this.dateChange.emit(this.selectedDate);
    this.showDatePicker = false;
  }
}