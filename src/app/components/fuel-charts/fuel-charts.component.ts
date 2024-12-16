import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction-types';
import {
  getFuelChartData,
  calculateFuelStats,
  FuelStats,
} from '../../utils/fuel.utils';
import { ChartService } from '../../services/chart.service';

@Component({
  selector: 'app-fuel-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fuel-analytics card">
      <h3>Fuel Analytics</h3>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span class="label">Average Mileage</span>
          <span class="value">{{ stats.mileage | number:'1.1-1' }} km/L</span>
        </div>
        <div class="stat-item">
          <span class="label">Total Distance</span>
          <span class="value">{{ stats.distance | number:'1.0-0' }} km</span>
        </div>
        <div class="stat-item">
          <span class="label">Fuel Cost/km</span>
          <span class="value">{{ stats.costPerKm | number:'1.2-2' }}/km</span>
        </div>
      </div>

      <div class="chart-container">
        <h4>Mileage Trend</h4>
        <canvas id="mileageChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>Fuel Price Trend</h4>
        <canvas id="priceChart"></canvas>
      </div>

      <div class="chart-container">
        <h4>Odometer Reading</h4>
        <canvas id="odoChart"></canvas>
      </div>
    </div>
  `,
  styles: [
    `
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 8px;
    }

    .stat-item .label {
      display: block;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .stat-item .value {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .chart-container {
      margin: 2rem 0;
    }

    .chart-container h4 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }
  `,
  ],
})
export class FuelChartsComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  stats: FuelStats = {
    mileage: 0,
    distance: 0,
    fuelQuantity: 0,
    fuelCost: 0,
    costPerKm: 0,
  };

  constructor(private chartService: ChartService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.updateCharts();
    }
  }

  private updateCharts() {
    this.stats = calculateFuelStats(this.transactions);
    const { mileageData, costData, odoData } = getFuelChartData(
      this.transactions
    );

    // Update mileage chart
    const mileageCanvas = document.querySelector(
      '#mileageChart'
    ) as HTMLCanvasElement;
    if (mileageCanvas) {
      this.chartService.createLineChart(
        mileageCanvas,
        {
          labels: mileageData.map((d) => d.date),
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
          labels: costData.map((d) => d.date),
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
          labels: odoData.map((d) => d.date),
          values: odoData.map((d) => d.value),
        },
        '#2196F3'
      );
    }
  }
}
