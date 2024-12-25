import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { LoanListComponent } from './components/loan-list.component';
import { LoanChartsComponent } from './components/loan-charts.component';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, LoanListComponent, LoanChartsComponent],
  template: `
    <div class="loans">
      <app-mobile-header
        title="Loan Management"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Loans</button>
          <button [class.active]="activeTab === 'charts'" (click)="activeTab = 'charts'">Analytics</button>
        </div>

        @if (activeTab === 'list') {
          <app-loan-list />
        } @else {
          <app-loan-charts />
        }
      </div>
    </div>
  `,
  styles: [`
    .loans {
      max-width: 1000px;
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
      background: var(--background-color-hover);
      cursor: pointer;
    }

    .tabs button.active {
      background: var(--primary-color);
      color: white;
    }
  `]
})
export class LoansComponent {
  activeTab: 'list' | 'charts' = 'list';

  goBack() {
    window.history.back();
  }
}