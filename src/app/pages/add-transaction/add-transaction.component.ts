import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DbService } from '../../services/db.service';
import { CalculatorSheetComponent } from '../../components/calculator-sheet/calculator-sheet.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { CategoryService } from '../../services/category.service';
import { TransactionSubType, Transaction } from '../../models/transaction-types';
import { TranslatePipe } from '../../components/shared/translate.pipe';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, CalculatorSheetComponent, RouterLink, MobileHeaderComponent, TranslatePipe],
  template: `
    <div class="add-transaction">
      <app-mobile-header
        [title]="isEditMode ? ('transaction.title.edit' | translate) : ('transaction.title.add' | translate)"
        [showBackButton]="true"
        [showOnDesktop]="true" 
        (back)="goBack()"
      />
      
      <div class="type-tabs">
        <button 
          *ngFor="let type of types" 
          [class.active]="selectedType === type"
          (click)="onTypeChange(type)"
          class="type-tab"
        >
          {{ 'transaction.types.' + type | translate }}
        </button>
      </div>

      <div class="categories-grid" #categoriesGrid>
        @for (category of filteredGroups; track category.name) {
          <button 
            class="category-item"
            [class.selected]="selectedIcon?.icon === category.icon && selectedIcon?.name === category.name"
            (click)="selectCategory(category)"
            #categoryButton
          >
            <span class="material-symbols-rounded">{{ category.icon }}</span>
            <span class="category-name">{{ category.name | translate }}</span>
          </button>
        }
        <a [routerLink]="'/add-category'" [queryParams]="{ type: selectedType, referer: currentRoute }" class="category-item add-category">
          <span class="material-icons">add</span>
          <span class="category-name">{{ 'common.add' | translate }}</span>
        </a>
      </div>

      @if (selectedIcon) {
        <app-calculator-sheet
          [isVisible]="showCalculator"
          [categoryIcon]="selectedIcon.icon"
          [initialAmount]="amount.toString()"
          [initialMemo]="memo"
          [initialDate]="transactionDate"
          (toggle)="onCalculatorClose()"
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
      position: relative;
    }

    .categories-header {
      position: sticky;
      top: 0;
      background: var(--background-color);
      padding: 1rem;
      z-index: 10;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .categories-header h3 {
      margin: 0;
      color: var(--text-secondary);
    }

    .type-tabs {
      display: flex;
      padding: 1rem;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .type-tabs {
        padding: 0 1rem 1rem 1rem;
      }
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

    body .main {
      overflow-y: hidden !important;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
      padding: 1rem 1rem 3.125rem 1rem;
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
      outline: none;
    }

    .category-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .category-item.selected {
      background-color: var(--primary-color);
      color: white !important;
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
export class AddTransactionComponent implements OnInit {
  types = ['expense', 'income'] as const;
  selectedType: 'income' | 'expense' = 'expense';
  selectedSubType: TransactionSubType = 'none';
  categories: any[] = [];
  selectedIcon: any = null;
  amount = 0;
  memo = '';
  transactionDate = new Date();
  showCalculator = false;
  currentRoute: string;
  isEditMode = false;
  editingTransaction: Transaction | null = null;

  constructor(
    private dbService: DbService,
    private categoryService: CategoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.currentRoute = this.router.url.split('?')[0];
  }

  async ngOnInit() {
    await this.categoryService.initializeDefaultCategories();
    await this.loadCategories();

    this.activatedRoute.queryParams.subscribe((params) => {
      this.selectedType = params['type'] ?? 'expense'; // Default to 'expense' if 'type' is not found
    });

    const params = this.activatedRoute.snapshot.queryParams;
    if (params['editedTransaction']) {
      const transaction = JSON.parse(params['editedTransaction']);
      await this.setupEditMode(transaction);
    }
  }

  private async setupEditMode(transaction: Transaction) {
    this.isEditMode = true;
    this.editingTransaction = transaction;
    this.selectedType = transaction.type;
    this.amount = transaction.amount;
    this.memo = transaction.memo;
    this.transactionDate = new Date(transaction.date);

    const category = await this.dbService.getCategoryById(transaction.categoryId);
    if (category) {
      this.selectCategory(category);
    }
  }

  async loadCategories() {
    // Fetch categories only if not already loaded or if the type has changed
    if (this.categories.length === 0 || 
        !this.categories.some(c => c.type === this.selectedType)) {
      this.categories = await this.categoryService.getAllCategories();
    }
  }

  get filteredGroups() {
    // Memoize filtered categories to prevent unnecessary recalculations
    return this.categories.filter(c => c.type === this.selectedType);
  }

  onTypeChange(type: 'income' | 'expense') {
    this.selectedType = type;
  }

  selectCategory(category: any) {
    this.selectedIcon = category;
    this.selectedSubType = category.subType;
    this.showCalculator = true;
  }

  onCalculatorClose() {
    this.showCalculator = false;
    if (!this.isEditMode) {
      this.selectedIcon = null;
    }
  }

  onAmountChange(amount: number) {
    this.amount = amount;
  }

  async saveTransaction() {
    if (!this.selectedIcon || !this.amount) return;

    const category = await this.ensureCategory();
    const transaction = {
      ...(this.editingTransaction || {}),
      ...(this.editingTransaction ? { id: this.editingTransaction.id } : {}),
      type: this.selectedType,
      subType: this.selectedSubType,
      amount: this.amount,
      categoryId: category.id!,
      memo: this.memo,
      date: this.transactionDate,
    };

    if (this.isEditMode) {
      await this.dbService.updateTransaction(transaction as Transaction);
    } else {
      await this.dbService.addTransaction(transaction);
    }

    this.router.navigate(['/']);
  }

  private async ensureCategory() {
    const categories = await this.dbService.getCategories();
    return categories.find(c => c.icon === this.selectedIcon.icon && 
                               c.type === this.selectedType &&
                               c.subType === this.selectedSubType) || 
           await this.createNewCategory();
  }

  private async createNewCategory() {
    const id = await this.dbService.addCategory({
      name: this.selectedIcon.name,
      icon: this.selectedIcon.icon,
      type: this.selectedType,
      subType: this.selectedSubType,
      isCustom: false,
    });
    return {
      id,
      name: this.selectedIcon.name,
      icon: this.selectedIcon.icon,
      type: this.selectedType,
      subType: this.selectedSubType,
      isCustom: false,
    };
  }

  goBack() {
    this.router.navigate(['/']);
  }
}