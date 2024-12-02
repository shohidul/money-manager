import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-calculator-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculator-sheet" [ngClass]="animationState">
      <div class="sheet-header">
        <div class="category-info">
          <span class="material-symbols-rounded color-primary">{{ categoryIcon }}</span>
          <span class="memo">
            <span class="material-symbols-rounded">edit_note</span>
            <input 
              type="text" 
              [(ngModel)]="memo" 
              (ngModelChange)="memoChange.emit($event)"
              placeholder="Add memo"
              class="memo-input"
            >
          </span>
        </div>
        <div class="amount">{{ displayAmount }}</div>
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
      <div class="sheet-body">
        <div class="keypad-number">
          <button *ngFor="let key of numericKeys" (click)="onKeyPress(key)" class="key">
            {{ key }}
          </button>
        </div>
        <div class="keypad-function">
          <button (click)="onKeyPress('date')" class="key" style="padding: .9rem;">
            <span [innerHTML]="formattedDateIcon"></span>
          </button>
          <button (click)="onKeyPress('+')" class="key operator-key">+</button>
          <button (click)="onKeyPress('-')" class="key operator-key">−</button>
          <button (click)="onKeyPress('=')" class="key equals-key">
            <span class="material-symbols-rounded">{{ isCalculating ? '=' : 'check_circle' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calculator-sheet {
      position: fixed;
      bottom: -100%; /* Hidden by default */
      left: 0;
      right: 0;
      background: var(--surface-color);
      transition: bottom 0.5s ease; /* Smooth transition for sliding */
    }

     @media (min-width: 768px) {
      .calculator-sheet{
        left: 266px;
        right: 1rem;
      }
    }
    
    .calculator-sheet.slide-up {
      bottom: 0; /* Slide up into view */
    }
    
    .calculator-sheet.slide-down {
      bottom: -100%; /* Slide down out of view */
    }

    .sheet-header {
      padding: .75rem 1rem 0 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
      flex-grow: 1;
    }
    .memo{
      display: flex;
      align-items: center;
      color: var(--text-muted);
    }
    .memo-input {
      flex: 1;
      border: none;
      padding: 0.5rem 0.2rem;
      font-size: 1rem;
      background: none;
    }

    .memo-input:focus {
      outline: none;
    }

    .amount {
      font-size: 1.25rem;
      font-weight: 500;
      text-align: right;
      color: var(--text-primary);
    }

    .sheet-body{
      display: grid;
      grid-template-columns: 75% 25%;
      gap: 1px;
      background-color: rgba(0, 0, 0, 0.08);
    }
    .keypad-number {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: rgba(0, 0, 0, 0.08);
    }
    .keypad-function {
      display: grid;
      gap: 1px;
      background: rgba(0, 0, 0, 0.08);
      grid-template-columns: repeat(1, 1fr);
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
      color: var(--primary-color);
    }

    .equals-key {
      background: var(--primary-color);
      color: white;
    }

    .date-picker {
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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
  @Input() isVisible = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() amountChange = new EventEmitter<number>();
  @Output() memoChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<Date>();
  @Output() save = new EventEmitter<void>();

  numericKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'];
  memo = '';
  amount = '0';
  operator = '';
  prevAmount = 0;
  isCalculating = false;
  showDatePicker = false;
  selectedDate = new Date();
  today = new Date();
  animationState = ''; // Track animation state ('slide-up' or 'slide-down')

  ngOnChanges() {
    this.animationState = this.isVisible ? 'slide-up' : 'slide-down';
  }

  requestToggle() {
    this.toggle.emit(); // Notify the parent to toggle visibility
  }

  constructor(private domSanitizer: DomSanitizer) {}

  get displayAmount(): string {
    if (this.amount === '0' && !this.isCalculating) {
      return '0';
    }
    // Return the raw amount with special characters if present
    return this.amount;
  }

  get formattedDateIcon(): SafeHtml {
    const isToday = this.selectedDate.toDateString() === this.today.toDateString();
    const month = this.selectedDate.getMonth() + 1; // Months are 0-indexed
    const day = this.selectedDate.getDate();
    const year = this.selectedDate.getFullYear();

    const html = isToday
      ? `<div class="date-icon"><div class="top">Today</div><div class="bottom">${month}/${day}</div></div>`
      : `<div class="date-icon"><div class="top">${month}/${day}</div><div class="bottom">${year}</div></div>`;

    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }

  onKeyPress(key: string) {
    
    const numericPart = this.amount.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (numericPart.length >= 8 && !isNaN(Number(key)) && key !== '⌫') {
      // Prevent adding more digits if 8 digits are already present
      return;
    }
  
    switch (key) {
      case '⌫': // Backspace
        if (this.amount[this.amount.length - 1] === '+' || this.amount[this.amount.length - 1] === '-') {
          this.isCalculating = false;
        }
        this.amount = this.amount.slice(0, -1) || '0';
        break;
  
      case 'date':
        this.showDatePicker = !this.showDatePicker;
        break;
  
      case '+':
      case '-':
        if (!this.isCalculating) {
          this.operator = key;
          this.prevAmount = Number(this.amount);
          this.amount = `${this.amount}${key}`; // Append the operator
          this.isCalculating = true;
        } else {
          this.calculateResult();
          this.onKeyPress(key);
        }
        break;
        
      case '.':
        const lastOperatorIndex = Math.max(this.amount.lastIndexOf('+'), this.amount.lastIndexOf('-'));
        const afterOperator = this.amount.slice(lastOperatorIndex + 1);
      
        // Check if there's already a '.' in the current segment
        if (!afterOperator.includes('.')) {
          this.amount += key;
        }
        break;
        
      case '=':
        if (this.amount === '0') {
          this.requestToggle();
        } else {
          this.calculateResult();
        }
        break;
  
      default:
        if (!/^\.\d{2}$/.test(this.amount.slice(-3))) {
          if (this.amount === '0') {
            this.amount = key;
          } else {
            this.amount += key;
          }
        }
    }
  
    this.amountChange.emit(Number(this.amount.replace(/[^0-9.]/g, '')));
  }


  calculateResult(){
    if (this.isCalculating) {
      const parts = this.amount.split(/[+\-]/); // Split on '+' or '-'
      const currentAmount = Number(parts[parts.length - 1].replace(/[^0-9.]/g, ''));
      
      this.amount = String(
        this.operator === '+'
          ? this.prevAmount + currentAmount
          : this.prevAmount - currentAmount
      );
      this.isCalculating = false;
      this.operator = '';
    } else {
      this.save.emit();
    }
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = new Date(input.value);
    this.dateChange.emit(this.selectedDate);
    this.showDatePicker = false;
  }
}