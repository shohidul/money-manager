import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { AssetListComponent } from './components/asset-list.component';
import { AssetChartsComponent } from './components/asset-charts.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    MobileHeaderComponent,
    AssetListComponent,
    AssetChartsComponent
  ],
  template: `
    <div class="assets">
      <app-mobile-header
        title="Asset Management"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Assets</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">Analytics</button>
        </div>

        @if (activeTab === 'list') {
          <app-asset-list />
        } @else {
          <app-asset-charts />
        }
      </div>
    </div>
  `,
  styles: [`
    .assets {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .tabs button {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 0.5rem;
      background: var(--background-light);
      color: var(--text);
      cursor: pointer;
    }

    .tabs button.active {
      background: var(--primary);
      color: white;
    }
  `]
})
export class AssetsComponent {
  activeTab: 'list' | 'charts' = 'list';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}