import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOptions } from '../../utils/transaction-filters';
import { format } from 'date-fns';
import { TranslatePipe } from "../shared/translate.pipe";
import { Category } from '../../services/db.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, DatePipe],
  template: `
    <div class="filter-bar">
      <div class="date-range-picker">
        <input 
          type="date" 
          [value]="startDate | date:'yyyy-MM-dd'"
          (change)="onStartDateChange($event)"
        />
        <span class="date-separator">-</span>
        <input 
          type="date" 
          [value]="endDate | date:'yyyy-MM-dd'"
          (change)="onEndDateChange($event)"
        />
      </div>

      <div class="status-filter" *ngIf="showFuelCategories">
        <select [(ngModel)]="fuelCategoryFilter" (ngModelChange)="onFuelCategoryChange()">
          <option value="all">{{ 'categories.all' | translate }}</option>
          <option *ngFor="let category of fuelCategories" [value]="category.id">{{ category.name | translate }}</option>
        </select>
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
      align-items: center;
    }

    .date-range-picker {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-range-picker input {
      padding: 0.7rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }

    .date-separator {
      margin: 0 0.5rem;
    }

    .status-filter select {
      padding: 0.7rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .filter-bar {
        gap: 0.6rem;
        flex-direction: column;
      }
    }
  `]
})
export class FilterBarComponent implements OnInit {
  
  @Input() filters: FilterOptions = { status: 'all' };
  statusFilter: 'pending' | 'partial' | 'completed' | 'all' = 'all';
  fuelCategoryFilter: string = 'all';
  @Input() fuelCategories: Category[] = [];
  @Input() showStatus = false;
  @Input() showFuelCategories = false;
  @Output() filtersChange = new EventEmitter<FilterOptions>();
  @Output() startDateChange = new EventEmitter<Date>();
  @Output() endDateChange = new EventEmitter<Date>();
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor() {
    this.filters.status = 'all';
  }

  ngOnInit() {
    // Set startDate to January 1st of current year
    this.startDate = new Date(new Date().getFullYear(), 0, 1);
    
    // Set endDate to current date
    this.endDate = new Date();

    // Update filters with these dates
    if (this.filters) {
      this.filters.startDate = this.startDate;
      this.filters.endDate = this.endDate;
    }

    // Emit date changes
    this.startDateChange.emit(this.startDate);
    this.endDateChange.emit(this.endDate);

    // Set category filter if exists
    if (this.filters?.category) {
      this.fuelCategoryFilter = this.filters.category;
    }
  }

  onStartDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.startDate = new Date(input.value);
    this.startDateChange.emit(this.startDate);
  }

  onEndDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.endDate = new Date(input.value);
    this.endDateChange.emit(this.endDate);
  }

  onStatusChange() {
    this.filters.status = this.statusFilter;
    this.filtersChange.emit(this.filters);
  }

  onFuelCategoryChange() {
    this.filters.category = this.fuelCategoryFilter;
    this.filtersChange.emit(this.filters);
  }
}