import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOptions } from '../../utils/transaction-filters';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <div class="date-range">
        <input 
          type="date" 
          [ngModel]="filters.startDate | date:'yyyy-MM-dd'"
          (ngModelChange)="onDateChange('startDate', $event)"
        >
        <span>to</span>
        <input 
          type="date"
          [ngModel]="filters.endDate | date:'yyyy-MM-dd'"
          (ngModelChange)="onDateChange('endDate', $event)"
        >
      </div>

      <div class="status-filter" *ngIf="showStatus">
        <select [(ngModel)]="filters.status" (ngModelChange)="filtersChange.emit(filters)">
          <option value="all">All</option>
          <option value="active">Active</option>
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

    .date-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-range input,
    .status-filter select {
      padding: 0.5rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }
  `]
})
export class FilterBarComponent {
  @Input() filters: FilterOptions = {};
  @Input() showStatus = false;
  @Output() filtersChange = new EventEmitter<FilterOptions>();

  onDateChange(field: 'startDate' | 'endDate', value: string) {
    this.filters[field] = value ? new Date(value) : undefined;
    this.filtersChange.emit(this.filters);
  }
}