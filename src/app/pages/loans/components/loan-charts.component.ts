import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../../services/db.service';
import { ChartService } from '../../../services/chart.service';
import { Transaction, isLoanTransaction } from '../../../models/transaction-types';
import { groupLoanTransactions } from '../../../utils/loan.utils';

@Component({
  selector: 'app-loan-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loan-analytics">
      <div class="chart-container card">
        <h3>Loan Overview</h3>
        <canvas #overviewChart></canvas>
      </div>

      <div class="chart-container card">
        <h3>Monthly Loan Activity</h3>
        <canvas #activityChart></canvas>
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
  `]
})
export class LoanChartsComponent implements OnInit {
  constructor(
    private dbService: DbService,
    private chartService: ChartService
  ) {}

  async ngOnInit() {
    await this.loadCharts();
  }

  async loadCharts() {
    const transactions = await this.dbService.getTransactions(
      new Date(0),
      new Date()
    );

    const loanTransactions = transactions.filter(isLoanTransaction);
    // const groups = groupLoanTransactions(loanTransactions);

    // this.createOverviewChart(groups);
    this.createActivityChart(loanTransactions);
  }

  private createOverviewChart(groups: any[]) {
    const overviewCanvas = document.querySelector('#overviewChart') as HTMLCanvasElement;
    if (!overviewCanvas) return;

    const givenTotal = groups
      .filter(g => g.transactions[0].type === 'expense')
      .reduce((sum, g) => sum + g.status.totalAmount, 0);

    const takenTotal = groups
      .filter(g => g.transactions[0].type === 'income')
      .reduce((sum, g) => sum + g.status.totalAmount, 0);

    this.chartService.createDonutChart(
      overviewCanvas.getContext('2d')!,
      [
        { category: 'Given', amount: givenTotal },
        { category: 'Taken', amount: takenTotal }
      ],
      ['#4caf50', '#f44336']
    );
  }

  private createActivityChart(transactions: Transaction[]) {
    const activityCanvas = document.querySelector('#activityChart') as HTMLCanvasElement;
    if (!activityCanvas) return;

    const monthlyData = this.getMonthlyData(transactions);

    this.chartService.createLineChart(
      activityCanvas,
      {
        labels: monthlyData.map(d => d.month),
        values: monthlyData.map(d => d.amount)
      },
      '#2196f3'
    );
  }

  private getMonthlyData(transactions: Transaction[]) {
    const monthlyMap = new Map<string, number>();

    transactions.forEach(tx => {
      const month = tx.date.toISOString().slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + tx.amount);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}