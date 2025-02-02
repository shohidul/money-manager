import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../../services/loan.service';
import { ChartService } from '../../../services/chart.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslationService } from '../../../services/translation.service';
import { FilterOptions } from '../../../utils/transaction-filters';
import { isLoanTransaction, isRepaidTransaction, Transaction } from '../../../models/transaction-types';
import { DbService } from '../../../services/db.service';

@Component({
  selector: 'app-loan-charts',
  standalone: true,
  imports: [
    CommonModule, 
    TranslatePipe, 
    TranslateNumberPipe
  ],
  template: `
    <div class="loan-analytics">
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="label">{{ 'loan.stats.totalGiven' | translate }} <span class="text-muted text-sm">({{ totalGiven.count | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ totalGiven.value | translateNumber:'1.0-2' }}</div>
        </div>

        <div class="stat-card card">
          <span class="label">{{ 'loan.stats.totalTaken' | translate }} <span class="text-muted text-sm">({{ totalTaken.count | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ totalTaken.value | translateNumber:'1.0-2' }}</div>
        </div>

        <div class="stat-card card">
          <span class="label">{{ 'loan.stats.totalRepaidToMe' | translate }} <span class="text-muted text-sm">({{ totalRepaidToMe.count | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ totalRepaidToMe.value | translateNumber:'1.0-2' }}</div>
        </div>

        <div class="stat-card card">
          <span class="label">{{ 'loan.stats.totalRepaidByMe' | translate }} <span class="text-muted text-sm">({{ totalRepaidByMe.count | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ totalRepaidByMe.value | translateNumber:'1.0-2' }}</div>
        </div>
      </div>
      <div class="chart-container donut-chart card">
          <div class="chart-wrapper">
            <canvas #donutChart></canvas>
          </div>
          <div class="legend">
          @for (stat of categoryStats.slice(0, 5); track stat.categoryId) {
            <div class="legend-item">
              <div class="legend-color" [style.background-color]="stat.color"></div>
              <div class="legend-info">
                <span class="category-name">
                  <span class="material-symbols-rounded">{{ getCategoryIcon(stat.categoryId) }}</span>
                  {{ stat.category  | translate }} <span class="percentage text-muted text-sm">{{ stat.percentage | translateNumber:'1.1-1' }}%</span>
                </span>
              </div>
              <span class="percentage">{{stat.amount | translateNumber:'1.0-2'}}</span>
            </div>
          }
        </div>
      </div>

      <div class="chart-container card">
        <h4>{{ 'loan.charts.loanTrends' | translate }}</h4>
        <canvas id="loanChart"></canvas>
      </div>

      <div class="chart-container card">
        <h4>{{ 'loan.charts.repaymentTrend' | translate }}</h4>
        <canvas id="repaymentChart"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      column-gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .stat-card {
      text-align: center;
    }

    .label {
      color: var(--text-secondary);
      font-size: small;
      display: flex;
      justify-content: center;
      align-items: center;
      column-gap: .3rem;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .donut-chart{
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .chart-container h4 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
      font-weight: 500;
    } 

  .chart-wrapper {
    flex: 1;
    max-width: 35%;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .chart-container {
      flex-direction: row;
      align-items: normal;
    }

    .chart-wrapper {
      max-width: 35%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
    }
  }

  .legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 280px;
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
    background-color: var(--background-color-hover);
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

  @media (max-width: 768px) {
    .legend {
      justify-content: center;
      min-width: 175px;
    }

    .legend-item {
      padding: 0;
    }

    .legend-color {
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }

    .category-name,
    .percentage {
      font-size: 0.675rem;
    }

    .category-name .material-symbols-rounded {
      display: none;
    }
  }    

  `]
})
export class LoanChartsComponent implements OnInit {
  @ViewChild('donutChart', { static: false })
  private donutChartRef!: ElementRef;

  @Input() filters: FilterOptions = {};
  totalGiven: any = {
    value: 0,
    count: 0,
    chartData: []
  }
  totalTaken: any = {
    value: 0,
    count: 0,
    chartData: []
  };
  totalRepaidToMe: any = {
    value: 0,
    count: 0,
    chartData: []
  };
  totalRepaidByMe: any = {
    value: 0,
    count: 0,
    chartData: []
  };
  transactions: Transaction[] = [];
  categories: any[] = [];
  categoryStats: any[] = [];
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
    private loanService: LoanService,
    private chartService: ChartService,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    await this.loadData();
    // await this.loadCharts();
  }

  async loadData() {
    let startDate: Date;
    let endDate: Date;

    // Determine date range for filtering
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

    this.transactions = await this.dbService.getTransactions(
      startDate,
      endDate
    );
    this.categories = await this.dbService.getCategories();
    this.calculateStats();
    this.createDonutChart();
    this.createLoanChart();
    this.createRepaymentChart();
  }

  calculateStats() {
    const stats = new Map<number, any>();
    let totalAmount = 0;

    const filteredTransactions = this.transactions.filter(
      (tx) =>  isLoanTransaction(tx) || isRepaidTransaction(tx)
    );

    filteredTransactions.forEach((tx) => {
      if (!stats.has(tx.categoryId)) {
        const category = this.categories.find((c) => c.id === tx.categoryId);
        stats.set(tx.categoryId, {
          categoryId: tx.categoryId,
          category: category?.name || 'Unknown',
          type: category.type,
          amount: 0,
          color: this.chartColors[stats.size % this.chartColors.length],
        });
      }

      const stat = stats.get(tx.categoryId);
      stat.amount += tx.amount;
      totalAmount += tx.amount;

      // top stats
      if (isRepaidTransaction(tx) && tx.type === 'income') {
        this.totalRepaidToMe.value += tx.amount;
        this.totalRepaidToMe.count += 1;
        this.totalRepaidToMe.chartData.push({ date: tx.date, amount: tx.amount });
      } else  if (isRepaidTransaction(tx) && tx.type === 'expense') {
        this.totalRepaidByMe.value += tx.amount;
        this.totalRepaidByMe.count += 1;
        this.totalRepaidByMe.chartData.push({ date: tx.date, amount: tx.amount });
      } else if (isLoanTransaction(tx) && tx.type === 'income') {
        this.totalTaken.value += tx.amount;
        this.totalTaken.count += 1;
        this.totalTaken.chartData.push({ date: tx.date, amount: tx.amount });
      } else if (isLoanTransaction(tx) && tx.type === 'expense') {
        this.totalGiven.value += tx.amount;
        this.totalGiven.count += 1;
        this.totalGiven.chartData.push({ date: tx.date, amount: tx.amount });
      }
    });

    this.categoryStats = Array.from(stats.values())
      .map((stat) => ({
        ...stat,
        percentage: (stat.amount / totalAmount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private createDonutChart() {
    if (!this.donutChartRef) return;

    const canvas = this.donutChartRef.nativeElement as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chartService.createDonutChart(
      ctx,
      this.categoryStats.slice(0, 5),
      this.categoryStats.map((stat) => stat.color)
    );
  }

  getCategoryIcon(categoryId: number): string {
    return this.categories.find((c) => c.id === categoryId)?.icon || 'help';
  }

  private createLoanChart() {
    const loanCanvas = document.querySelector('#loanChart') as HTMLCanvasElement;
    if (!loanCanvas) return;

    const tdp = new TranslateDatePipe(this.translationService);
    interface ChartData {
      date: string;
      amount: number;
    }

    const combinedChartData = [
      ...this.totalGiven.chartData,
      ...this.totalTaken.chartData
    ];

    const uniqueDates = Array.from(
        new Set(
            combinedChartData
                .map(d => new Date(d.date).setHours(6, 0, 0, 0)) // Set time to 0
                .sort((a, b) => a - b) // Sort based on date only
        )
    ).map(d => tdp.transform(new Date(d), 'MMM d'));
    
    this.chartService.createLineChart2(
      loanCanvas,
      {
        labels: uniqueDates,
        datasets: [{
          label: 'Repaid To Me',
          data: this.totalGiven.chartData.map((d: ChartData) => d.amount),
          borderColor: '#4CAF50',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Repaid By Me',
          data: this.totalTaken.chartData.map((d: ChartData) => d.amount),
          borderColor: '#f44336',
          tension: 0.4,
          fill: false
        }
      ]
      },
      '#FF9800'
    );
  }

  private createRepaymentChart() {
    const repaymentCanvas = document.querySelector('#repaymentChart') as HTMLCanvasElement;
    if (!repaymentCanvas) return;

    const tdp = new TranslateDatePipe(this.translationService);
    interface ChartData {
      date: string;
      amount: number;
    }

    const combinedChartData = [
      ...this.totalRepaidToMe.chartData,
      ...this.totalRepaidByMe.chartData
    ];

    const uniqueDates = Array.from(
        new Set(
            combinedChartData
                .map(d => new Date(d.date).setHours(6, 0, 0, 0)) // Set time to 0
                .sort((a, b) => a - b) // Sort based on date only
        )
    ).map(d => tdp.transform(new Date(d), 'MMM d'));

     this.chartService.createLineChart2(
      repaymentCanvas,
      {
        labels: uniqueDates,
        datasets: [{
          label: 'Repaid To Me',
          data: this.totalRepaidToMe.chartData.map((d: ChartData) => d.amount),
          borderColor: '#4CAF50',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Repaid By Me',
          data: this.totalRepaidByMe.chartData.map((d: ChartData) => d.amount),
          borderColor: '#f44336',
          tension: 0.4,
          fill: false
        }
      ]
      },
      '#FF9800'
    );
  }
}
