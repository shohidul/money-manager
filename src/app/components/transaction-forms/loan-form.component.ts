import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../shared/translate.pipe';
import { LoanTransaction } from '../../models/transaction-types';
import { PersonService } from '../../services/person.service';
import { AutocompleteInputComponent } from '../shared/autocomplete-input.component';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteInputComponent, TranslatePipe],
  template: `
    <div class="form-fields">
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
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
    }
  `]
})
export class LoanFormComponent {
  @Input() transaction!: LoanTransaction;
  @Output() transactionChange = new EventEmitter<LoanTransaction>();

  suggestions: string[] = [];
  private lastQuery = '';

  constructor(private personService: PersonService) {}

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
}