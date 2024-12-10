import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DbService } from '../../services/db.service';
import { CalculatorSheetComponent } from '../../components/calculator-sheet/calculator-sheet.component';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute } from '@angular/router';
import { TransactionSubType } from '../../models/transaction-types';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    CommonModule,
    CalculatorSheetComponent,
    RouterLink,
    MobileHeaderComponent,
  ],
  template: `
    <div class="add-transaction">
      <app-mobile-header
        title="Add Transaction"
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
          {{ type | titlecase }}
        </button>
      </div>

      <!--<div class="categories-header">
        <h3>Select Category</h3>
      </div>-->

      <div class="categories-grid">
        @for (category of filteredGroups; track category.name) {
            <button 
              class="category-item"
              [class.selected]="selectedIcon?.icon === category.icon"
              (click)="selectCategory(category)"
            >
              <span class="material-symbols-rounded">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </button>
        }
        <a [routerLink]="'/add-category'" [queryParams]="{ type: selectedType, referer: currentRoute }" class="category-item add-category">
          <span class="material-icons">add</span>
          <span class="category-name">Add New</span>
        </a> 
      </div>

      @if (selectedIcon) {
        <app-calculator-sheet
          [isVisible]="showCalculator"
          [categoryIcon]="selectedIcon.icon"
          (toggle)="onChildToggle()"
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
export class AddTransactionComponent implements OnInit {
  types: ('income' | 'expense')[] = ['expense', 'income'];
  selectedType: 'income' | 'expense' = 'expense';
  selectedSubType: TransactionSubType = 'none';
  categories: any[] = [];
  selectedIcon: any = null;
  amount = 0;
  memo = '';
  transactionDate = new Date();
  showCalculator = false;
  currentRoute: string;

  constructor(
    private dbService: DbService,
    private categoryService: CategoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.currentRoute = this.router.url.split('?')[0];
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.selectedType = params['type'] ?? 'expense';
      this.selectedSubType = params['subType'] ?? 'none';

      const editedTransaction = params['editedTransaction']
        ? JSON.parse(params['editedTransaction'])
        : null;
      if (editedTransaction) {
        this.selectedType = editedTransaction.type;
        this.selectedSubType = editedTransaction.subType;
        this.amount = editedTransaction.amount;
        const category = this.dbService.getCategoryById(
          editedTransaction.categoryId
        );
        this.selectCategory(category);
        this.memo = editedTransaction.memo;
        this.transactionDate = editedTransaction.date;
      }
    });

    await this.categoryService.initializeDefaultCategories();
    await this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getAllCategories();
  }

  onTypeChange(type: 'income' | 'expense') {
    this.selectedType = type;
    this.selectedSubType = 'none';
    this.selectedIcon = null;
    this.showCalculator = false;
  }

  get filteredGroups() {
    return this.categories.filter(
      (category) => 
        category.type === this.selectedType
    );
  }

  selectCategory(categoryIcon: any) {
    this.selectedIcon = categoryIcon;
    this.selectedSubType = categoryIcon.subType;
    this.toggleCalculator();
  }

  toggleCalculator() {
    this.showCalculator = true;
  }

  onChildToggle() {
    this.showCalculator = false;
    this.selectedIcon = null;
  }

  onAmountChange(amount: number) {
    this.amount = amount;
  }

  async saveTransaction() {
    if (!this.selectedIcon || !this.amount) return;

    const category = await this.ensureCategory();

    const transaction = {
      type: this.selectedType,
      subType: this.selectedSubType,
      amount: this.amount,
      categoryId: category.id!,
      memo: this.memo,
      date: this.transactionDate,
    };

    await this.dbService.addTransaction(transaction);
    this.router.navigate(['/']);
  }

  private async ensureCategory() {
    const categories = await this.dbService.getCategories();
    let category = categories.find(
      (c) => 
        c.icon === this.selectedIcon.icon && 
        c.type === this.selectedType &&
        c.subType === this.selectedSubType
    );

    if (!category) {
      const id = await this.dbService.addCategory({
        name: this.selectedIcon.name,
        icon: this.selectedIcon.icon,
        type: this.selectedType,
        subType: this.selectedSubType,
        isCustom: false,
      });
      category = {
        id,
        name: this.selectedIcon.name,
        icon: this.selectedIcon.icon,
        type: this.selectedType,
        subType: this.selectedSubType,
        isCustom: false,
      };
    }

    return category;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}