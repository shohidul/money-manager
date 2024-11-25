import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { BalanceComponent } from './components/balance/balance.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { Transaction } from './models/transaction.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TransactionFormComponent,
    BalanceComponent,
    TransactionListComponent
  ],
  template: `
    <div class="container">
      <h1 style="text-align: center; margin-bottom: 2rem;">Money Manager</h1>
      <app-balance [transactions]="transactions" />
      <app-transaction-form (addTransaction)="onAddTransaction($event)" />
      <app-transaction-list [transactions]="transactions" />
    </div>
  `
})
export class AppComponent {
  transactions: Transaction[] = [];

  onAddTransaction(transaction: Transaction) {
    this.transactions = [transaction, ...this.transactions];
  }
}