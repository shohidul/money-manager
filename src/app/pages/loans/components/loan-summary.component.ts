import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanStatus } from '../../../models/loan.model';

@Component({
  selector: 'app-loan-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loan-summary">
      <div class="summary-item card">
        <span class="label">Total Given</span>
        <span class="amount">{{ totalGiven }}</span>
      </div>
      <div class="summary-item card">
        <span class="label">Total Taken</span>
        <span class="amount">{{ totalTaken }}</span>
      </div>
    </div>
  `,
  styles: [`
    .loan-summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      text-align: center;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .amount {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .positive { color: #4caf50; }
    .negative { color: #f44336; }
  `]
})
export class LoanSummaryComponent {
  @Input() totalGiven = 0;
  @Input() totalTaken = 0;
}