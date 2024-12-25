import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, addYears, subYears, parse } from 'date-fns';
import { TranslatePipe } from '../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { TranslateNumberPipe } from "../shared/translate-number.pipe";


@Component({
  selector: 'app-month-picker',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslateNumberPipe],
  template: `
    <div class="month-picker">
      <button class="month-button" (click)="togglePicker()">
        {{ formatDisplayDate() }}
        <span class="material-icons">{{ isOpen ? 'expand_less' : 'expand_more' }}</span>
      </button>

      <div *ngIf="isOpen" class="picker-dropdown">
        <div class="year-selector">
          <button (click)="prevYear()">
            <span class="material-icons">chevron_left</span>
          </button>
          <span>{{ selectedYear | translateNumber }}</span>
          <button (click)="nextYear()">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
        <div class="months-grid">
          <button 
            *ngFor="let month of months" 
            class="month-item" 
            [class.selected]="isSelectedMonth(month.value)"
            (click)="selectMonth(month.value)"
          >
            {{ month.label | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .month-picker {
      min-width: 250px;
      position: relative;
      flex: 1;
    }

    .month-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--surface-color);
      cursor: pointer;
      width: 100%;
      justify-content: space-between;
    }

    .picker-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--surface-color);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 0.5rem;
      z-index: 1000;
      padding: 1rem;
    }

    .year-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding: 0 0.5rem;
    }

    .year-selector button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .year-selector button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .months-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .month-item {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      background: none;
      cursor: pointer;
      text-align: center;
    }

    .month-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .month-item.selected {
      background-color: var(--primary-color);
      color: white;
    }
  `,
  ],
})
export class MonthPickerComponent {
  @Input() currentMonth!: string;
  @Output() monthChange = new EventEmitter<string>();

  currentLang: string;

  constructor(private translationService: TranslationService) {
    this.currentLang = this.translationService.getCurrentLanguage();
  }
  isOpen = false;
  selectedYear = new Date().getFullYear();

  months = [
    { label: 'months.january', value: '01' },
    { label: 'months.february', value: '02' },
    { label: 'months.march', value: '03' },
    { label: 'months.april', value: '04' },
    { label: 'months.may', value: '05' },
    { label: 'months.june', value: '06' },
    { label: 'months.july', value: '07' },
    { label: 'months.august', value: '08' },
    { label: 'months.september', value: '09' },
    { label: 'months.october', value: '10' },
    { label: 'months.november', value: '11' },
    { label: 'months.december', value: '12' },
  ];

  togglePicker() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      const date = parse(this.currentMonth, 'yyyy-MM', new Date());
      this.selectedYear = date.getFullYear();
    }
  }

  formatDisplayDate(): string {
    const date = parse(this.currentMonth, 'yyyy-MM', new Date());
    
    // Format the date using Intl.DateTimeFormat
    return new Intl.DateTimeFormat(this.currentLang, { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  }

  prevYear() {
    this.selectedYear--;
  }

  nextYear() {
    this.selectedYear++;
  }

  isSelectedMonth(month: string): boolean {
    return this.currentMonth === `${this.selectedYear}-${month}`;
  }

  selectMonth(month: string) {
    const newDate = `${this.selectedYear}-${month}`;
    this.monthChange.emit(newDate);
    this.isOpen = false;
  }
}