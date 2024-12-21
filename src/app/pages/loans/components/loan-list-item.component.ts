import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanGroup } from '../../../models/loan.model';

@Component({
  selector: 'app-loan-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loan-item" [class.completed]="group.status.isCompleted">
      <div class="loan-header">
        <div class="person-info">
          <span class="material-icons">person</span>
          <span>{{ group.personName }}</span>
        </div>
        <div class="loan-amount">
          <div>Total: {{ group.status.totalAmount | currency }}</div>
          <div class="remaining" *ngIf="!group.status.isCompleted">
            Remaining: {{ group.status.remainingAmount | currency }}
          </div>
          <div class="completed-tag" *ngIf="group.status.isCompleted">
            Completed
          </div>
        </div>
      </div>

      <div class="transactions">
        @for (tx of group.transactions; track tx.id) {
          <div class="transaction">
            <div class="tx-info">
              <small>{{ tx.date | date:'short' }}</small>
              <span>{{ tx.memo }}</span>
            </div>
            <span class="tx-amount">{{ tx.amount | currency }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .loan-item {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    .loan-header {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.04);
    }

    .person-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loan-amount {
      text-align: right;
    }

    .remaining {
      color: var(--secondary-color);
      font-size: 0.875rem;
    }

    .completed-tag {
      color: #4caf50;
      font-size: 0.875rem;
    }

    .transactions {
      padding: 0.5rem;
    }

    .transaction {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .tx-info {
      display: flex;
      flex-direction: column;
    }

    .tx-info small {
      color: var(--text-secondary);
    }
  `]
})
export class LoanListItemComponent {
  @Input() group!: LoanGroup;
}