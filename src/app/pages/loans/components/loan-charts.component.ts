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
          <h4>{{ 'loan.stats.totalGiven' | translate }}</h4>
          <div class="stat-value">{{ totalGiven | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ 'loan.stats.activeLoans' | translate }}: {{ activeGivenLoans | translateNumber:'1.0-0' }}
          </div>
        </div>

        <div class="stat-card card">
          <h4>{{ 'loan.stats.totalTaken' | translate }}</h4>
          <div class="stat-value">{{ totalTaken | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ 'loan.stats.activeLoans' | translate }}: {{ activeTakenLoans | translateNumber:'1.0-0' }}
          </div>
        </div>

        <div class="stat-card card">
          <h4>{{ 'loan.stats.totalRepaidToMe' | translate }}</h4>
          <div class="stat-value">{{ remainingGiven | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ (remainingGivenPercentage | translateNumber:'1.0-0') }}% {{ 'loan.status.remaining' | translate }}
          </div>
        </div>

        <div class="stat-card card">
          <h4>{{ 'loan.stats.totalRepaidByMe' | translate }}</h4>
          <div class="stat-value">{{ remainingTaken | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ (remainingTakenPercentage | translateNumber:'1.0-0') }}% {{ 'loan.status.remaining' | translate }}
          </div>
        </div>
      </div>
      <div class="chart-container card">
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
                  {{ stat.category  | translate }}
                </span>
              </div>
              <span class="percentage">{{stat.amount | translateNumber:'1.0-2'}} ({{ stat.percentage | translateNumber:'1.1-1' }}%)</span>
            </div>
          }
        </div>
      </div>

      <div class="chart-container card">
        <h3>{{ 'loan.charts.overview' | translate }}</h3>
        <canvas id="overviewChart"></canvas>
      </div>

      <div class="chart-container card">
        <h3>{{ 'loan.charts.monthlyActivity' | translate }}</h3>
        <canvas id="activityChart"></canvas>
      </div>

      <div class="chart-container card">
        <h3>{{ 'loan.charts.repaymentTrend' | translate }}</h3>
        <canvas id="repaymentChart"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      text-align: center;
    }

    .stat-card h4 {
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .stat-detail {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .chart-container {
    display: flex;
    gap: 2rem;
    align-items: center;
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
  @Input() totalGiven: number = 0;
  @Input() totalTaken: number = 0;
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

  activeGivenLoans = 0;
  activeTakenLoans = 0;
  remainingGiven = 0;
  remainingTaken = 0;
  remainingGivenPercentage = 0;
  remainingTakenPercentage = 0;

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

  private async loadCharts() {
    const [givenLoans, takenLoans] = await Promise.all([
      this.loanService.getLoansGiven(),
      this.loanService.getLoansTaken()
    ]);

    console.log(givenLoans);
    console.log(takenLoans);

    this.updateStats(givenLoans, takenLoans);
    this.createOverviewChart(givenLoans, takenLoans);
    this.createActivityChart(givenLoans, takenLoans);
    this.createRepaymentChart(givenLoans, takenLoans);
  }

  private updateStats(givenLoans: any[], takenLoans: any[]) {
    // Total amounts
    this.totalGiven = givenLoans.reduce((sum, loan) => sum + loan.status.totalAmount, 0);
    this.totalTaken = takenLoans.reduce((sum, loan) => sum + loan.status.totalAmount, 0);
    
    // Active loans count
    this.activeGivenLoans = givenLoans.filter(loan => !loan.status.isCompleted).length;
    this.activeTakenLoans = takenLoans.filter(loan => !loan.status.isCompleted).length;
    
    // Remaining amounts
    this.remainingGiven = givenLoans.reduce((sum, loan) => sum + loan.status.remainingAmount, 0);
    this.remainingTaken = takenLoans.reduce((sum, loan) => sum + loan.status.remainingAmount, 0);
    
    // Calculate percentages
    this.remainingGivenPercentage = this.totalGiven ? (this.remainingGiven / this.totalGiven) * 100 : 0;
    this.remainingTakenPercentage = this.totalTaken ? (this.remainingTaken / this.totalTaken) * 100 : 0;
  }

  private createOverviewChart(givenLoans: any[], takenLoans: any[]) {
    const overviewCanvas = document.querySelector('#overviewChart') as HTMLCanvasElement;
    if (!overviewCanvas) return;

    const activeGiven = givenLoans.reduce((sum, loan) => 
      sum + (loan.status.isCompleted ? 0 : loan.status.remainingAmount), 0);
    const activeTaken = takenLoans.reduce((sum, loan) => 
      sum + (loan.status.isCompleted ? 0 : loan.status.remainingAmount), 0);

    this.chartService.createDonutChart(
      overviewCanvas.getContext('2d')!,
      [
        { category: 'loan.stats.remainingGivenLoans', amount: activeGiven },
        { category: 'loan.stats.remainingTakenLoans', amount: activeTaken }
      ],
      ['#4CAF50', '#f44336']
    );
  }

  private createActivityChart(givenLoans: any[], takenLoans: any[]) {
    const activityCanvas = document.querySelector('#activityChart') as HTMLCanvasElement;
    if (!activityCanvas) return;

    const tdp = new TranslateDatePipe(this.translationService);
    const monthlyData = this.getMonthlyActivity([...givenLoans, ...takenLoans]);

    this.chartService.createLineChart(
      activityCanvas,
      {
        labels: monthlyData.map(d => tdp.transform(new Date(d.month), 'MMM d')),
        values: monthlyData.map(d => d.amount)
      },
      '#2196F3'
    );
  }

  private createRepaymentChart(givenLoans: any[], takenLoans: any[]) {
    const repaymentCanvas = document.querySelector('#repaymentChart') as HTMLCanvasElement;
    if (!repaymentCanvas) return;

    const tdp = new TranslateDatePipe(this.translationService);
    const repaymentData = this.getRepaymentTrend([...givenLoans, ...takenLoans]);

    this.chartService.createLineChart(
      repaymentCanvas,
      {
        labels: repaymentData.map(d => tdp.transform(new Date(d.date), 'MMM d')),
        values: repaymentData.map(d => d.amount)
      },
      '#FF9800'
    );
  }

  private getMonthlyActivity(loans: any[]) {
    const monthlyMap = new Map<string, number>();

    loans.forEach(loan => {
      loan.transactions.forEach((tx: any) => {
        const month = tx.date.toISOString().slice(0, 7);
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + tx.amount);
      });
    });

    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private getRepaymentTrend(loans: any[]) {
    const repayments: { date: string; amount: number }[] = [];

    loans.forEach(loan => {
      loan.transactions
        .filter((tx: any) => tx.subType === 'repaid')
        .forEach((tx: any) => {
          repayments.push({
            date: tx.date.toISOString().slice(0, 10),
            amount: tx.amount
          });
        });
    });

    return repayments.sort((a, b) => a.date.localeCompare(b.date));
  }
}
