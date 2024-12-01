import { Injectable } from '@angular/core';
import { Chart, CategoryScale, ChartConfiguration, DoughnutController, ArcElement, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private charts: Map<string, Chart> = new Map();

    constructor() {
    // Register all required components for Chart.js
    Chart.register(
      CategoryScale,
      DoughnutController,
      ArcElement, LineController, LineElement, PointElement, LinearScale, Title
    );
  }

  createDonutChart(ctx: CanvasRenderingContext2D, data: any[], colors: string[]) {
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.category),
        datasets: [{
          data: data.map(item => item.amount),
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        cutout: '70%'
      }
    });

    return chart;
  }

  createLineChart(ctx: HTMLCanvasElement, data: any, color: string) {
    const existingChart = this.charts.get(ctx.id);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Amount',
          data: data.values,
          borderColor: color,
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    this.charts.set(ctx.id, chart);
    return chart;
  }

  destroyChart(chartId: string) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }
}