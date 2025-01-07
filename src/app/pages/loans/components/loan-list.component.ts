import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanSummaryComponent } from './loan-summary.component';
import { LoanItemComponent } from './loan-item.component';
import { LoanService } from '../../../services/loan.service';
import { LoanGroup } from '../../../models/loan.model';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    LoanSummaryComponent,
    LoanItemComponent,
    TranslatePipe,
    TranslateDatePipe,
    TranslateNumberPipe
  ],
  template: `
    <div class="loan-list">
      <app-loan-summary
        [remainingGiven]="remainingGiven"
        [remainingTaken]="remainingTaken"
      />

      <div class="loan-groups">
        <div class="loan-section card">
          <h3>{{ 'loan.loansGiven' | translate }}</h3>
          <div class="loan-items">
            @for (group of givenLoans; track group.parentId) {
              <app-loan-item [group]="group" />
            }
            @if (givenLoans.length === 0) {
              <div class="empty-state">{{ 'loan.noLoansGiven' | translate }}</div>
            }
          </div>
        </div>

        <div class="loan-section card">
          <h3>{{ 'loan.loansTaken' | translate }}</h3>
          <div class="loan-items">
            @for (group of takenLoans; track group.parentId) {
              <app-loan-item [group]="group" />
            }
            @if (takenLoans.length === 0) {
              <div class="empty-state">{{ 'loan.noLoansTaken' | translate }}</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-list {
      display: flex;
      flex-direction: column;
    }

    .loan-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .loan-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--surface-color);
      padding: 1rem;
      height: 100%;
    }

    .loan-section h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 500;
    }

    .loan-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .empty-state {
      text-align: center;
      color: var(--text-secondary);
      padding: 1rem;
      background: var(--surface-variant);
      border-radius: 4px;
    }
  `]
})
export class LoanListComponent implements OnInit {

  @Input() givenLoans: LoanGroup[] = [];
  @Input() takenLoans: LoanGroup[] = [];
  @Input() remainingGiven: number = 0;
  @Input() remainingTaken: number = 0;

  constructor(private loanService: LoanService) {}

  ngOnInit() {}
}