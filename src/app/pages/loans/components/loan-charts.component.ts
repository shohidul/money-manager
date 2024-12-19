import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loan-analytics">
      <div class="card">
        <h3>Loan Analytics</h3>
        <!-- Loan charts will go here -->
      </div>
    </div>
  `
})
export class LoanChartsComponent {}