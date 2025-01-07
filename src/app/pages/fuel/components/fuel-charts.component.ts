import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelTransaction, Transaction } from '../../../models/transaction-types';
import {
  getFuelChartData,
  calculateFuelStats,
  FuelStats,
} from '../../../utils/fuel.utils';
import { ChartService } from '../../../services/chart.service';
import { Category, DbService } from '../../../services/db.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateNumberPipe } from "../../../components/shared/translate-number.pipe";
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-fuel-charts',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslateNumberPipe],
  template: `
    <div class="fuel-analytics card">
      <h3>{{ 'fuel.fuelAnalytics' | translate }}</h3>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">{{ 'fuel.mileageDistance' | translate }}</span>
          <span class="value">{{ stats.totalMileageDistance | translateNumber:'1.0-0' }} {{ 'fuel.km' | translate }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'fuel.fuelQuantity' | translate }}</span>
          <span class="value">{{ stats.totalFuelQuantity | translateNumber:'1.1-1' }} {{ 'fuel.L' | translate }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'fuel.lastOdometer' | translate }}</span>
          <span class="value">{{ stats.lastOdoReading | translateNumber:'1.0-0' }} {{ 'fuel.km' | translate }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'fuel.averageMileage' | translate }}</span>
          <span class="value">{{ stats.mileage | translateNumber:'1.1-1' }} {{ 'fuel.kmPerLiter' | translate }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'fuel.fuelCost' | translate }}</span>
          <span class="value">{{ stats.totalFuelCost | translateNumber:'1.2-2' }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ 'fuel.lastFuelPrice' | translate }}</span>
          <span class="value">{{ stats.lastFuelPrice | translateNumber:'1.2-2' }}/{{ 'fuel.L' | translate }}</span>
        </div>
      </div>

      <div class="chart-container">
        <h4>{{ 'fuel.mileageTrend' | translate }}</h4>
        <canvas id="mileageChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>{{ 'fuel.priceTrend' | translate }}</h4>
        <canvas id="priceChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>{{ 'fuel.odoReading' | translate }}</h4>
        <canvas id="odoChart"></canvas>
      </div>
    </div>
  `,
  styles: [
    `
    .fuel-analytics h3{
      font-weight: 500;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: var(--background-color-hover);
      border-radius: 8px;
    }

    .stat-item .label {
      display: block;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .stat-item .value {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .chart-container {
      margin: 2rem 0;
    }

    .chart-container h4 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
  `,
  ],
})
export class FuelChartsComponent implements OnChanges {

  @Input() transactionGroups: {
    categoryId: number;
    transactions: FuelTransaction[];
    total: number;
    totalFuel: number;
    averageMileage: number;
  }[] = [];

  @Input() fuelCategories: Category[] = [];

  get fuelTransactions(): FuelTransaction[] {
    return this.transactionGroups.flatMap(group => group.transactions);
  }

  stats: FuelStats = {
    mileage: 0,
    totalMileageDistance: 0,
    totalFuelCost: 0,
    costPerKm: 0,
    lastFuelPrice: 0,
    lastOdoReading: 0,
    totalFuelQuantity: 0,
  };

  constructor(private chartService: ChartService, private dbService: DbService,  private translationService: TranslationService) {
    this.updateCharts();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactionGroups']) {
      this.transactionGroups = this.transactionGroups.map(group => ({
        ...group,
        transactions: group.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));

      this.updateCharts();
    }
  }

  private updateCharts() {
    this.stats = calculateFuelStats(this.fuelTransactions);
    const { mileageData, costData, odoData } = getFuelChartData(
      this.fuelTransactions
    );

    const tdp = new TranslateDatePipe(this.translationService);

    // Update mileage chart
    const mileageCanvas = document.querySelector(
      '#mileageChart'
    ) as HTMLCanvasElement;
    if (mileageCanvas) {
      this.chartService.createLineChart(
        mileageCanvas,
        {
          labels: mileageData.map((d) => tdp.transform(d.date)),
          values: mileageData.map((d) => d.value),
        },
        '#4CAF50'
      );
    }

    // Update price chart
    const priceCanvas = document.querySelector(
      '#priceChart'
    ) as HTMLCanvasElement;
    if (priceCanvas) {
      this.chartService.createLineChart(
        priceCanvas,
        {
          labels: costData.map((d) => tdp.transform(d.date)),
          values: costData.map((d) => d.value),
        },
        '#F44336'
      );
    }

    // Update odometer chart
    const odoCanvas = document.querySelector('#odoChart') as HTMLCanvasElement;
    if (odoCanvas) {
      this.chartService.createLineChart(
        odoCanvas,
        {
          labels: odoData.map((d) => tdp.transform(d.date)),
          values: odoData.map((d) => d.value),
        },
        '#2196F3'
      );
    }
  }
}