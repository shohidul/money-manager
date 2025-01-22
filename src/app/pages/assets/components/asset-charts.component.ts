import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../../services/db.service';
import { ChartService } from '../../../services/chart.service';
import { TranslationService } from '../../../services/translation.service';
import { CategoryService } from '../../../services/category.service';
import { AssetTransaction, isAssetTransaction, isAssetCostTransaction, isAssetIncomeTransaction } from '../../../models/transaction-types';
import { Category } from '../../../models/category';
import { TranslatePipe } from "../../../components/shared/translate.pipe";
import { TranslateNumberPipe } from "../../../components/shared/translate-number.pipe";

@Component({
  selector: 'app-asset-charts',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    TranslateNumberPipe
],
  template: `
    <div class="asset-analytics">
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="label">{{ 'asset.stats.totalAssetValue' | translate }} <span class="text-muted text-sm">({{ stats.totalAssets | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ stats.totalAssetValue | translateNumber:'1.0-2' }}</div>
        </div>

        <div class="stat-card card">
          <span class="label">{{ 'asset.stats.totalIncome' | translate }} <span class="text-muted text-sm">({{ stats.incomeCount | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ stats.totalIncome | translateNumber:'1.0-2' }}</div>
        </div>

        <div class="stat-card card">
          <span class="label">{{ 'asset.stats.totalCost' | translate }} <span class="text-muted text-sm">({{ stats.costCount | translateNumber:'1.0-2' }})</span></span>
          <div class="stat-value">{{ stats.totalCost | translateNumber:'1.0-2' }}</div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-container card">
          <h3>{{ 'asset.charts.assetValues' | translate }}</h3>
          <canvas #assetValueChart></canvas>
        </div>

        <div class="chart-container card">
          <h3>{{ 'asset.charts.incomeVsCost' | translate }}</h3>
          <canvas #incomeVsCostChart></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asset-analytics {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-card {
      padding: 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 500;
    }

    .chart-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .chart-container {
      padding: 1rem;
    }

    .chart-container h3 {
      margin-bottom: 1rem;
      text-align: center;
    }

    canvas {
      width: 100% !important;
      height: 300px !important;
    }

    @media (max-width: 768px) {
      .stats-grid,
      .chart-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssetChartsComponent implements OnInit {
  @ViewChild('assetValueChart') assetValueChartRef!: ElementRef;
  @ViewChild('incomeVsCostChart') incomeVsCostChartRef!: ElementRef;

  stats = {
    totalAssets: 0,
    totalAssetValue: 0,
    totalIncome: 0,
    incomeCount: 0,
    totalCost: 0,
    costCount: 0
  };

  private categories: { [key: number]: Category } = {};
  private assetTransactions: AssetTransaction[] = [];

  constructor(
    private dbService: DbService,
    private chartService: ChartService,
    private translationService: TranslationService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    // Load categories
    const categories = await this.categoryService.getAllCategories();
    // this.categories = categories.reduce((acc: { [key: number]: Category }, cat: Category) => ({...acc, [cat.id]: cat}), {});

    // Get all asset transactions
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    const transactions = await this.dbService.getTransactions(startDate, endDate);
    
    this.assetTransactions = transactions.filter(tx => 
      isAssetTransaction(tx) || isAssetCostTransaction(tx) || isAssetIncomeTransaction(tx)
    ) as AssetTransaction[];

    this.calculateStats();
    this.createCharts();
  }

  private calculateStats() {
    // Group assets
    const assetGroups = this.assetTransactions.reduce((groups: {[key: string]: {value: number, transactions: AssetTransaction[]}}, tx: AssetTransaction) => {
      if (isAssetTransaction(tx)) {
        if (!groups[tx.assetName]) {
          groups[tx.assetName] = {
            value: tx.amount,
            transactions: []
          };
        }
      } else if (isAssetCostTransaction(tx) || isAssetIncomeTransaction(tx)) {
        const assetName = (tx as AssetTransaction).assetName;
        if (groups[assetName]) {
          groups[assetName].transactions.push(tx);
        }
      }
      return groups;
    }, {});

    this.stats.totalAssets = Object.keys(assetGroups).length;
    this.stats.totalAssetValue = Object.values(assetGroups).reduce((sum, group) => sum + group.value, 0);

    const incomeTransactions = this.assetTransactions.filter(tx => tx.type === 'income');
    const costTransactions = this.assetTransactions.filter(tx => tx.type === 'expense' && !isAssetTransaction(tx));

    this.stats.totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    this.stats.incomeCount = incomeTransactions.length;
    this.stats.totalCost = costTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    this.stats.costCount = costTransactions.length;
  }

  private createCharts() {
    this.createAssetValueChart();
    this.createIncomeVsCostChart();
  }

  private createAssetValueChart() {
    const assetValues = this.assetTransactions
      .filter(isAssetTransaction)
      .sort((a, b) => b.amount - a.amount)
      .map(tx => ({
        label: tx.assetName,
        value: tx.amount
      }));

    const data = {
      labels: assetValues.map(a => a.label),
      values: assetValues.map(a => a.value)
    };

    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ];

    this.chartService.createDonutChart(
      this.assetValueChartRef.nativeElement,
      data.values,
      colors
    );
  }

  private createIncomeVsCostChart() {
    const monthlyData = this.assetTransactions
      .filter(tx => !isAssetTransaction(tx))
      .reduce((acc, tx) => {
        const month = new Date(tx.date).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { income: 0, cost: 0 };
        }
        if (tx.type === 'income') {
          acc[month].income += tx.amount;
        } else {
          acc[month].cost += tx.amount;
        }
        return acc;
      }, {} as { [key: string]: { income: number, cost: number } });

    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(m => monthlyData[m].income);
    const costData = months.map(m => monthlyData[m].cost);

    const chartData = {
      labels: months.map(m => {
        const date = new Date(m);
        return date.toLocaleDateString(this.translationService.getCurrentLanguage(), { 
          month: 'short', 
          year: 'numeric' 
        });
      }),
      datasets: [
        {
          label: this.translationService.translate('asset.charts.income'),
          data: incomeData,
          borderColor: '#4BC0C0',
          backgroundColor: '#4BC0C0'
        },
        {
          label: this.translationService.translate('asset.charts.cost'),
          data: costData,
          borderColor: '#FF6384',
          backgroundColor: '#FF6384'
        }
      ]
    };

    this.chartService.createLineChart2(
      this.incomeVsCostChartRef.nativeElement,
      chartData,
      '#36A2EB'
    );
  }
}