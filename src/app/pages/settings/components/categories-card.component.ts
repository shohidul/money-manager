import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Category } from '../../../services/db.service';

type SortType = 'order' | 'name';

@Component({
  selector: 'app-categories-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
  template: `
    <div class="card">
      <div class="section-header">
        <h3>Categories</h3>
        <div class="category-actions">
          <div class="category-filters">
            <button 
              [class.active]="categoryFilter === 'all'"
              (click)="setCategoryFilter('all')"
            >
              All
            </button>
            <button 
              [class.active]="categoryFilter === 'income'"
              (click)="setCategoryFilter('income')"
            >
              Income
            </button>
            <button 
              [class.active]="categoryFilter === 'expense'"
              (click)="setCategoryFilter('expense')"
            >
              Expense
            </button>
          </div>
          <div class="sort-controls">
            <select [(ngModel)]="sortType" (ngModelChange)="onSortChange()" class="sort-type">
              <option value="order">Sort by Order</option>
              <option value="name">Sort by Name</option>
            </select>
            <button 
              [class.active]="sortOrder === 'asc'"
              (click)="setSortOrder('asc')"
            >
              <span class="material-icons">arrow_downward</span>
            </button>
            <button 
              [class.active]="sortOrder === 'desc'"
              (click)="setSortOrder('desc')"
            >
              <span class="material-icons">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
      <div class="category-list" cdkDropList (cdkDropListDropped)="onDrop($event)">
        @for (category of sortedCategories; track category.id) {
          <div class="category-item" cdkDrag>
            <div class="order-number">{{ category.order }}</div>
            <div class="category-info">
              <span class="material-symbols-rounded">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
              <span class="category-type">{{ category.type }}</span>
            </div>
            @if (category.isCustom) {
              <button 
                class="delete-button"
                (click)="deleteCategory.emit(category)"
              >
                <span class="material-icons">delete</span>
              </button>
            }
            <div class="drag-handle">
              <span class="material-icons">drag_indicator</span>
            </div>
          </div>
        }
      </div>
      <a routerLink="/add-category" class="add-category-button">
        <span class="material-icons">add</span>
        Add New Category
      </a>
    </div>
  `,
  styles: [`
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      position: sticky;
      top: 0;
      background: white;
      padding: 1rem;
      z-index: 1;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .category-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .sort-controls {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .sort-type {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .sort-controls button {
      padding: 0.5rem;
      border: none;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .sort-controls button .material-icons{
      font-size: initial;
    }

    .sort-controls button.active {
      background: var(--primary-color);
      color: white;
    }

    .category-filters {
      display: flex;
      gap: 0.5rem;
    }

    .category-filters button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .category-filters button.active {
      background: var(--primary-color);
      color: white;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-radius: 8px;
      background-color: white;
      border: 1px solid rgba(0, 0, 0, 0.08);
      cursor: move;
      gap: 1rem;
    }

    .order-number {
      min-width: 24px;
      height: 24px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .category-type {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .delete-button {
      background: none;
      border: none;
      color: var(--secondary-color);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
    }

    .delete-button:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    .drag-handle {
      color: var(--text-secondary);
      cursor: move;
      padding: 0.5rem;
    }

    .add-category-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px dashed rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      margin-top: 1rem;
      color: var(--primary-color);
      text-decoration: none;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .add-category-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class CategoriesCardComponent {
  @Input() categories: Category[] = [];
  @Output() categoryDrop = new EventEmitter<CdkDragDrop<any[]>>();
  @Output() deleteCategory = new EventEmitter<Category>();

  sortType: SortType = 'order';
  sortOrder: 'asc' | 'desc' = 'asc';
  categoryFilter: 'all' | 'income' | 'expense' = 'all';

  get sortedCategories() {
    const filtered = this.categories.filter(category => 
      this.categoryFilter === 'all' || category.type === this.categoryFilter
    );

    return filtered.sort((a, b) => {
      if (this.sortType === 'name') {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return this.sortOrder === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return this.sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }
    });
  }

  setSortOrder(order: 'asc' | 'desc') {
    this.sortOrder = order;
  }

  onSortChange() {
    // Trigger re-sort
  }

  setCategoryFilter(filter: 'all' | 'income' | 'expense') {
    this.categoryFilter = filter;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    this.categoryDrop.emit(event);
  }
}