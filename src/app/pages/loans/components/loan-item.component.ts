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
          <div class="transaction">
            <div class="tx-info">
              <span class="date">{{ tx.date | translateDate:'short' }}</span>
              <span class="memo">{{ tx.memo }}</span>
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
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      display: inline-block;
    }

    .due-tag.due-soon {
      background: #fff3cd;
      color: #856404;
    }

    .due-tag.overdue {
      background: #f8d7da;
      color: #721c24;
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

    .progress-bar {
      height: 4px;
      background: rgba(0, 0, 0, 0.08);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .progress {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .completed .progress {
      background: #4caf50;
    }

    .transactions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .transaction {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.02);
    }

    .tx-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .date {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .memo {
      color: var(--text-primary);
    }

    .due-date {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .amount {
      font-weight: 500;
    }

    .amount.payment {
      color: #4caf50;
    }
  `]
})
export class LoanItemComponent {
  @Input() group!: LoanGroup;

  constructor(private loanService: LoanService) {}

  get dueStatus(): DueStatus | null {
    const dueDate = this.group.transactions[0]?.dueDate;
    if (!dueDate) return null;

    if (this.loanService.isOverdue(dueDate)) {
      return { class: 'overdue', text: 'loan.status.overdue' };
    }
    
    if (this.loanService.isDueSoon(dueDate)) {
      return { class: 'due-soon', text: 'loan.status.dueSoon' };
    }

    return null;
  }

  get progressPercentage(): number {
    return (this.group.status.paidAmount / this.group.status.totalAmount) * 100;
  }
}