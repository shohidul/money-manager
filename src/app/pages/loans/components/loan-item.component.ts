import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanGroup } from '../../../models/loan.model';

@Component({
  selector: 'app-loan-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loan-item card" [class.completed]="group.status.isCompleted">
      <div class="loan-header">
        <div class="person-info">
          <span class="material-symbols-rounded">person</span>
          <span>{{ group.personName }}</span>
        </div>
        <div class="loan-amount">
          <div class="total">{{ group.status.totalAmount | currency }}</div>
          @if (!group.status.isCompleted) {
            <div class="remaining">
              Remaining: {{ group.status.remainingAmount | currency }}
            </div>
          } @else {
            <div class="completed-tag">Completed</div>
          }
        </div>
      </div>

      <div class="transactions">
        @for (tx of group.transactions; track tx.id) {
          <div class="transaction">
            <div class="tx-info">
              <span class="date">{{ tx.date | date:'MMM d, y' }}</span>
              <span class="memo">{{ tx.memo }}</span>
              @if (tx.dueDate) {
                <span class="due-date">Due: {{ tx.dueDate | date:'MMM d, y' }}</span>
              }
            </div>
            <span class="amount">{{ tx.amount | currency }}</span>
          </div>
        }
      </div>

      <div class="progress-bar">
        <div 
          class="progress" 
          [style.width.%]="(group.status.paidAmount / group.status.totalAmount) * 100"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .loan-item {
      margin-bottom: 1rem;
    }

    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .person-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loan-amount {
      text-align: right;
    }

    .total {
      font-weight: 500;
      color: var(--text-primary);
    }

    .remaining {
      font-size: 0.875rem;
      color: #f44336;
    }

    .completed-tag {
      font-size: 0.875rem;
      color: #4caf50;
    }

    .transactions {
      margin-bottom: 1rem;
    }

    .transaction {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .transaction:last-child {
      border-bottom: none;
    }

    .tx-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .date {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .memo {
      color: var(--text-primary);
    }

    .due-date {
      font-size: 0.75rem;
      color: #f44336;
    }

    .amount {
      font-weight: 500;
    }

    .progress-bar {
      height: 4px;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .completed .progress {
      background: #4caf50;
    }
  `]
})
export class LoanItemComponent {
  @Input() group!: LoanGroup;
}