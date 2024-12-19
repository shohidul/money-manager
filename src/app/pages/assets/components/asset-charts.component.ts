import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="asset-analytics">
      <div class="card">
        <h3>Asset Analytics</h3>
        <!-- Asset charts will go here -->
      </div>
    </div>
  `
})
export class AssetChartsComponent {}