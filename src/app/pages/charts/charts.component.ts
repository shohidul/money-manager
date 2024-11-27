import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DbService, Transaction, Category } from '../../services/db.service';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts">
      <header class="top-bar">
        <div class="flex gap-2">
          <button class="back-button" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
          </button>
          <h2>Analytics</h2>
        </div>
        <input 
          type="month" 
          [value]="currentMonth"
          (change)="onMonthChange($event)"
          class="month-picker"
        >
      </header>

      <div class="chart-container card">
        <canvas #donutChart></canvas>
        <div class="legend">
          <div *ngFor="let stat of categoryStats" class="legend-item">
            <div class="legend-color" [style.background-color]="stat.color"></div>
            <div class="legend-info">
              <span class="legend-label">{{ stat.category }}</span>
              <span class="legend-value">{{ stat.percentage }}%</span>
            </div>
            <span class="legend-amount">{{ stat.amount | currency }}</span>
          </div>
        </div>
      </div>

      <div class="transactions-by-category card">
        <h3>Transactions by Category</h3>
        <div *ngFor="let stat of categoryStats" class="category-stat">
          <div class="category-header" (click)="toggleCategory(stat.categoryId)">
            <div class="category-info">
              <span class="material-symbols-rounded">{{ getCategoryIcon(stat.categoryId) }}</span>
              <span>{{ stat.category }}</span>
            </div>
            <span class="amount">{{ stat.amount | currency }}</span>
          </div>
          <div *ngIf="expandedCategories.includes(stat.categoryId)" class="category-details">
            <canvas [id]="'chart-' + stat.categoryId"></canvas>
            <div class="transaction-list">
              <div *ngFor="let tx of getTransactionsByCategory(stat.categoryId)" class="transaction-item">
                <span>{{ tx.date | date:'mediumDate' }}</span>
                <span>{{ tx.memo }}</span>
                <span>{{ tx.amount | currency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .charts {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .month-picker {
      padding: 0.5rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }

    .chart-container {
      position: relative;
      margin-bottom: 2rem;
      display: flex;
      height: 250px;
    }

    .legend {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    }

    .category-stat {
      margin-bottom: 1rem;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      cursor: pointer;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .category-header:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-details {
      padding: 1rem;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .transaction-list {
      margin-top: 1rem;
    }

    .transaction-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
  `,
  ],
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('donutChart') private donutChartRef!: ElementRef;

  currentMonth = format(new Date(), 'yyyy-MM');
  transactions: Transaction[] = [];
  categories: Category[] = [];
  categoryStats: any[] = [];
  expandedCategories: number[] = [];
  charts: Map<string, Chart> = new Map();

  constructor(private dbService: DbService, private router: Router) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.loadTransactions();

    this.createDonutChart();
  }

  ngAfterViewInit() {
    // console.log(this.currentMonth);
    // console.log(this.transactions);
    // console.log(this.categories);
    // console.log(this.categoryStats);
    // console.log(this.expandedCategories);
    // this.createDonutChart();
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async loadTransactions() {
    const date = new Date(this.currentMonth);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    this.transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    this.calculateStats();
  }

  calculateStats() {
    const stats = new Map<number, any>();
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
    ];

    let totalAmount = 0;
    this.transactions.forEach((tx) => {
      if (!stats.has(tx.categoryId)) {
        const category = this.categories.find((c) => c.id === tx.categoryId);
        stats.set(tx.categoryId, {
          categoryId: tx.categoryId,
          category: category?.name || 'Unknown',
          amount: 0,
          color: colors[stats.size % colors.length],
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

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.categoryStats.map((stat) => stat.category),
        datasets: [
          {
            data: this.categoryStats.map((stat) => stat.amount),
            backgroundColor: this.categoryStats.map((stat) => stat.color),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  createCategoryChart(categoryId: number) {
    const canvas = document.getElementById(
      `chart-${categoryId}`
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const transactions = this.getTransactionsByCategory(categoryId);
    const dates = transactions.map((tx) => format(tx.date, 'MMM d'));
    const amounts = transactions.map((tx) => tx.amount);

    const existingChart = this.charts.get(`chart-${categoryId}`);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Amount',
            data: amounts,
            borderColor: this.categoryStats.find(
              (stat) => stat.categoryId === categoryId
            )?.color,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    this.charts.set(`chart-${categoryId}`, chart);
  }

  getCategoryIcon(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  getTransactionsByCategory(categoryId: number): Transaction[] {
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
    }
  }

  onMonthChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentMonth = input.value;
    this.loadTransactions();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
