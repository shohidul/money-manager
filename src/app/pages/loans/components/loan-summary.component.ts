import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanStatus } from '../../../models/loan.model';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';

@Component({
  selector: 'app-loan-summary',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslateNumberPipe],
  template: `
    <div class="loan-summary">
      <div class="summary-item card">
        <span class="label">{{'loan.stats.remainingToGet' | translate}} <span class="text-muted text-sm">({{ activeGivenLoans | translateNumber:'1.0-2' }})</span></span>
        <span class="amount positive">{{ remainingGiven | translateNumber }}</span>
      </div>
      <div class="summary-item card">
        <span class="label">{{'loan.stats.remainingToPay' | translate}} <span class="text-muted text-sm">({{ activeTakenLoans | translateNumber:'1.0-2' }})</span></span>
        <span class="amount negative">{{ remainingTaken | translateNumber }}</span>
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
      font-size: small;
      display: flex;
      justify-content: center;
      align-items: center;
      column-gap: .3rem;
    }

    .amount {
      font-size: 1.1rem;
      font-weight: 500;
    }

    .positive { color: var(--text-success); }
    .negative { color: var(--text-danger); }
  `]
})
export class LoanSummaryComponent {
  @Input() remainingGiven = 0;
  @Input() remainingTaken = 0;
  @Input() activeGivenLoans = 0;
  @Input() activeTakenLoans = 0;
}