import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="asset-management">
      <div class="asset-section">
        <div class="asset-purchased card">
          <h3>Assets Purchased</h3>
          <!-- Asset purchase list will go here -->
        </div>
        
        <div class="asset-sold card">
          <h3>Assets Sold</h3>
          <!-- Asset sold list will go here -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asset-management {
      margin-bottom: 1rem;
    }

    .asset-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .asset-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssetListComponent {}