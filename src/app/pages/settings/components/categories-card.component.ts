import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Category } from '../../../services/db.service';

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
        </div>
      </div>

      <div class="category-list" cdkDropList (cdkDropListDropped)="onDrop($event)">
        @for (category of sortedCategories; track category.id) {
          <div class="category-item" cdkDrag>
            <div class="category-item-placeholder" *cdkDragPlaceholder></div>
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
                <span class="material-icons">do_not_disturb_on</span>
              </button>
            }
            <div class="drag-handle">
              <span class="material-icons">drag_indicator</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .category-list.cdk-drop-list-dragging .category-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .category-item-placeholder {
      background: #ccc;
      border: dotted 3px #999;
      border-radius: 8px;
      min-height: 70px;
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      position: sticky;
      top: -16px;
      background: white;
      padding: 1rem;
      z-index: 1;
      flex-wrap: wrap;
      gap: 1rem;
    }

    @media (max-width: 769px) {
      .section-header {
        top: 55px;
      }
    }

    .category-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
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
  `,
  ],
})
export class CategoriesCardComponent {
  @Input() categories: Category[] = [];
  @Output() categoryDrop = new EventEmitter<CdkDragDrop<any[]>>();
  @Output() deleteCategory = new EventEmitter<Category>();

  categoryFilter: 'all' | 'income' | 'expense' = 'all';

  get sortedCategories() {
    const filtered = this.categories.filter(
      (category) =>
        this.categoryFilter === 'all' || category.type === this.categoryFilter
    );

    return filtered.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  }

  setCategoryFilter(filter: 'all' | 'income' | 'expense') {
    this.categoryFilter = filter;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    this.categoryDrop.emit(event);
  }
}
