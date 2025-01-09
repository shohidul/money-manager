import { Injectable } from '@angular/core';
import { Chart, CategoryScale, ChartConfiguration, DoughnutController, ArcElement, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { TranslationService } from './translation.service';
import { TranslateNumberPipe } from '../components/shared/translate-number.pipe';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private charts: Map<string, Chart> = new Map();

    constructor(
      private translationService: TranslationService
    ) {
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
      maintainAspectRatio: true,
      aspectRatio: 1, // This ensures circular shape
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
      maintainAspectRatio: true,
      aspectRatio: 2,
      locale: this.translationService.getCurrentLanguage(),
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return new TranslateNumberPipe(this.translationService).transform(value);
            },
            font: {
              size: 11 // Smaller font size for better responsiveness
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 45, // Angle the labels to prevent overlap
            minRotation: 0
          }
        }
      }
    }
  });

  this.charts.set(ctx.id, chart);
  return chart;
}

createLineChart2(ctx: HTMLCanvasElement, data: any, color: string) {
  const existingChart = this.charts.get(ctx.id);
  if (existingChart) {
    existingChart.destroy();
  }

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      locale: this.translationService.getCurrentLanguage(),
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return new TranslateNumberPipe(this.translationService).transform(value);
            },
            font: {
              size: 11 // Smaller font size for better responsiveness
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 45, // Angle the labels to prevent overlap
            minRotation: 0
          }
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