import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { FuelListComponent } from './components/fuel-list.component';
import { FuelChartsComponent } from './components/fuel-charts.component';
import { DbService } from '../../services/db.service';
import { isFuelTransaction, FuelTransaction } from '../../models/transaction-types';
import { FilterOptions } from '../../utils/transaction-filters';

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
          <app-fuel-list [transactions]="transactions" [filters]="filters" (filtersChange)="onFiltersChange($event)" />
        } @else {
          <app-fuel-charts [transactions]="transactions" />
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
  activeTab: 'list' | 'charts' = 'list';
  transactions: FuelTransaction[] = [];
  filters: FilterOptions = {};

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    const transactions = await this.dbService.getTransactions(
      this.filters.startDate || new Date(0),
      this.filters.endDate || new Date()
    );

    this.transactions = transactions
      .filter(isFuelTransaction)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async onFiltersChange(filters: FilterOptions) {
    this.filters = filters;
    await this.loadTransactions();
  }

  goBack() {
    window.history.back();
  }
}