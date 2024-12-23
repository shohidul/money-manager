import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOptions } from '../../utils/transaction-filters';
import { format } from 'date-fns';
import { MonthPickerComponent } from "../month-picker/month-picker.component";

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MonthPickerComponent],
  template: `
    <div class="filter-bar">
      <div class="month-picker">
        <app-month-picker
          [currentMonth]="currentMonth"
          (monthChange)="onMonthChange($event)"
        />
      </div>

      <div class="status-filter" *ngIf="showStatus">
        <select [(ngModel)]="statusFilter" (ngModelChange)="onStatusChange()">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .month-picker input,
    .status-filter select {
      padding: 0.7rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }
  `]
})
export class FilterBarComponent {
  @Input() filters: FilterOptions = { status: 'all' };
  statusFilter: 'pending' | 'partial' | 'completed' | 'all' = 'all';
  @Input() showStatus = false;
  @Output() filtersChange = new EventEmitter<FilterOptions>();
  @Output() monthChange = new EventEmitter<string>();

  currentMonth = format(new Date(), 'yyyy-MM');

  constructor() {
    this.filters.status = 'all';
  }

  onMonthChange(month: string) {
    this.currentMonth = month;
    this.filters.month = month;
    this.monthChange.emit(month);
    this.filtersChange.emit(this.filters);
  }

  onStatusChange() {
    this.filters.status = this.statusFilter;
    this.filtersChange.emit(this.filters);
  }
}