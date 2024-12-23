import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanTransaction, LoanGroup } from '../../../models/loan.model';
import { TranslatePipe } from '../../../components/shared/translate.pipe';

@Component({
  selector: 'app-loan-list-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="loan-list-item" [class.overdue]="group.status.isOverdue">
      <div class="loan-info">
        <div class="person-name">{{ group.personName }}</div>
        <div class="loan-details">
          <span class="amount">{{ group.status.totalAmount | currency }}</span>
          <span class="status-badge" [class]="getStatusClass()">
            {{ getStatusText() }}
          </span>
          @if (group.status.dueDate && !group.status.isCompleted) {
            <span class="due-date" [class.due-soon]="isDueSoon()">
              {{ getDueDateText() }}
            </span>
          }
        </div>
      </div>
      @if (!group.status.isCompleted) {
        <div class="remaining">
          <small>Remaining</small>
          <span>{{ group.status.remainingAmount | currency }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .loan-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .loan-list-item.overdue {
      background-color: var(--error-bg);
    }

    .loan-info {
      flex: 1;
    }

    .person-name {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .loan-details {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .amount {
      font-weight: 500;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
    }

    .status-badge.completed {
      background-color: var(--success-bg);
      color: var(--success-color);
    }

    .status-badge.partial {
      background-color: var(--warning-bg);
      color: var(--warning-color);
    }

    .status-badge.pending {
      background-color: var(--info-bg);
      color: var(--info-color);
    }

    .due-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .due-date.due-soon {
      color: var(--warning-color);
    }

    .remaining {
      text-align: right;
    }

    .remaining small {
      display: block;
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .remaining span {
      font-weight: 500;
      color: var(--text-secondary);
    }
  `]
})
export class LoanListItemComponent {
  @Input() group!: LoanGroup;

  getStatusClass(): string {
    const { isCompleted } = this.group.status;
    const { status } = this.group.transactions[0];
    return status || (isCompleted ? 'completed' : 'pending');
  }

  getStatusText(): string {
    const { isCompleted } = this.group.status;
    const { status } = this.group.transactions[0];
    
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'partial':
        return 'Partial';
      default:
        return 'Pending';
    }
  }

  getDueDateText(): string {
    const { daysUntilDue, isOverdue } = this.group.status;
    
    if (isOverdue) {
      return `Overdue by ${Math.abs(daysUntilDue!)} days`;
    }
    
    if (daysUntilDue! <= 7) {
      return `Due in ${daysUntilDue} days`;
    }
    
    return `Due date: ${this.group.status.dueDate!.toLocaleDateString()}`;
  }

  isDueSoon(): boolean {
    const { daysUntilDue, isOverdue } = this.group.status;
    return !isOverdue && daysUntilDue! <= 7;
  }
}