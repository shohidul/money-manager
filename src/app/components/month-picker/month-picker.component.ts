import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, addYears, subYears, parse } from 'date-fns';

@Component({
  selector: 'app-month-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="month-picker">
      <button class="month-button" (click)="togglePicker()">
        {{ formatDisplayDate() }}
        <span class="material-icons">{{ isOpen ? 'expand_less' : 'expand_more' }}</span>
      </button>

      @if (isOpen) {
        <div class="picker-dropdown">
          <div class="year-selector">
            <button (click)="prevYear()">
              <span class="material-icons">chevron_left</span>
            </button>
            <span>{{ selectedYear }}</span>
            <button (click)="nextYear()">
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
          <div class="months-grid">
            @for (month of months; track month.value) {
              <button 
                class="month-item" 
                [class.selected]="isSelectedMonth(month.value)"
                (click)="selectMonth(month.value)"
              >
                {{ month.label }}
              </button>
            }
          </div>
        </div>
      }
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
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      background: white;
      cursor: pointer;
      width: 100%;
      justify-content: space-between;
    }

    .picker-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
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

  isOpen = false;
  selectedYear = new Date().getFullYear();

  months = [
    { label: 'Jan', value: '01' },
    { label: 'Feb', value: '02' },
    { label: 'Mar', value: '03' },
    { label: 'Apr', value: '04' },
    { label: 'May', value: '05' },
    { label: 'Jun', value: '06' },
    { label: 'Jul', value: '07' },
    { label: 'Aug', value: '08' },
    { label: 'Sep', value: '09' },
    { label: 'Oct', value: '10' },
    { label: 'Nov', value: '11' },
    { label: 'Dec', value: '12' },
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
    return format(date, 'MMMM yyyy');
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
