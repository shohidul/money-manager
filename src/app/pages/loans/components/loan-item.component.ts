import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanGroup } from '../../../models/loan.model';
import { LoanService } from '../../../services/loan.service';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { TranslateDatePipe } from '../../../components/shared/translate-date.pipe';
import { TranslateNumberPipe } from '../../../components/shared/translate-number.pipe';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../services/db.service';

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
      <div class="loan-item" [class.completed]="group.status.isCompleted">
        <div class="transaction-item ">
          <span class="material-symbols-rounded" [class]="group.parent.type">
            {{ getCategoryIcon(group.parent.categoryId) }}
          </span>
          <div class="transaction-details">
            <span class="small-text">{{ group.parent.date | translateDate }}, {{ group.parent.date | translateDate: 'shortTime' }}</span>
            <span class="memo">{{ getCategoryName(group.parent.categoryId) | translate }}</span>
            <span class="small-text">
              {{ group.parent.personName || ('common.noName' | translate) }} | 
              {{ group.parent.memo || ('common.noMemo' | translate) }} |
              {{ 'loan.dueDate' | translate }}: {{ group.parent.dueDate ? (group.parent.dueDate | translateDate) : 'N/A' }} |
              {{ 'loan.status.'+(group.parent.status || 'remaining')  | translate  }} 
            </span>
          </div>
          <span class="amount">
            {{ group.parent.amount | translateNumber:'1.0-2' }}
          </span>
        </div>
        
        <div class="transactions">
          @for (tx of group.transactions; track tx.id) {
            <div class="transaction-item" [class.repayment]="tx.parentId">
              <span class="material-symbols-rounded" [class]="tx.type">
                {{ getCategoryIcon(tx.categoryId) }}
              </span>
              <div class="transaction-details">
                <span class="small-text">{{ tx.date | translateDate }}, {{ tx.date | translateDate: 'shortTime' }}</span>
                <span class="memo">{{ getCategoryName(tx.categoryId) | translate }}</span>
                <span class="small-text">
                {{ tx.memo || ('common.noMemo' | translate) }}
                </span>
              </div>
              <span class="amount">
              {{ tx.parentId ? '+' : '' }}{{ tx.amount | translateNumber:'1.0-2' }}
              </span>
            </div>
          }
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress" 
            [style.width.%]="progressPercentage"
          ></div>
        </div>
        <div class="remaining amount">
          {{ 'loan.status.remaining' | translate }}: {{ group.status.remainingAmount | translateNumber:'1.0-2' }}
        </div>
      </div>
    }
  `,
  styles: [`
    .loan-item {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: var(--surface-color);
      box-shadow: 0 2px 4px var(--box-shadow-color-light);
    }
    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.1rem 1rem 0.8rem 1rem;
      margin: 0 -1rem;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--background-color);
      font-size: 0.875rem;
    }

    .transaction-item:hover {
      background-color: var(--background-color-hover);
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-details .small-text {
      display: block;
      font-size: 0.65rem;
      color: #999;
      margin-top: 0.25rem;
    }

    .memo {
      display: block;
      font-weight: 500;
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

    .total {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .remaining {
      font-size: 0.875rem;
      text-align: right;
    }

    .completed-tag {
      font-size: 0.875rem;
      color: var(--color-success);
    }

    .progress-bar {
      height: 3px;
      background-color: var(--background-color);
      border-radius: 2px;
      margin: 1.5rem 0 0.5rem 0;
    }

    .progress {
      height: 100%;
      background-color: var(--text-success);
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
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      margin: 0 -1rem;
    }

    .transaction:hover {
      background-color: var(--background-color-hover);
    }

    .tx-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tx-header {
      /*display: flex;
      align-items: center;
      gap: 0.5rem;*/
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
export class LoanItemComponent implements OnInit {
  @Input() group!: LoanGroup;
  categories: any[] = [];

  constructor(private loanService: LoanService, private categoryService: CategoryService,) {}

  async ngOnInit(): Promise<void> {
    this.categories = await this.categoryService.getAllCategories();
  }

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

  getCategoryIcon(categoryId: number): string {
    return this.getCategory(categoryId)?.icon || 'help';
  }

  getCategoryName(categoryId: number): string {
    return this.getCategory(categoryId)?.name || 'Unknown';
  }

  getCategory(categoryId: number): Category | null {
    const category = this.categories.find((c) => c.id === categoryId);
    return category || null;
  }
}