import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { FuelListComponent } from './components/fuel-list.component';
import { FuelChartsComponent } from './components/fuel-charts.component';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, FuelListComponent, FuelChartsComponent],
  template: `
    <div class="fuel">
      <app-mobile-header
        title="Fuel Logs"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Logs</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">Analytics</button>
        </div>

        @if (activeTab === 'list') {
          <app-fuel-list />
        } @else {
          <app-fuel-charts />
        }
      </div>
    </div>
  `,
  styles: [`
    .fuel {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .tabs button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .tabs button.active {
      background: var(--primary-color);
      color: white;
    }
  `]
})
export class FuelComponent {
  activeTab: 'list' | 'charts' = 'list';

  goBack() {
    window.history.back();
  }
}