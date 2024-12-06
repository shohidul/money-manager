import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService } from '../../services/db.service';
import { ChartService } from '../../services/chart.service';
import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

type ChartType = 'all' | 'income' | 'expense';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MobileHeaderComponent,
    MonthPickerComponent,
  ],
  template: `
    <div class="charts">
      <app-mobile-header
        title="Analytics"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="filters">
          <app-month-picker
            [currentMonth]="currentMonth"
            (monthChange)="onMonthChange($event)"
          />
          <div class="filter-buttons">
            <button 
              *ngFor="let type of chartTypes"
              [class.active]="selectedType === type"
              (click)="setType(type)"
            >
              {{ type | titlecase }}
            </button>
          </div>
        </div>

        <div class="chart-container card">
          <div class="chart-wrapper">
            <canvas #donutChart></canvas>
          </div>
          <div class="legend">
            @for (stat of categoryStats; track stat.categoryId) {
              <div class="legend-item">
                <div class="legend-color" [style.background-color]="stat.color"></div>
                <div class="legend-info">
                  <span class="category-name">
                    <span class="material-symbols-rounded">{{ getCategoryIcon(stat.categoryId) }}</span>
                    {{ stat.category }}
                  </span>
                  <span class="amount">{{ stat.amount | number:'1.0-0' }}</span>
                </div>
                <span class="percentage">{{ stat.percentage }}%</span>
              </div>
            }
          </div>
        </div>

        <div class="transactions-by-category">
          @for (stat of categoryStats; track stat.categoryId) {
            <div class="category-details card">
              <div class="category-header" (click)="toggleCategory(stat.categoryId)">
                <div class="category-info">
                  <span class="material-symbols-rounded">{{ getCategoryIcon(stat.categoryId) }}</span>
                  <span>{{ stat.category }}</span>
                </div>
                <span class="amount">{{ stat.amount | number:'1.0-0' }}</span>
              </div>
              @if (expandedCategories.includes(stat.categoryId)) {
                <div class="category-transactions">
                  <canvas [id]="'chart-' + stat.categoryId"></canvas>
                  <div class="transaction-list">
                    @for (tx of getTransactionsByCategory(stat.categoryId); track tx.id) {
                      <div class="transaction-item">
                        <span>{{ tx.date | date:'mediumDate' }}</span>
                        <span>{{ tx.memo }}</span>
                        <span>{{ tx.amount | number:'1.0-0' }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .charts {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .filters {
      margin-bottom: 1rem;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 0.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .filter-buttons button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      background: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-buttons button.active {
      background-color: var(--primary-color);
      color: white;
    }

    .chart-container {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }

    .chart-wrapper {
      flex: 1;
      max-width: 300px;
      height: 300px;
    }

    .legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .legend-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .percentage {
      min-width: 48px;
      text-align: right;
      font-weight: 500;
    }

    .category-details {
      margin-top: 1rem;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      cursor: pointer;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .category-transactions {
      padding: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }

    .transaction-list {
      margin-top: 1rem;
    }

    .transaction-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    @media (max-width: 768px) {
      .chart-container {
        flex-direction: column;
      }

      .chart-wrapper {
        max-width: none;
      }
    }
  `,
  ],
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('donutChart') private donutChartRef!: ElementRef;

  currentMonth = format(new Date(), 'yyyy-MM');
  selectedType: ChartType = 'all';
  chartTypes: ChartType[] = ['all', 'income', 'expense'];
  transactions: any[] = [];
  categories: any[] = [];
  categoryStats: any[] = [];
  expandedCategories: number[] = [];
  chartColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#36A2EB',
  ];

  constructor(
    private dbService: DbService,
    private chartService: ChartService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadData();
    this.createDonutChart();
  }

  ngAfterViewInit() {
    // this.createDonutChart();
  }

  async loadData() {
    const date = new Date(this.currentMonth);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    this.transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    this.categories = await this.dbService.getCategories();
    this.calculateStats();
  }

  onMonthChange(month: string) {
    this.currentMonth = month;
    this.loadData();
  }

  setType(type: ChartType) {
    this.selectedType = type;
    this.calculateStats();
    this.createDonutChart();
  }

  calculateStats() {
    const stats = new Map<number, any>();
    let totalAmount = 0;

    const filteredTransactions = this.transactions.filter(
      (tx) => this.selectedType === 'all' || tx.type === this.selectedType
    );

    filteredTransactions.forEach((tx) => {
      if (!stats.has(tx.categoryId)) {
        const category = this.categories.find((c) => c.id === tx.categoryId);
        stats.set(tx.categoryId, {
          categoryId: tx.categoryId,
          category: category?.name || 'Unknown',
          amount: 0,
          color: this.chartColors[stats.size % this.chartColors.length],
        });
      }

      const stat = stats.get(tx.categoryId);
      stat.amount += tx.amount;
      totalAmount += tx.amount;
    });

    this.categoryStats = Array.from(stats.values())
      .map((stat) => ({
        ...stat,
        percentage: Math.round((stat.amount / totalAmount) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  createDonutChart() {
    const ctx = this.donutChartRef.nativeElement.getContext('2d');
    this.chartService.createDonutChart(
      ctx,
      this.categoryStats,
      this.categoryStats.map((stat) => stat.color)
    );
  }

  getCategoryIcon(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  getTransactionsByCategory(categoryId: number) {
    return this.transactions
      .filter((tx) => tx.categoryId === categoryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  toggleCategory(categoryId: number) {
    const index = this.expandedCategories.indexOf(categoryId);
    if (index === -1) {
      this.expandedCategories.push(categoryId);
      setTimeout(() => this.createCategoryChart(categoryId), 0);
    } else {
      this.expandedCategories.splice(index, 1);
      this.chartService.destroyChart(`chart-${categoryId}`);
    }
  }

  createCategoryChart(categoryId: number) {
    const canvas = document.getElementById(
      `chart-${categoryId}`
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const transactions = this.getTransactionsByCategory(categoryId);
    const chartData = {
      labels: transactions.map((tx) => format(tx.date, 'MMM d')),
      values: transactions.map((tx) => tx.amount),
    };

    this.chartService.createLineChart(
      canvas,
      chartData,
      this.categoryStats.find((stat) => stat.categoryId === categoryId)?.color
    );
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
