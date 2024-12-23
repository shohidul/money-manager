import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../../services/loan.service';
import { ChartService } from '../../../services/chart.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';

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
            {{ 'loan.stats.activeLoans' | translate }}: {{ activeGivenLoans }}
          </div>
        </div>

        <div class="stat-card card">
          <h4>{{ 'loan.stats.totalTaken' | translate }}</h4>
          <div class="stat-value">{{ totalTaken | translateNumber:'1.0-2' }}</div>
          <div class="stat-detail">
            {{ 'loan.stats.activeLoans' | translate }}: {{ activeTakenLoans }}
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
    </div>
  `,
  styles: [`
    .chart-container {
      margin-bottom: 1rem;
    }

    .chart-container h3 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }

    canvas {
      width: 100% !important;
      height: 300px !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .stat-detail {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class LoanChartsComponent implements OnInit {
  totalGiven = 0;
  totalTaken = 0;
  activeGivenLoans = 0;
  activeTakenLoans = 0;

  constructor(
    private loanService: LoanService,
    private chartService: ChartService
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
  }

  private updateStats(givenLoans: any[], takenLoans: any[]) {
    this.totalGiven = givenLoans.reduce((sum, loan) => sum + loan.status.totalAmount, 0);
    this.totalTaken = takenLoans.reduce((sum, loan) => sum + loan.status.totalAmount, 0);
    this.activeGivenLoans = givenLoans.filter(loan => !loan.status.isCompleted).length;
    this.activeTakenLoans = takenLoans.filter(loan => !loan.status.isCompleted).length;
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
        { category: 'Active Given', amount: activeGiven },
        { category: 'Active Taken', amount: activeTaken }
      ],
      ['#4caf50', '#f44336']
    );
  }

  private createActivityChart(givenLoans: any[], takenLoans: any[]) {
    const activityCanvas = document.querySelector('#activityChart') as HTMLCanvasElement;
    if (!activityCanvas) return;

    // Create monthly activity data
    const monthlyData = this.getMonthlyActivity([...givenLoans, ...takenLoans]);

    this.chartService.createLineChart(
      activityCanvas,
      {
        labels: monthlyData.map(d => d.month),
        values: monthlyData.map(d => d.amount)
      },
      '#2196f3'
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
}