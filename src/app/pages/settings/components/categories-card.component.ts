import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Category } from '../../../services/db.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';

@Component({
  selector: 'app-categories-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, TranslatePipe],
  template: `
    <div class="card">
      <div class="section-header">
        <h3>{{ 'categories.title' | translate }}</h3>
        <div class="category-actions">
          <div class="category-filters">
            <button 
              [class.active]="categoryFilter === 'expense'"
              (click)="setCategoryFilter('expense')"
            >
              {{ 'categories.filters.expense' | translate }}
            </button>
            <button 
              [class.active]="categoryFilter === 'income'"
              (click)="setCategoryFilter('income')"
            >
              {{ 'categories.filters.income' | translate }}
            </button>
            <button 
              class="reset-order"
              [class.dirty]="currentOrderDirty"
              [disabled]="!currentOrderDirty"
              (click)="resetCategoryOrder()"
            >
              {{ 'categories.actions.resetOrder' | translate }}
            </button>
          </div>
        </div>
      </div>

      <div class="category-list" cdkDropList (cdkDropListDropped)="onDrop($event)">
        @for (category of getCategories; track category.id) {
          <div class="category-item" cdkDrag>
            <div class="category-item-placeholder" *cdkDragPlaceholder></div>
            <div class="order-number">{{ category.order }}</div>
            <div class="category-info">
              <span class="material-symbols-rounded">{{ category.icon }}</span>
              <span>{{ category.name | translate }}</span>
              <span class="category-type">{{ 'transaction.types.' + category.type | translate }}</span>
            </div>
            @if (category.isCustom) {
              <button 
                class="delete-button"
                (click)="deleteCategory.emit(category)"
              >
                <span class="material-icons">do_not_disturb_on</span>
              </button>
            }
            <div class="drag-handle" cdkDragHandle>
              <span class="material-icons">drag_indicator</span>
            </div>
          </div>
        }
      </div>
      <a [routerLink]="'/add-category'" [queryParams]="{ type: categoryFilter, referer: currentRoute }" class="add-category-button">
        <span class="material-icons">add</span>
        {{ 'categories.actions.addNew' | translate }}
      </a>
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
      background-color: var(--surface-color);
      padding: 1rem 0;
      z-index: 1;
      flex-wrap: wrap;
      gap: 1rem;
    }

    @media (max-width: 769px) {
      .section-header {
        top: 72px;
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
      background-color: var(--surface-color);
      border: 1px solid var(--border-color-light);
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
      color: var(--text-muted);
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
      cursor: grab;
      padding: 0.5rem;
    }

    .drag-handle:active{
      cursor: grabbing;
    }

    .add-category-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px dashed var(--dashed-border);
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

    .reset-order {
      margin-left: 10px;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 0.8em;
    }

    .reset-order:disabled {
      cursor: not-allowed !important;
    }

    .reset-order.dirty {
      background-color: #f44336 !important;
      color: white !important;
      border-color: #f44336 !important;
    }

  `,
  ],
})
export class CategoriesCardComponent implements OnInit {
  currentRoute: string;
  @Input() set categoriesExpnse(categories: Category[]) {
    this._categoriesExpnse = categories;
    this.checkOrderDirty('expense');
  }
  get categoriesExpnse(): Category[] {
    return this._categoriesExpnse;
  }
  private _categoriesExpnse: Category[] = [];

  @Input() set categoriesIncome(categories: Category[]) {
    this._categoriesIncome = categories;
    this.checkOrderDirty('income');
  }
  get categoriesIncome(): Category[] {
    return this._categoriesIncome;
  }
  private _categoriesIncome: Category[] = [];

  @Output() categoryDrop = new EventEmitter<CdkDragDrop<any[]>>();
  @Output() deleteCategory = new EventEmitter<Category>();
  @Output() resetOrder = new EventEmitter<'expense' | 'income'>();

  categoryFilter: 'expense' | 'income' = 'expense';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.currentRoute = this.router.url.split('?')[0];
  }

  isOrderDirty: { expense: boolean, income: boolean } = {
    expense: false,
    income: false
  };

  get getCategories() {
    return this.categoryFilter === 'expense' ? this.categoriesExpnse : this.categoriesIncome;
  }

  get currentOrderDirty(): boolean {
    return this.isOrderDirty[this.categoryFilter];
  }

  setCategoryFilter(filter: 'expense' | 'income') {
    this.categoryFilter = filter;
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.categoryFilter = params['type'] ?? 'expense'; // Default to 'expense' if 'type' is not found
    });

    // Check order dirty state when component initializes
    this.checkOrderDirty('expense');
    this.checkOrderDirty('income');
  }

  private checkOrderDirty(type: 'expense' | 'income') {
    const categories = type === 'expense' ? this._categoriesExpnse : this._categoriesIncome;
    
    // Check if the current order matches the original order by ID
    const isDirty = categories.some((category) => {
      // Assuming the original order is based on the first time the categories were added
      // This means the order should match the order of IDs
      const expectedOrder = this.getOriginalOrder(category);
      const isOrderChanged = category.order !== expectedOrder;
      
      return isOrderChanged;
    });

    this.isOrderDirty[type] = isDirty;
  }

  private getOriginalOrder(category: Category): number {
    // This method should return the original order based on the category's ID
    // Assuming lower IDs should have lower order numbers
    const categories = category.type === 'expense' 
      ? this._categoriesExpnse 
      : this._categoriesIncome;
    
    const sortedByID = [...categories].sort((a, b) => (a.id || 0) - (b.id || 0));
    const originalIndex = sortedByID.findIndex(c => c.id === category.id);
    
    return originalIndex + 1;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    const modifiedEvent = {
      ...event,
      categoryType: this.categoryFilter
    };
    this.categoryDrop.emit(modifiedEvent);

    // Check order dirty state after drop
    this.checkOrderDirty(this.categoryFilter);
  }

  resetCategoryOrder() {
    this.resetOrder.emit(this.categoryFilter);
  }
}
