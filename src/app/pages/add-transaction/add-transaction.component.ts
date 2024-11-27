import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService, Category, Transaction } from '../../services/db.service';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-transaction">
      <header class="top-bar">
        <button class="back-button" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
        </button>
        <h2>Add Transaction</h2>
      </header>

      <div class="type-tabs">
        <button 
          *ngFor="let type of types" 
          [class.active]="selectedType === type"
          (click)="selectedType = type"
          class="type-tab"
        >
          {{ type | titlecase }}
        </button>
      </div>

      <div class="categories-grid">
        <div 
          *ngFor="let category of filteredCategories" 
          class="category-item"
          [class.selected]="selectedCategory?.id === category.id"
          (click)="selectCategory(category)"
        >
          <span class="material-symbols-rounded">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </div>
        <div class="category-item add-category" (click)="showAddCategory = true">
          <span class="material-icons">add</span>
          <span class="category-name">Add New</span>
        </div>
      </div>

      <div *ngIf="selectedCategory" class="bottom-sheet">
        <div class="sheet-header">
          <span class="material-symbols-rounded">{{ selectedCategory.icon }}</span>
          <input 
            type="text" 
            [(ngModel)]="memo" 
            placeholder="Add memo"
            class="memo-input"
          >
          <span class="amount">{{ amount | currency }}</span>
        </div>

        <div class="keypad">
          <button *ngFor="let key of keys" (click)="onKeyPress(key)" class="key">
            {{ key }}
          </button>
        </div>
      </div>

      <div *ngIf="showAddCategory" class="add-category-modal">
        <div class="modal-content">
          <h3>Add New Category</h3>
          <input 
            type="text" 
            [(ngModel)]="newCategory.name" 
            placeholder="Category Name"
            class="category-input"
          >
          <div class="icon-grid">
            <button 
              *ngFor="let icon of availableIcons" 
              (click)="newCategory.icon = icon"
              [class.selected]="newCategory.icon === icon"
              class="icon-button"
            >
              <span class="material-symbols-rounded">{{ icon }}</span>
            </button>
          </div>
          <div class="modal-actions">
            <button (click)="showAddCategory = false">Cancel</button>
            <button (click)="addCategory()" class="primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .add-transaction {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-bar {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      background-color: var(--surface-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
    }

    .type-tabs {
      display: flex;
      padding: 1rem;
      gap: 1rem;
    }

    .type-tab {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .type-tab.active {
      background-color: var(--primary-color);
      color: white;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      padding: 1rem;
      overflow-y: auto;
    }

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .category-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .category-item.selected {
      background-color: var(--primary-color);
      color: white;
    }

    .bottom-sheet {
      margin-top: auto;
      background-color: var(--surface-color);
      padding: 1rem;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    }

    .sheet-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .memo-input {
      flex: 1;
      border: none;
      padding: 0.5rem;
      font-size: 1rem;
    }

    .keypad {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      padding: 1rem;
    }

    .key {
      padding: 1rem;
      border: none;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.04);
      cursor: pointer;
      font-size: 1.25rem;
    }

    .add-category-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-content {
      background-color: var(--surface-color);
      padding: 1.5rem;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
    }

    .category-input {
      width: 100%;
      padding: 0.75rem;
      margin: 1rem 0;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .icon-button {
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.04);
    }

    .icon-button.selected {
      background-color: var(--primary-color);
      color: white;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .modal-actions button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .modal-actions button.primary {
      background-color: var(--primary-color);
      color: white;
    }
  `,
  ],
})
export class AddTransactionComponent implements OnInit {
  selectedType: 'income' | 'expense' = 'expense';
  types: ('income' | 'expense')[] = ['income', 'expense'];
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  amount = '0';
  memo = '';
  showAddCategory = false;
  newCategory: Partial<Category> = {
    name: '',
    icon: 'help',
    isCustom: true,
  };

  keys = [
    '1',
    '2',
    '3',
    'date',
    '4',
    '5',
    '6',
    '+',
    '7',
    '8',
    '9',
    '-',
    '.',
    '0',
    '⌫',
    '=',
  ];
  availableIcons = [
    'shopping_cart',
    'restaurant',
    'directions_car',
    'home',
    'movie',
    'medical_services',
    'school',
    'flight',
    'sports',
    'pets',
    'card_giftcard',
    'attach_money',
    'account_balance',
    'savings',
  ];

  constructor(private dbService: DbService, private router: Router) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  get filteredCategories() {
    return this.categories.filter((c) => c.type === this.selectedType);
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }

  async addCategory() {
    if (!this.newCategory.name || !this.newCategory.icon) return;

    const category: Omit<Category, 'id'> = {
      name: this.newCategory.name,
      icon: this.newCategory.icon,
      type: this.selectedType,
      isCustom: true,
    };

    await this.dbService.addCategory(category);
    await this.loadCategories();
    this.showAddCategory = false;
    this.newCategory = { name: '', icon: 'help', isCustom: true };
  }

  onKeyPress(key: string) {
    switch (key) {
      case '⌫':
        this.amount = this.amount.slice(0, -1);
        break;
      case '=':
        this.saveTransaction();
        break;
      case 'date':
        // TODO: Implement date picker
        break;
      default:
        this.amount += key;
    }
  }

  async saveTransaction() {
    if (!this.selectedCategory || !this.amount) return;

    const transaction: Omit<Transaction, 'id'> = {
      type: this.selectedType,
      amount: parseFloat(this.amount),
      categoryId: this.selectedCategory.id!,
      memo: this.memo,
      date: new Date(),
    };

    await this.dbService.addTransaction(transaction);
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
