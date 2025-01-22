import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { FuelListComponent } from './components/fuel-list.component';
import { FuelChartsComponent } from './components/fuel-charts.component';
import { Category, DbService } from '../../services/db.service';
import { isFuelTransaction, FuelTransaction } from '../../models/transaction-types';
import { FilterOptions } from '../../utils/transaction-filters';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import { calculateMileage } from '../../utils/fuel.utils';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { CategoryService } from '../../services/category.service';
import { TranslatePipe} from '../../components/shared/translate.pipe';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, FuelListComponent, FuelChartsComponent, FilterBarComponent, TranslatePipe],
  template: `
    <div class="fuel">
      <app-mobile-header
        title="{{ 'fuel.fuelLogs' | translate }}"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <app-filter-bar 
          [filters]="filters" 
          [fuelCategories]="fuelCategories"
          [showFuelCategories]="true"
          (filtersChange)="onFiltersChange($event)"
          (startDateChange)="onStartDateChange($event)"
          (endDateChange)="onEndDateChange($event)"
        />
        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">{{ 'fuel.logs' | translate }}</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">{{ 'fuel.analytics' | translate }}</button>
        </div>

        @if (activeTab === 'list') {
          <app-fuel-list [transactionGroups]="transactionGroups" [fuelCategories]="fuelCategories" (filtersChange)="onFiltersChange($event)" />
        } @else {
          <app-fuel-charts [transactionGroups]="transactionGroups" [fuelCategories]="fuelCategories" (filtersChange)="onFiltersChange($event)"/>
        }
      </div>
    </div>
  `,
  styles: [`
    .fuel {
      max-width: 1000px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .tabs button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background: var(--background-color-hover);
      cursor: pointer;
    }

    .tabs button.active {
      background: var(--primary-color);
      color: white;
    }
  `]
})
export class FuelComponent implements OnInit {
  activeTab: 'list' | 'charts' = 'list';
  transactions: FuelTransaction[] = [];
  transactionGroups: {
    categoryId: number;
    transactions: FuelTransaction[];
    total: number;
    totalFuel: number;
    averageMileage: number;
  }[] = [];
  filters: FilterOptions = { 
    status: 'all',
    startDate: new Date(new Date().getFullYear(), 0, 1),  
    endDate: new Date(),  
    category: 'all'
  };
  fuelCategories: Category[] = [];

  constructor(
    private dbService: DbService, 
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    // Set default filters
    this.filters = {
      status: 'all',
      category: 'all'
    };

    await this.extractFuelCategories();
    await this.loadTransactions();
  }

  async getMostUsedCategories() {
    try {
      const transactions = await this.dbService.getTransactionsBySubType('fuel');

      // Count occurrences of categoryId
      const categoryCounts = transactions.reduce((acc, transaction) => {
        const categoryId = transaction.categoryId;
        acc[categoryId] = (acc[categoryId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Convert to an array and sort by count (descending)
      const sortedCategories = Object.entries(categoryCounts)
        .map(([categoryId, count]) => ({
          categoryId: Number(categoryId),
          count,
        }))
        .sort((a, b) => b.count - a.count);

      return sortedCategories;
    } catch (error) {
      console.error('Error getting most used categories:', error);
      return [];
    }
  }

  async extractFuelCategories() {
    // Find fuel categories
    this.fuelCategories = (await this.dbService.getCategories())
      .filter(cat => cat.subType?.includes('fuel'));

    // Get most used categories
    const mostUsedCategories = await this.getMostUsedCategories();

    // Determine default category
    const defaultCategory = mostUsedCategories.length > 0
      ? mostUsedCategories[0].categoryId
      : this.fuelCategories[0]?.id;

    // Update filters with the selected category
    if (defaultCategory) {
      this.filters = {
        ...this.filters,
        category: defaultCategory.toString()
      };
    }
  }

  async loadTransactions() {
    try {
      // Convert category to number if not 'all'
      const categoryId = this.filters.category === 'all' 
        ? undefined 
        : Number(this.filters.category);

      const transactions = await this.dbService.getTransactionsBySubType(
        'fuel', 
        this.filters.startDate, 
        this.filters.endDate
      );

      this.transactions = transactions.filter(isFuelTransaction)
      .filter(tx => {
        return !categoryId || tx.categoryId === categoryId;
      });
      this.transactionGroups = this.groupTransactions(this.transactions);
    } catch (error) {
      console.error('Error loading fuel transactions:', error);
    }
  }

  groupTransactions(transactions: FuelTransaction[]) {
    // Group transactions by categoryId
    const groupedTransactions: { [key: number]: FuelTransaction[] } = 
      transactions.reduce((acc: { [key: number]: FuelTransaction[] }, transaction) => {
        const categoryId = transaction.categoryId;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(transaction);
        return acc;
      }, {});

    // Convert grouped transactions to an array of groups
    return Object.entries(groupedTransactions)
      .map(([categoryId, transactions]) => ({
        categoryId: Number(categoryId),
        transactions,
        total: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        totalFuel: transactions.reduce((sum, tx) => sum + (tx.fuelQuantity || 0), 0),
        averageMileage: (() => {
          if (transactions.length <= 1) return 0;
          
          // Sort transactions by date to ensure correct mileage calculation
          const sortedTransactions = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
          
          // Calculate mileages between consecutive transactions
          const mileages = sortedTransactions.slice(1).map((tx, index) => {
            const prevTx = sortedTransactions[index];
            return calculateMileage(tx, prevTx);
          }).filter(mileage => mileage > 0);
          
          // Calculate average mileage, return 0 if no valid mileages
          return mileages.length > 0 
            ? mileages.reduce((sum, mileage) => sum + mileage, 0) / mileages.length 
            : 0;
        })()
      }))
      .sort((a, b) => b.categoryId - a.categoryId);
  }

  onFiltersChange(filters: FilterOptions) {
    // Update filters
    this.filters = { ...filters };
    this.loadTransactions();
  }

  onStartDateChange(date: Date) {
    this.filters.startDate = date;
    this.loadTransactions();
  }

  onEndDateChange(date: Date) {
    this.filters.endDate = date;
    this.loadTransactions();
  }

  goBack() {
    window.history.back();
  }
}