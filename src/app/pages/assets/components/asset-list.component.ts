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
import { Router } from '@angular/router';
import { ModalComponent } from '../../../components/modal.component'

export interface AssetGroup {
  id: number;
  assetName: string;
  type: string;
  categoryId: number;
  quantity: number;
  measurementUnit: string;
  value: number;
  purchaseDate: Date;
  transactions: Transaction[];
  totalCost: number;
  totalIncome: number;
}

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateNumberPipe,
    TranslatePipe,
    TranslateDatePipe,
    FilterBarComponent,
    ModalComponent
  ],
  template: `
    <div class="asset-management">
      <!-- <app-filter-bar
        [filters]="filters"
        [showStatus]="false"
        (filtersChange)="onFiltersChange($event)"
        (startDateChange)="onStartDateChange($event)"
        (endDateChange)="onEndDateChange($event)"
      /> -->

      <div class="asset-summary">
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
      <div class="asset-tools">
        <button class="settings"
        (click)="openModal()"
        >
          <span class="material-symbols-rounded text-secondary">settings</span>
        </button>
      </div>
      <div class="asset-section">
        @for (group of assetGroups; track group.id) {
          @if (!this.groupAssetSettings.includes(group.categoryId)) {
            <div class="asset-group card" (click)="gotoAssetDetails(group)">
              <div class="asset-header">
                <span class="material-symbols-rounded" [class]="group.type">{{ getCategoryIcon(group.categoryId) }}</span>
                <div class="asset-details">
                  <span class="asset-name">{{ getCategoryName(group.categoryId) | translate }}</span>
                  <span class="small-text">
                    {{ group.assetName | translate }} | 
                    {{ group.quantity | translateNumber:'1.0-2' }} {{ group.measurementUnit | translate }} | 
                    {{ 'asset.value' | translate }}: {{ group.value | translateNumber:'1.0-2' }} | 
                    {{ 'asset.purchaseDate' | translate }}: {{ group.purchaseDate | translateDate }}
                  </span>
                </div>
              </div>
              <div class="asset-group-body">
                <span>{{ 'asset.cost' | translate }}: {{group.totalCost | translateNumber:'1.0-2'}}</span> 
                <span>|</span> 
                <span>{{ 'asset.income' | translate }}: {{group.totalIncome | translateNumber:'1.0-2'}}</span>
              </div>
            </div>
          }
        }

        @if (this.groupAssetSettings.length > 0) {
          @for (cid of this.groupAssetSettings; track cid) {
            @if (this.getStat(cid)) {
              <div class="asset-group card" (click)="toggleCategory(cid)">
                <div class="asset-header">
                  <span class="material-symbols-rounded" [class]="getStat(cid).type">{{ getCategoryIcon(getStat(cid).categoryId) }}</span>
                  <div class="asset-details">
                    <span class="asset-name">{{ getCategoryName(getStat(cid).categoryId) | translate }}<span class="text-sm text-muted"> ({{getStat(cid).count | translateNumber:'1.0-0'}})</span></span>
                    <span class="small-text">
                      {{ getStat(cid).quantity | translateNumber:'1.0-2' }} {{ getStat(cid).unit | translate }} | 
                      {{ 'asset.value' | translate }}: {{ getStat(cid).amount | translateNumber:'1.0-2' }}
                    </span>
                  </div>
                  <span class="material-symbols-rounded">keyboard_arrow_down</span>
                </div>
                <div class="asset-group-body">
                  <span>{{ 'asset.cost' | translate }}: {{getStat(cid).totalCost | translateNumber:'1.0-2'}}</span> 
                  <span>|</span> 
                  <span>{{ 'asset.income' | translate }}: {{getStat(cid).totalIncome | translateNumber:'1.0-2'}}</span>
                </div>
                @if (expandedCategories.includes(cid)) {
                  <div class="children">
                    @for (group of getAssetGroupsByCategory(cid); let i = $index; track group.id) {
                      <div class="asset-group card" (click)="gotoAssetDetails(group)">
                        <div class="asset-header">
                          <span class="material-symbols-rounded" [class]="group.type">{{ getCategoryIcon(group.categoryId) }}</span>
                          <div class="asset-details">
                            <span class="asset-name">{{ getCategoryName(group.categoryId) | translate }}</span>
                            <span class="small-text">
                              {{ group.assetName | translate }} | 
                              {{ group.quantity | translateNumber:'1.0-2' }} {{ group.measurementUnit | translate }} | 
                              {{ 'asset.value' | translate }}: {{ group.value | translateNumber:'1.0-2' }} | 
                              | {{ 'asset.purchaseDate' | translate }}: {{ group.purchaseDate | translateDate }}
                            </span>
                          </div>
                        </div>
                        <div class="asset-group-body">
                          <span>{{ 'asset.cost' | translate }}: {{group.totalCost | translateNumber:'1.0-2'}}</span> 
                          <span>|</span> 
                          <span>{{ 'asset.income' | translate }}: {{group.totalIncome | translateNumber:'1.0-2'}}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }
        }
      </div>
    </div>

    <app-modal class="modal" *ngIf="showModal"
      modalTitle="{{ 'asset.settings' | translate }}" 
      (close)="showModal = false"
      (save)="saveSettings()"
    >
      <p class="settings-title">{{ 'asset.groupAssets' | translate }}</p>
      <div class="asset-settings">
        @for (categoryId of getUniqueAssets(); track categoryId) {
          <label class="asset-item">
            <input type="checkbox" class="asset-checkbox" value="{{ categoryId }}">
            <span class="asset-label">{{ getCategoryName(categoryId) | translate }}</span>
          </label>
        }
      </div>
    </app-modal>

  `,
  styles: [`
    .asset-management {
      margin-bottom: 1rem;
    }

    .asset-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
      background: var(--surface-color);
      box-shadow: 0 2px 4px var(--box-shadow-color-light);
    }

    .summary-item .label {
      font-size: small;
    }

    .summary-item .value {
      font-size: 1.1rem;
    }

    .asset-tools {
      text-align: right;
    }

    .asset-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .asset-group {
      margin-bottom: 0;
      padding: 1rem;
      background: var(--surface-color);
      box-shadow: 0 2px 4px var(--box-shadow-color-light);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .children{
      margin: 1rem -1rem -1rem -1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background-color: var(--background-color);
    }

    @media (max-width: 768px) {
      .asset-group {
        width: 100%;
      }
    }

    .asset-group:hover{
      box-shadow: 0 4px 16px var(--box-shadow-color-light);
    }

    .asset-group-body {
      display: flex;
      justify-content: space-around;
      font-size: x-small;
      background-color: var(--background-color);
      padding: 0.5rem;
      border-radius: 5px;
    }

    .asset-group-body span {
      width: -webkit-fill-available;
      text-align: center;
    }

    .asset-header {
      display: flex;
      align-items: center;
      padding-bottom: 0.5rem;
    }

    .asset-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .asset-name {
      font-weight: 500;
    }

    .transactions {
      display: flex;
      flex-direction: column;
      border-left: 2px solid var(--border-color);
      padding: 0.5rem 1rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: background-color 0.2s;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      margin: 0 -1rem;
      cursor: pointer;
      border-bottom: 1px solid var(--background-color);
    }

    .transaction-item:hover {
      background-color: var(--background-color-hover);
    }

    .transaction-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .transaction-details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .transaction-details-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .asset-header .material-symbols-rounded {
      font-size: xx-large;
      padding: 0.5rem;
      border-radius: 2rem;
      background: var(--surface-color);
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

    .modal .settings-title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .modal .asset-settings {
      display: flex;
      flex-direction: column;
    }

    .modal .asset-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      transition: background 0.2s;
      cursor: pointer;
    }

    .modal .asset-item:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .modal .asset-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .modal .asset-label {
      font-size: 1rem;
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
  showModal = false;
  groupAssetSettings: any[] = [];
  groupedAssetSettings: any[] = [];
  categoryStats: any;
  expandedCategories: number[] = [];

  filters: FilterOptions = {};
  private categories: any[] = [];

  constructor(
    private router: Router,
    private dbService: DbService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    this.getGroupedAssets();
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
      this.categories = await this.categoryService.getAllCategories() as Category[];
    //   this.categories = categories.reduce((acc: { [key: number]: Category }, cat: Category) => {
    //     if (cat.id !== undefined && cat.id !== null) {
    //         acc[cat.id] = cat;
    //     }
    //     return acc;
    // }, {});

      // Load transactions
      const parent = await this.dbService.getTransactions(new Date(0), new Date()) as AssetTransaction[];
      const parentTransactions = parent.filter(tx => 
        isAssetTransaction(tx)
      );
      const children = await this.dbService.getTransactions(startDate, endDate) as AssetTransaction[];
      const childTransactions = children.filter(tx => 
        isAssetCostTransaction(tx) || isAssetIncomeTransaction(tx)
      );

      const allTransactions = [...parentTransactions, ...childTransactions];

      // Group transactions by asset
      const groupedTransactions = this.groupTransactionsByAsset(allTransactions);
      this.assetGroups = groupedTransactions;

      this.categoryStats = this.calculateCategoryStats(parentTransactions);

      // Calculate totals
      this.calculateTotals();
    } catch (error) {
      console.error('Error loading asset data:', error);
    }
  }

  calculateCategoryStats( transactions: AssetTransaction[]) {
    const stats = new Map<number, any>();
    let totalAmount = 0;

    transactions.forEach((tx) => {
      if (!stats.has(tx.categoryId)) {
        const category = this.categories.find((c) => c.id === tx.categoryId);
        stats.set(tx.categoryId, {
          categoryId: tx.categoryId,
          category: category?.name || 'Unknown',
          type: category.type,
          amount: 0,
          quantity: 0,
          unit: tx.measurementUnit,
          totalCost: 0,
          totalIncome: 0,
          count: 0
        });
      }

      const stat = stats.get(tx.categoryId);
      stat.amount += tx.amount;
      stat.quantity += tx.quantity;
      stat.count += 1;
    });

    this.assetGroups.forEach(group => {
      if (this.groupAssetSettings.includes(group.categoryId)) {
        const stat = stats.get(group.categoryId);
        stat.totalCost += group.totalCost;
        stat.totalIncome += group.totalIncome;
      }
    })

    return stats;
  }

  getStat(categoryId: number) {
    return this.categoryStats?.get(categoryId) || null;
  }
  

  private groupTransactionsByAsset(transactions: AssetTransaction[]): AssetGroup[] {
    const groups = new Map<number, AssetGroup>();

    transactions.filter(tx => isAssetTransaction(tx)).forEach((tx) => {
      const assetTx = tx as AssetTransaction & { assetName: string };

      groups.set(assetTx.id!, {
        id: assetTx.id!,
        assetName: assetTx.assetName,
        type: tx.type,
        categoryId: assetTx.categoryId,
        quantity: assetTx?.quantity || 0,
        measurementUnit: assetTx?.measurementUnit || '',
        value: assetTx?.amount || 0,
        purchaseDate: assetTx?.transactionDate || assetTx?.date ,
        transactions: [],
        totalCost: 0,
        totalIncome: 0
      });

      transactions.filter(tx => tx.parentId === assetTx.id).forEach(tx => {
        groups.get(assetTx.id!)!.transactions.push(tx);
        groups.get(assetTx.id!)!.totalCost += tx.type === 'expense' ? (tx.amount || 0) : 0;
        groups.get(assetTx.id!)!.totalIncome += tx.type === 'income' ? (tx.amount || 0) : 0;
      });

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

  toggleCategory(categoryId: number) {
    const index = this.expandedCategories.indexOf(categoryId);
    if (index === -1) {
      this.expandedCategories.push(categoryId);
    } else {
      this.expandedCategories.splice(index, 1);
    }
  }

  getAssetGroupsByCategory(categoryId: number) {
    return this.assetGroups.filter(group => group.categoryId === categoryId);
  }

  getCategoryIcon(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  onFiltersChange(filters: FilterOptions) {
    this.filters = filters;
    // this.loadData();
  }

  onStartDateChange(date: Date) {
    this.filters.startDate = date;
    // this.loadData();
  }

  onEndDateChange(date: Date) {
    this.filters.endDate = date;
    // this.loadData();
  }

  gotoAssetDetails(group: AssetGroup) {
    this.router.navigate(["/asset-details"], {
      queryParams: { 
        group: JSON.stringify(group),
      },
    });
  }

  getUniqueAssets(): number[] {
    const uniqueAssets = new Set<number>();
    this.assetGroups.forEach(group => uniqueAssets.add(group.categoryId));
    return Array.from(uniqueAssets);
  }

  openModal() {
    this.showModal = true;
    setTimeout(() => this.setGroupedAssets(), 0);
  }

  saveSettings() {
    const selectedValues = Array.from(document.querySelectorAll<HTMLInputElement>('.asset-checkbox:checked'))
      .map(checkbox => checkbox.value);
  
    localStorage.setItem('groupedAssets', JSON.stringify(selectedValues));
    this.showModal = false;

    this.getGroupedAssets();
    this.loadData();
  }  

  getGroupedAssets() {
    this.groupAssetSettings = JSON.parse(localStorage.getItem('groupedAssets') || '[]')
      .map((value: any) => Number(value)); // Convert back to numbers
  }

  setGroupedAssets() {
    this.groupAssetSettings.forEach((value: number) => {
      const checkbox = document.querySelector<HTMLInputElement>(`.asset-checkbox[value="${value}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }
}