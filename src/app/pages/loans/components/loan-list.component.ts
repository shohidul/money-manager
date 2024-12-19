import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loan-management">
      <div class="loan-section">
        <div class="loan-given card">
          <h3>Loans Given</h3>
          <!-- Loan given list will go here -->
        </div>
        
        <div class="loan-taken card">
          <h3>Loans Taken</h3>
          <!-- Loan taken list will go here -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-management {
      margin-bottom: 1rem;
    }

    .loan-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .loan-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoanListComponent {}