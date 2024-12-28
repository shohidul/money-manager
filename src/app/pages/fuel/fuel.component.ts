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

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, FuelListComponent, FuelChartsComponent],
  template: `
    <div class="fuel">
      <app-mobile-header
        title="Fuel Logs"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Logs</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">Analytics</button>
        </div>

        @if (activeTab === 'list') {
          <app-fuel-list [transactionGroups]="transactionGroups" 
          [fuelCategories]="fuelCategories" [filters]="filters" (filtersChange)="onFiltersChange($event)" />
        } @else {
          <app-fuel-charts />
        }
      </div>
    </div>
  `,
  styles: [`
    .fuel {
      max-width: 800px;
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
  activeTab: 'list' | 'charts' = 'charts';
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

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    // Set default filters
    this.filters = {
      status: 'all',
      category: 'all'
    };

    await this.loadTransactions();
    this.extractFuelCategories();
  }

  async extractFuelCategories() {
    // First, get all categories
    const categories = await this.dbService.getCategories();

    // Find the fuel categories
    this.fuelCategories = categories
      .filter(cat => cat.subType === 'fuel');
  }

  async loadTransactions() {
    let startDate: Date;
    let endDate: Date;

    // Determine date range for filtering
    if (this.filters.startDate) {
      startDate = this.filters.startDate;
    } else {
      startDate = new Date(0);
    }

    if (this.filters.endDate) {
      endDate = this.filters.endDate;
    } else {
      endDate = new Date();
    }

    // Ensure fuel categories are loaded
    if (this.fuelCategories.length === 0) {
      await this.extractFuelCategories();
    }

    const transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );

    // Filter and group transactions
    const filteredTransactions = transactions
      .filter(isFuelTransaction)
      .filter(tx => 
        this.filters.category === 'all' || 
        tx.categoryId === Number(this.filters.category)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // Group transactions by categoryId
    const groupedTransactions: { [key: number]: FuelTransaction[] } = 
      filteredTransactions.reduce((acc: { [key: number]: FuelTransaction[] }, transaction) => {
        const categoryId = transaction.categoryId;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(transaction);
        return acc;
      }, {});

    // Convert grouped transactions to an array of groups
    this.transactionGroups = Object.entries(groupedTransactions)
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

  goBack() {
    window.history.back();
  }
}