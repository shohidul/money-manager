import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../../services/db.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction-types';
import { AssetTransaction, isAssetTransaction, isAssetCostTransaction, isAssetIncomeTransaction } from '../../../models/transaction-types';
import { TranslateNumberPipe } from "../../../components/shared/translate-number.pipe";
import { TranslatePipe } from "../../../components/shared/translate.pipe";
import { TranslateDatePipe } from "../../../components/shared/translate-date.pipe";
import { FilterBarComponent } from '../../../components/filter-bar/filter-bar.component';
import { FilterOptions } from '../../../utils/transaction-filters';

interface AssetGroup {
  assetName: string;
  quantity: number;
  measurementUnit: string;
  value: number;
  purchaseDate: Date;
  transactions: Transaction[];
}

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateNumberPipe,
    TranslatePipe,
    TranslateDatePipe,
    FilterBarComponent
  ],
  template: `
    <div class="asset-management">
      <app-filter-bar
        [filters]="filters"
        [showStatus]="false"
        (filtersChange)="onFiltersChange($event)"
        (startDateChange)="onStartDateChange($event)"
        (endDateChange)="onEndDateChange($event)"
      />

      <div class="asset-summary card">
        <div class="summary-item">
          <span class="label">{{ 'asset.stats.totalAssets' | translate }} <span class="text-muted text-sm">({{ totalAssets | translateNumber:'1.0-2' }})</span></span>
          <span class="amount positive">{{ totalAssetValue | translateNumber:'1.0-2' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">{{ 'asset.stats.totalIncome' | translate }} <span class="text-muted text-sm">({{ totalIncomeCount | translateNumber:'1.0-2' }})</span></span>
          <span class="amount positive">{{ totalIncome | translateNumber:'1.0-2' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">{{ 'asset.stats.totalCost' | translate }} <span class="text-muted text-sm">({{ totalCostCount | translateNumber:'1.0-2' }})</span></span>
          <span class="amount negative">{{ totalCost | translateNumber:'1.0-2' }}</span>
        </div>
      </div>

      <div class="asset-section">
        @for (group of assetGroups; track group.assetName) {
          <div class="asset-group card">
            <div class="asset-header">
              <span class="material-symbols-rounded">real_estate_agent</span>
              <div class="asset-details">
                <span class="asset-name">{{ group.assetName }}</span>
                <span class="small-text">
                  {{ group.quantity | translateNumber:'1.0-2' }} {{ group.measurementUnit }} | 
                  {{ 'asset.purchaseDate' | translate }}: {{ group.purchaseDate | translateDate }} |
                  {{ 'asset.value' | translate }}: {{ group.value | translateNumber:'1.0-2' }}
                </span>
              </div>
            </div>

            <div class="transactions">
              @for (tx of group.transactions; track tx.id) {
                <div class="transaction-item" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
                  <span class="material-symbols-rounded" [class]="tx.type">
                    {{ getCategoryIcon(tx.categoryId) }}
                  </span>
                  <div class="transaction-details">
                    <span class="small-text">{{ tx.date | translateDate }}, {{ tx.date | translateDate: 'shortTime' }}</span>
                    <span class="memo">{{ getCategoryName(tx.categoryId) | translate }}</span>
                    <span class="small-text">{{ tx.memo || ('common.noMemo' | translate) }}</span>
                  </div>
                  <span class="amount" [class.positive]="tx.type === 'income'" [class.negative]="tx.type === 'expense'">
                    {{ tx.amount | translateNumber:'1.0-2' }}
                  </span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .asset-management {
      margin-bottom: 1rem;
    }

    .asset-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      text-align: center;
      margin-bottom: 1rem;
      padding: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--surface-color);
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px var(--box-shadow-color-light);
    }

    .asset-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .asset-group {
      padding: 1rem;
      background: var(--surface-color);
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px var(--box-shadow-color-light);
    }

    .asset-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--background-color);
    }

    .asset-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .asset-name {
      font-weight: 500;
    }

    .transactions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.1rem 1rem 0.8rem 1rem;
      margin: 0 -1rem;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--background-color);
      font-size: 0.875rem;
    }

    .transaction-item:hover {
      background-color: var(--background-color-hover);
    }

    .transaction-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .material-symbols-rounded {
      padding: 0.5rem;
      border-radius: 0.5rem;
      background: var(--background-color);
    }

    .material-symbols-rounded.income {
      color: var(--text-success);
    }

    .material-symbols-rounded.expense {
      color: var(--text-danger);
    }

    .amount {
      font-weight: 500;
    }

    .amount.positive {
      color: var(--text-success);
    }

    .amount.negative {
      color: var(--text-danger);
    }

    .small-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .memo {
      display: block;
      font-weight: 500;
    }

    .text-muted {
      color: var(--text-muted);
    }

    .text-sm {
      font-size: 0.875rem;
    }
  `]
})
export class AssetListComponent implements OnInit {
  assetGroups: AssetGroup[] = [];

  totalAssets = 0;
  totalAssetValue = 0;
  totalIncome = 0;
  totalIncomeCount = 0;
  totalCost = 0;
  totalCostCount = 0;

  filters: FilterOptions = {};
  private categories: { [key: number]: Category } = {};

  constructor(
    private dbService: DbService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    try {
      // Get start and end dates
      let startDate: Date;
      let endDate: Date;

      if (this.filters.startDate) {
        startDate = this.filters.startDate;
      } else {
        // Default to start of current year
        startDate = new Date(new Date().getFullYear(), 0, 1);
      }

      if (this.filters.endDate) {
        endDate = this.filters.endDate;
      } else {
        // Default to current date
        endDate = new Date();
      }

      // Load categories
      const categories = await this.categoryService.getAllCategories() as Category[];
      this.categories = categories.reduce((acc: { [key: number]: Category }, cat: Category) => {
        if (cat.id !== undefined && cat.id !== null) {
            acc[cat.id] = cat;
        }
        return acc;
    }, {});

      // Load transactions
      const transactions = await this.dbService.getTransactions(startDate, endDate) as AssetTransaction[];
      const assetTransactions = transactions.filter(tx => 
        isAssetTransaction(tx) || isAssetCostTransaction(tx) || isAssetIncomeTransaction(tx)
      );

      // Group transactions by asset
      const groupedTransactions = this.groupTransactionsByAsset(assetTransactions);
      this.assetGroups = groupedTransactions;

      // Calculate totals
      this.calculateTotals();
    } catch (error) {
      console.error('Error loading asset data:', error);
    }
  }

  private groupTransactionsByAsset(transactions: AssetTransaction[]): AssetGroup[] {
    const groups = new Map<string, AssetGroup>();

    transactions.forEach((tx) => {
      const assetTx = tx as AssetTransaction & { assetName: string };

      groups.set(assetTx.assetName, {
        assetName: assetTx.assetName,
        quantity: assetTx?.quantity || 0,
        measurementUnit: assetTx?.measurementUnit || '',
        value: assetTx?.amount || 0,
        purchaseDate: assetTx?.date || new Date(),
        transactions: []
      });

      if (!isAssetTransaction(assetTx)) { // Only add cost and income transactions
        groups.get(tx.assetName)!.transactions.push(assetTx);
      }
    });

    return Array.from(groups.values());
  }

  private calculateTotals() {
    this.totalAssets = this.assetGroups.length;
    this.totalAssetValue = this.assetGroups.reduce((sum, group) => sum + group.value, 0);

    let incomeCount = 0;
    let costCount = 0;
    let totalIncome = 0;
    let totalCost = 0;

    this.assetGroups.forEach(group => {
      group.transactions.forEach(tx => {
        if (isAssetIncomeTransaction(tx)) {
          incomeCount++;
          totalIncome += tx.amount;
        } else if (isAssetCostTransaction(tx)) {
          costCount++;
          totalCost += tx.amount;
        }
      });
    });

    this.totalIncome = totalIncome;
    this.totalIncomeCount = incomeCount;
    this.totalCost = totalCost;
    this.totalCostCount = costCount;
  }

  getCategoryIcon(categoryId: number): string {
    const category = this.categories[categoryId];
    return category?.icon || 'category';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories[categoryId];
    return category?.name || 'Unknown';
  }

  onFiltersChange(filters: FilterOptions) {
    this.filters = filters;
    this.loadData();
  }

  onStartDateChange(date: Date) {
    this.filters.startDate = date;
    this.loadData();
  }

  onEndDateChange(date: Date) {
    this.filters.endDate = date;
    this.loadData();
  }
}