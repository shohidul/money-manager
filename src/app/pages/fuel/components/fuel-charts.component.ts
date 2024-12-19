import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fuel-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fuel-analytics">
      <div class="card">
        <h3>Fuel Analytics</h3>
        <!-- Fuel charts will go here -->
      </div>
    </div>
  `
})
export class FuelChartsComponent {}