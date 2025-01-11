import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { TranslateDatePipe } from '../shared/translate-date.pipe';
import { TranslateNumberPipe } from '../shared/translate-number.pipe';

@Component({
  selector: 'app-calculator-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslateNumberPipe],
  template: `
    <div class="calculator-sheet" [class.open]="isVisible">
      <div class="sheet-header">
        <div class="category-info">
          <span class="material-symbols-rounded">{{ categoryIcon }}</span>
          <input 
            type="text" 
            [(ngModel)]="memo" 
            (ngModelChange)="onMemoChange($event)"
            [placeholder]="'calculator.addMemo' | translate"
            class="memo-input"
          >
        </div>
        <div class="amount">{{ displayAmount | translateNumber }}</div>
      </div>

      @if (showDatePicker) {
        <div class="date-picker">
          <input 
            class="date-input"
            type="datetime-local" 
            [ngModel]="selectedDate | date:'yyyy-MM-ddTHH:mm:ss'"
            (ngModelChange)="onDateChange($event)"
            [max]="today | date:'yyyy-MM-ddTHH:mm:ss'"
          >
        </div>
      }

      <div class="keypad">
        <div class="sheet-body">
          <div class="keypad-number">
            @for (key of numericKeys; track key) {
              <button (click)="onKeyPress(key)" 
              class="key key{{key === '.' ? 'dot' : key}}" 
              >{{ key | translateNumber }}</button>
            }
          </div>
          <div class="keypad-function">
            <button (click)="onKeyPress('date')" class="key" style="padding: .9rem;">
              <span [innerHTML]="formattedDateIcon"></span>
            </button>
            <button (click)="onKeyPress('+')" class="key operator-key plus-key">+</button>
            <button (click)="onKeyPress('-')" class="key operator-key minus-key">−</button>
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
      border-bottom: 1px solid var(--border-color-light);
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
      background-color: var(--background-color);
    }
    
    .keypad-number {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 55px;
      gap: 1px;
      background: var(--background-color);
    }
    
    .keypad-function {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      grid-auto-rows: 55px;
      gap: 1px;
      background: var(--background-color);
      border-left: 1px solid var(--background-color);
    }

    .key {
      padding: 1.25rem;
      border: none;
      background-color: var(--surface-color);
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }

    .key:active {
      background: var(--background-color-hover);
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
      border-bottom: 1px solid var(--border-color-light);
    }

    .date-picker input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
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
  changeDetection: ChangeDetectionStrategy.OnPush
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

  private _memoizedDateIcon: { date: Date; html: SafeHtml } | null = null;
  isTypingMemo = false;

  constructor(
    private domSanitizer: DomSanitizer,
    private translationService: TranslationService
  ) {}

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
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.classList.contains('memo-input') || activeElement.classList.contains('date-input')) {
      return;
    }

    // Prevent default if we're handling the key
    const key = event.key;

    // Backspace key
    if (key === 'Backspace') {
      event.preventDefault();
      // If amount is 0 or typing memo, remove last character from memo
      if (this.isTypingMemo && this.memo.length > 0 || this.amount === '0') {
        this.memo = this.memo.slice(0, -1);
        this.onMemoChange(this.memo);
      } else {
        // Otherwise, use calculator's backspace
        this.triggerClick('key⌫');
      }
      return;
    }

    // Numeric and operator keys
    if (/^[0-9+\-.]$/.test(key)) {
      event.preventDefault();
      this.triggerClick(key);
      return;
    }

    // Enter key acts like '='
    if (key === 'Enter' || key === '=') {
      event.preventDefault();
      this.triggerClick('equals-key');
      return;
    }

    // If it's a letter, assume it's for memo
    if (/^[a-zA-Z\s]$/.test(key)) {
      event.preventDefault();
      // Focus on memo input or update memo
      this.onMemoChange(this.memo += key);
    }
  }

  private triggerClick(key: string) {
    let className = '';
    if(key === '+'){
      className = 'plus-key';
    }else if(key === '-'){
      className = 'minus-key';
    }else if(key === '.'){
      className = 'keydot';
    }else if(key === 'equals-key'){
      className = 'equals-key';
    }else if(key === 'key⌫'){
      className = 'key⌫';
    }else{
      className = 'key'+key;
    }
    const buttonElement = document.querySelector('.'+className) as HTMLButtonElement;
    buttonElement.click();
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
    if (
      this._memoizedDateIcon &&
      this._memoizedDateIcon.date.toDateString() === this.selectedDate.toDateString()
    ) {
      return this._memoizedDateIcon.html;
    }

    const isToday = this.selectedDate.toDateString() === this.today.toDateString();
    const todayText = this.translationService.translate('calculator.today');
    const translatedDateString = new TranslateDatePipe(this.translationService).transform(this.selectedDate);
    const dateParts = translatedDateString.split('/');
    
    const html = isToday
      ? `<div class="date-icon"><div class="top">${todayText}</div><div class="bottom">${dateParts[1]}/${dateParts[0]}</div></div>`
      : `<div class="date-icon"><div class="top">${dateParts[1]}/${dateParts[0]}</div><div class="bottom">${dateParts[2] || this.selectedDate.getFullYear()}</div></div>`;

    this._memoizedDateIcon = { date: this.selectedDate, html: this.domSanitizer.bypassSecurityTrustHtml(html) };
    return this._memoizedDateIcon.html;
  }

  onKeyPress(key: string) {
    this.isTypingMemo = false;

    try {
      const MAX_DIGITS = 8;
      const numericPart = this.amount.replace(/[^0-9]/g, '');

      if (numericPart.length >= MAX_DIGITS && !isNaN(Number(key)) && key !== '⌫') {
        return;
      }

      switch (key) {
        case '⌫':
          this.handleBackspace();
          break;
        case 'date':
          this.showDatePicker = !this.showDatePicker;
          break;
        case '+':
        case '-':
          this.handleOperator(key);
          break;
        case '.':
          this.handleDecimalPoint();
          break;
        case '=':
          this.handleEquals();
          break;
        default:
          this.handleNumericInput(key);
      }
    } catch (error) {
      console.error('Calculator error:', error);
      this.resetCalculator();
    }
  }

  private handleBackspace() {
    if (
      this.amount[this.amount.length - 1] === '+' ||
      this.amount[this.amount.length - 1] === '-'
    ) {
      this.isCalculating = false;
    }
    this.amount = this.amount.slice(0, -1) || '0';
  }

  private handleOperator(key: string) {
    if (!this.isCalculating) {
      this.operator = key;
      this.prevAmount = Number(this.amount);
      this.amount = `${this.amount}${key}`;
      this.isCalculating = true;
    } else {
      this.calculateResult();
      this.onKeyPress(key);
    }
  }

private handleDecimalPoint() {
  const lastOperatorIndex = Math.max(
    this.amount.lastIndexOf('+'),
    this.amount.lastIndexOf('-')
  );

  // If an operator exists
  if (lastOperatorIndex !== -1) {
    if (!this.amount.includes('.')) {
      // Add '0.' after the operator
      this.amount += '0.';
    }
  } else {
    // If no operator exists, check the current segment
    const afterOperator = this.amount.slice(lastOperatorIndex + 1);
    if (!afterOperator.includes('.')) {
      this.amount += '.';
    }
  }
}

  private handleEquals() {
    if (this.amount === '0') {
      this.toggle.emit();
    } else {
      this.calculateResult();
    }
  }

  private handleNumericInput(key: string) {
    if (!/^\.\d{2}$/.test(this.amount.slice(-3))) {
      this.amount = this.amount === '0' ? key : this.amount + key;
    }
  }

  calculateResult() {
    if (this.isCalculating) {
      const parts = this.amount.split(/[+\-]/);
      const currentAmount = Number(parts[parts.length - 1].replace(/[^0-9.]/g, ''));

      this.amount = String(
        this.operator === '+'
          ? this.prevAmount + currentAmount
          : this.prevAmount - currentAmount
      );
      this.isCalculating = false;
      this.operator = '';
    } else {
      this.amountChange.emit(Number(this.amount.replace(/[^0-9.]/g, '')));
      this.memoChange.emit(this.memo);
      this.dateChange.emit(this.selectedDate);
      this.save.emit();
    }
  }

  onDateChange(event: string | Date) {
    const dateValue = typeof event === 'string' 
      ? new Date(event) 
      : event;
    
    this.selectedDate = dateValue;
    // this.showDatePicker = false;

    const dateInput = document.querySelector(
      '.date-picker'
    ) as HTMLInputElement;
    dateInput.value = this.selectedDate.toISOString();
  }

  onMemoChange(value: string) {
    const memoInput = document.querySelector(
      '.memo-input'
    ) as HTMLInputElement;
    memoInput.value = value;
    this.isTypingMemo = true;
  }
}