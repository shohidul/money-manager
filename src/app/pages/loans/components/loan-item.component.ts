import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanGroup } from '../../../models/loan.model';
import { LoanService } from '../../../services/loan.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';

interface DueStatus {
  class: string;
  text: string;
}

@Component({
  selector: 'app-loan-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslateDatePipe, TranslateNumberPipe],
  template: `
    @if (group) {
      <div class="loan-item card" [class.completed]="group.status.isCompleted">
        <div class="loan-header">
          <div class="person-info">
            <span class="material-symbols-rounded">person</span>
            <div class="person-details">
              <span class="person-name">{{ group.personName }}</span>
              @if (dueStatus) {
                <span class="due-tag" [class]="dueStatus.class">
                  {{ dueStatus.text | translate }}
                </span>
              }
            </div>
          </div>
          <div class="loan-amount">
            <div class="total">{{ group.status.totalAmount | translateNumber:'1.0-2' }}</div>
            @if (!group.status.isCompleted) {
              <div class="remaining">
                {{ 'loan.remaining' | translate }}: {{ group.status.remainingAmount | translateNumber:'1.0-2' }}
              </div>
            } @else {
              <div class="completed-tag">{{ 'loan.completed' | translate }}</div>
            }
          </div>
        </div>

        <div class="progress-bar">
          <div 
            class="progress" 
            [style.width.%]="progressPercentage"
          ></div>
        </div>

        <div class="transactions">
          @for (tx of group.transactions; track tx.id) {
            <div class="transaction" [class.repayment]="tx.parentId">
              <div class="tx-info">
                <div class="tx-header">
                  @if (tx.parentId) {
                    <span class="material-symbols-rounded repayment-icon">payments</span>
                  }
                  <span class="date">{{ tx.date | translateDate:'short' }}</span>
                  <span class="memo">{{ tx.memo }}</span>
                </div>
                @if (tx.dueDate) {
                  <span class="due-date">
                    {{ 'loan.dueDate' | translate }}: {{ tx.dueDate | translateDate:'shortDate' }}
                  </span>
                }
              </div>
              <span class="amount" [class.payment]="tx.parentId">
                {{ tx.parentId ? '+' : '' }}{{ tx.amount | translateNumber:'1.0-2' }}
              </span>
            </div>
          }
        </div>
      </div>
    }
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

    .person-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .person-name {
      font-weight: 500;
    }

    .due-tag {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      background-color: var(--color-gray-100);
    }

    .due-tag.overdue {
      color: var(--color-error);
      background-color: var(--color-error-bg);
    }

    .due-tag.due-soon {
      color: var(--color-warning);
      background-color: var(--color-warning-bg);
    }

    .loan-amount {
      text-align: right;
    }

    .total {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .remaining {
      font-size: 0.875rem;
      color: var(--color-gray-600);
    }

    .completed-tag {
      font-size: 0.875rem;
      color: var(--color-success);
    }

    .progress-bar {
      height: 4px;
      background-color: var(--color-gray-100);
      border-radius: 2px;
      margin-bottom: 1rem;
    }

    .progress {
      height: 100%;
      background-color: var(--color-primary);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .transactions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .transaction {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.5rem;
      border-radius: 0.5rem;
    }

    .transaction.repayment {
      background-color: var(--color-success-bg);
    }

    .tx-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tx-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .repayment-icon {
      font-size: 1rem;
      color: var(--color-success);
    }

    .date {
      font-size: 0.875rem;
      color: var(--color-gray-600);
    }

    .memo {
      font-size: 0.875rem;
    }

    .due-date {
      font-size: 0.75rem;
      color: var(--color-gray-600);
    }

    .amount {
      font-weight: 500;
    }

    .amount.payment {
      color: var(--color-success);
    }

    .completed {
      opacity: 0.7;
    }
  `]
})
export class LoanItemComponent {
  @Input() group!: LoanGroup;

  constructor(private loanService: LoanService) {}

  get dueStatus(): DueStatus | null {
    if (!this.group?.transactions[0]?.dueDate) {
      return null;
    }

    const dueDate = new Date(this.group.transactions[0].dueDate);
    const now = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0 && !this.group.status.isCompleted) {
      return { class: 'overdue', text: 'loan.status.overdue' };
    } else if (daysUntilDue <= 7 && !this.group.status.isCompleted) {
      return { class: 'due-soon', text: 'loan.status.dueSoon' };
    }

    return null;
  }

  get progressPercentage(): number {
    if (!this.group) return 0;
    const { totalAmount, paidAmount } = this.group.status;
    return (paidAmount / totalAmount) * 100;
  }
}