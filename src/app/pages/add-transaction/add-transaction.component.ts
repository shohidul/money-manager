import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DbService } from '../../services/db.service';
import { categoryGroups } from '../../data/category-icons';
import { CalculatorSheetComponent } from '../../components/calculator-sheet/calculator-sheet.component';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, CalculatorSheetComponent, RouterLink],
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
        @for (group of filteredGroups; track group.name) {
          @for (icon of group.icons; track icon.name) {
            <button 
              class="category-item"
              [class.selected]="selectedIcon?.icon === icon.icon"
              (click)="selectCategory(icon)"
            >
              <span class="material-symbols-rounded">{{ icon.icon }}</span>
              <span class="category-name">{{ icon.name }}</span>
            </button>
          }
        }
        <a routerLink="/add-category" class="category-item add-category">
          <span class="material-icons">add</span>
          <span class="category-name">Add New</span>
        </a>
      </div>

      @if (selectedIcon) {
        <app-calculator-sheet
          [categoryIcon]="selectedIcon.icon"
          (amountChange)="onAmountChange($event)"
          (memoChange)="memo = $event"
          (dateChange)="transactionDate = $event"
          (save)="saveTransaction()"
        />
      }
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
      align-items: center;
      gap: 1rem;
      padding: 1rem;
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
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
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
      border: none;
      border-radius: 8px;
      background: none;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .category-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .category-item.selected {
      background-color: var(--primary-color);
      color: white;
    }

    .category-name {
      font-size: 0.75rem;
      text-align: center;
    }

    .add-category {
      border: 1px dashed rgba(0, 0, 0, 0.2);
    }
  `,
  ],
})
export class AddTransactionComponent {
  types: ('income' | 'expense')[] = ['expense', 'income'];
  selectedType: 'income' | 'expense' = 'expense';
  categoryGroups = categoryGroups;
  selectedIcon: any = null;
  amount = 0;
  memo = '';
  transactionDate = new Date();

  constructor(private dbService: DbService, private router: Router) {}

  get filteredGroups() {
    return this.categoryGroups.filter((group) =>
      group.icons.some((icon) => icon.type === this.selectedType)
    );
  }

  selectCategory(icon: any) {
    this.selectedIcon = icon;
  }

  onAmountChange(amount: number) {
    this.amount = amount;
  }

  async saveTransaction() {
    if (!this.selectedIcon || !this.amount) return;

    const category = await this.ensureCategory();

    const transaction = {
      type: this.selectedType,
      amount: this.amount,
      categoryId: category.id!,
      memo: this.memo,
      date: this.transactionDate,
    };

    await this.dbService.addTransaction(transaction);
    this.router.navigate(['/']);
  }

  private async ensureCategory() {
    // First try to find an existing category
    const categories = await this.dbService.getCategories();
    let category = categories.find(
      (c) => c.icon === this.selectedIcon.icon && c.type === this.selectedType
    );

    // If not found, create it
    if (!category) {
      const id = await this.dbService.addCategory({
        name: this.selectedIcon.name,
        icon: this.selectedIcon.icon,
        type: this.selectedType,
        isCustom: false,
      });
      category = {
        id,
        name: this.selectedIcon.name,
        icon: this.selectedIcon.icon,
        type: this.selectedType,
        isCustom: false,
      };
    }

    return category;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
