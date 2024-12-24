import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../shared/translate.pipe';
import { LoanTransaction } from '../../models/loan.model';
import { PersonService } from '../../services/person.service';
import { LoanService } from '../../services/loan.service';
import { CategoryService } from '../../services/category.service';
import { AutocompleteInputComponent } from '../shared/autocomplete-input.component';
import { isLoanTransaction, isRepaidTransaction } from '../../models/transaction-types';


@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteInputComponent, TranslatePipe],
  template: `
    <div class="form-fields">
      @if (isLoanTransaction(transaction)) {
        <div class="form-group">
          <label for="personName">{{ 'loan.personName' | translate }}</label>
          <app-autocomplete-input
            id="personName"
            type="text"
            [(value)]="transaction.personName"
            (inputChange)="onPersonNameChange($event)"
            [suggestions]="suggestions"
            [required]="true"
            inputClass="form-input"
          />
        </div>
      }

      @if (isRepaidTransaction(transaction)) {
        <div class="form-group">
          <label for="parentLoan">{{ 'loan.parentLoan' | translate }}</label>
          <select 
            id="parentLoan" 
            [(ngModel)]="transaction.parentId" 
            class="form-input"
          >
            <option [ngValue]="null">{{ 'loan.noParentLoan' | translate }}</option>
            <option 
              *ngFor="let loan of parentLoans" 
              [ngValue]="loan.id"
            >
              {{ loan.personName }} • {{ 'transaction.types.' + loan.type | translate | titlecase }} • 
              {{ getCategoryName(loan.categoryId) | translate | titlecase }} • 
              {{ loan.amount | currency:'USD':'symbol':'1.0-0' }}
            </option>
          </select>
        </div>
      }

      @if (isLoanTransaction(transaction)) {
        <div class="form-group">
          <label for="loanDate">{{ 'loan.loanDate' | translate }}</label>
          <input
            type="date"
            id="loanDate"
            [ngModel]="transaction.loanDate | date:'yyyy-MM-dd'"
            (ngModelChange)="onLoanDateChange($event)"
            class="form-input"
            required
          >
        </div>

        <div class="form-group">
          <label for="dueDate">{{ 'loan.dueDate' | translate }}</label>
          <input
            type="date"
            id="dueDate"
            [ngModel]="transaction.dueDate | date:'yyyy-MM-dd'"
            (ngModelChange)="onDueDateChange($event)"
            class="form-input"
          >
        </div>
      }
    </div>
  `,
  styles: [`
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
      width: 100%;
      background-color: white;
    }

    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 1em;
      padding-right: 40px;
    }

    select.form-input option {
      padding: 8px;
      font-size: 0.95em;
      line-height: 1.5;
    }
  `]
})
export class LoanFormComponent implements OnInit {
  @Input() transaction!: LoanTransaction;
  @Output() transactionChange = new EventEmitter<LoanTransaction>();

  isLoanTransaction = isLoanTransaction;
  isRepaidTransaction = isRepaidTransaction;

  suggestions: string[] = [];
  private lastQuery = '';
  parentLoans: LoanTransaction[] = [];
  private categories: { [key: number]: string } = {};

  constructor(private personService: PersonService, private loanService: LoanService, private categoryService: CategoryService) {}

  async ngOnInit(): Promise<void> {
    // Load categories first
    const allCategories = await this.categoryService.getAllCategories();
    this.categories = Object.fromEntries(
      allCategories.map(cat => [cat.id, cat.name])
    );
    
    // Then load parent loans
    this.parentLoans = await this.loanService.getParentLoansByType(this.transaction.type === 'income' ? 'expense' : 'income');
  }

  async onPersonNameChange(value: string) {
    if (value !== this.lastQuery) {
      this.lastQuery = value;
      this.suggestions = await this.personService.getPersonSuggestions(value);
    }
    this.onChange();
  }

  onLoanDateChange(dateStr: string) {
    this.transaction.loanDate = new Date(dateStr);
    this.onChange();
  }

  onDueDateChange(dateStr: string) {
    this.transaction.dueDate = dateStr ? new Date(dateStr) : undefined;
    this.onChange();
  }

  onChange() {
    this.transactionChange.emit(this.transaction);
  }

  getCategoryName(categoryId: number): string {
    return this.categories[categoryId] || '';
  }
}