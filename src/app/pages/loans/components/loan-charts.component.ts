import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../../services/loan.service';
import { ChartService } from '../../../services/chart.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslationService } from '../../../services/translation.service';

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
          <h4>{{ 'loan.stats.remainingGivenLoans' | translate }}</h4>
          <div class="stat-value">{{ remainingGiven | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ (remainingGivenPercentage | translateNumber:'1.0-0') }}% {{ 'loan.status.remaining' | translate }}
          </div>
        </div>

        <div class="stat-card card">
          <h4>{{ 'loan.stats.remainingTakenLoans' | translate }}</h4>
          <div class="stat-value">{{ remainingTaken | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ (remainingTakenPercentage | translateNumber:'1.0-0') }}% {{ 'loan.status.remaining' | translate }}
          </div>
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
      margin-bottom: 1rem;
      position: relative;
      width: 100%;
      padding-bottom: 1rem;
    }

    canvas {
      max-height: 400px !important; 
    }

    @media (max-width: 768px) {
      canvas {
        max-height: 300px !important;
      }
    }
  `]
})
export class LoanChartsComponent implements OnInit {
  totalGiven = 0;
  totalTaken = 0;
  activeGivenLoans = 0;
  activeTakenLoans = 0;
  remainingGiven = 0;
  remainingTaken = 0;
  remainingGivenPercentage = 0;
  remainingTakenPercentage = 0;

  constructor(
    private loanService: LoanService,
    private chartService: ChartService,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    await this.loadCharts();
  }

  private async loadCharts() {
    const [givenLoans, takenLoans] = await Promise.all([
      this.loanService.getLoansGiven(),
      this.loanService.getLoansTaken()
    ]);

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
