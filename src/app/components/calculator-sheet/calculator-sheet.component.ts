import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-calculator-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calculator-sheet" [class.open]="isVisible">
      <div class="sheet-header">
        <div class="category-info">
          <span class="material-symbols-rounded">{{ categoryIcon }}</span>
          <input 
            type="text" 
            [(ngModel)]="memo" 
            (ngModelChange)="onMemoChange($event)"
            placeholder="Add memo"
            class="memo-input"
          >
        </div>
        <div class="amount">{{ displayAmount }}</div>
      </div>

      @if (showDatePicker) {
        <div class="date-picker">
          <input 
            type="date" 
            [ngModel]="selectedDate | date:'yyyy-MM-dd'"
            (ngModelChange)="onDateChange($event)"
            [max]="today | date:'yyyy-MM-dd'"
          >
        </div>
      }

      <div class="keypad">
        <div class="sheet-body">
          <div class="keypad-number">
            @for (key of numericKeys; track key) {
              <button (click)="onKeyPress(key)" class="key">{{ key }}</button>
            }
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
    </div>
  `,
  styles: [
    `
    .calculator-sheet {
      position: relative;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--surface-color);
      transform: translateY(100%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }

    .calculator-sheet.open {
      transform: translateY(0);
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
    
    .memo {
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

    .sheet-body {
      display: grid;
      grid-template-columns: 75% 25%;
      gap: 1px;
      background-color: rgba(0, 0, 0, 0.08);
    }
    
    .keypad-number {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 55px;
      gap: 1px;
      background: rgba(0, 0, 0, 0.08);
    }
    
    .keypad-function {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      grid-auto-rows: 55px;
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
      touch-action: manipulation;
    }

    .key:active {
      background: rgba(0, 0, 0, 0.04);
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

    .date-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 0.75rem;
      line-height: 1.2;
    }
  `,
  ],
})
export class CalculatorSheetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() categoryIcon = 'help';
  @Input() initialAmount = '0';
  @Input() initialMemo = '';
  @Input() initialDate = new Date();
  @Input() isVisible = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() amountChange = new EventEmitter<number>();
  @Output() memoChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<Date>();
  @Output() save = new EventEmitter<void>();

  readonly numericKeys = [
    '7',
    '8',
    '9',
    '4',
    '5',
    '6',
    '1',
    '2',
    '3',
    '.',
    '0',
    '⌫',
  ];
  
  memo = '';
  amount = '0';
  operator = '';
  prevAmount = 0;
  isCalculating = false;
  showDatePicker = false;
  selectedDate = new Date();
  today = new Date();

  constructor(private domSanitizer: DomSanitizer) {}

  ngOnInit() {
    // Add global event listener for keydown
    window.addEventListener('keydown', this.onGlobalKeyDown.bind(this));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isVisible) {
      this.amount = this.initialAmount;
      this.memo = this.initialMemo;
      this.selectedDate = new Date(this.initialDate);
    }
  }

  ngOnDestroy() {
    // Remove the event listener to prevent memory leaks
    window.removeEventListener('keydown', this.onGlobalKeyDown.bind(this));
  }

  onGlobalKeyDown(event: KeyboardEvent) {
    // Prevent default if we're handling the key
    const key = event.key;

    // Backspace key
    if (key === 'Backspace') {
      event.preventDefault();
      
      // If amount is 0, remove last character from memo
      if (this.amount === '0') {
        if (this.memo.length > 0) {
          this.memo = this.memo.slice(0, -1);
          this.onMemoChange(this.memo);
        }
      } else {
        // Otherwise, use calculator's backspace
        this.onKeyPress('⌫');
      }
      return;
    }

    // Numeric and operator keys
    if (/^[0-9+\-.]$/.test(key)) {
      event.preventDefault();
      this.onKeyPress(key);
      return;
    }

    // Enter key acts like '='
    if (key === 'Enter') {
      event.preventDefault();
      this.onKeyPress('=');
      return;
    }

    // If it's a letter, assume it's for memo
    if (/^[a-zA-Z\s]$/.test(key)) {
      // Focus on memo input or update memo
      this.onMemoChange(this.memo + key);
    }
  }

  private resetCalculator() {
    this.amount = '0';
    this.operator = '';
    this.prevAmount = 0;
    this.isCalculating = false;
    this.memo = '';
    this.selectedDate = new Date();
    this.showDatePicker = false;
  }

  get displayAmount(): string {
    return this.amount === '0' && !this.isCalculating ? '0' : this.amount;
  }

  get formattedDateIcon(): SafeHtml {
    const isToday =
      this.selectedDate.toDateString() === this.today.toDateString();
    const month = this.selectedDate.getMonth() + 1;
    const day = this.selectedDate.getDate();
    const year = this.selectedDate.getFullYear();

    const html = isToday
      ? `<div class="date-icon"><div class="top">Today</div><div class="bottom">${month}/${day}</div></div>`
      : `<div class="date-icon"><div class="top">${month}/${day}</div><div class="bottom">${year}</div></div>`;

    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }

  onKeyPress(key: string) {
    const numericPart = this.amount.replace(/[^0-9]/g, '');
    if (numericPart.length >= 8 && !isNaN(Number(key)) && key !== '⌫') {
      return;
    }

    switch (key) {
      case '⌫':
        if (
          this.amount[this.amount.length - 1] === '+' ||
          this.amount[this.amount.length - 1] === '-'
        ) {
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
          this.amount = `${this.amount}${key}`;
          this.isCalculating = true;
        } else {
          this.calculateResult();
          this.onKeyPress(key);
        }
        break;

      case '.':
        const lastOperatorIndex = Math.max(
          this.amount.lastIndexOf('+'),
          this.amount.lastIndexOf('-')
        );
        const afterOperator = this.amount.slice(lastOperatorIndex + 1);
        if (!afterOperator.includes('.')) {
          this.amount += key;
        }
        break;

      case '=':
        if (this.amount === '0') {
          this.toggle.emit();
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

    // this.amountChange.emit(Number(this.amount.replace(/[^0-9.]/g, '')));
  }

  calculateResult() {
    if (this.isCalculating) {
      const parts = this.amount.split(/[+\-]/);
      const currentAmount = Number(
        parts[parts.length - 1].replace(/[^0-9.]/g, '')
      );

      this.amount = String(
        this.operator === '+'
          ? this.prevAmount + currentAmount
          : this.prevAmount - currentAmount
      );
      this.isCalculating = false;
      this.operator = '';
    } else {
      this.amountChange.emit(Number(this.amount.replace(/[^0-9.]/g, '')));
      this.save.emit();
    }
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate = new Date(input.value);
    this.dateChange.emit(this.selectedDate);
    this.showDatePicker = false;
  }

  onMemoChange(value: string) {
    this.memoChange.emit(value);
  }
}