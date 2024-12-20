import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction-types';

@Component({
  selector: 'app-transaction-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transaction-group card">
      <div class="date-header">
        <span>{{ date | date:'MMM d, y' }}</span>
        <span class="total" *ngIf="showTotal">
          {{ total | currency }}
        </span>
      </div>
      
      <div class="transactions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .date-header {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .transactions {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class TransactionGroupComponent {
  @Input() date!: Date;
  @Input() total?: number;
  @Input() showTotal = true;
}