import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent],
  template: `
    <div class="tutorial">
      <app-mobile-header
        title="How to Use"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="section card">
          <h3>Getting Started</h3>
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <h4>Add Transactions</h4>
              <p>Tap the + button to add new income or expense transactions. Choose a category and enter the amount.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <h4>View Dashboard</h4>
              <p>See your financial overview, including income, expenses, and balance. Browse transactions by date.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
              <h4>Analyze with Charts</h4>
              <p>Visit the Charts section to visualize your spending patterns and income distribution.</p>
            </div>
          </div>
        </div>

        <div class="section card">
          <h3>Key Features</h3>
          <div class="feature">
            <span class="material-icons">category</span>
            <div>
              <h4>Custom Categories</h4>
              <p>Create your own transaction categories with custom icons.</p>
            </div>
          </div>
          <div class="feature">
            <span class="material-icons">lock</span>
            <div>
              <h4>PIN Protection</h4>
              <p>Secure your data with PIN lock. Auto-locks when app is in background.</p>
            </div>
          </div>
          <div class="feature">
            <span class="material-icons">download</span>
            <div>
              <h4>Data Export</h4>
              <p>Export your transactions to Excel or CSV format for further analysis.</p>
            </div>
          </div>
          <div class="feature">
            <span class="material-icons">pie_chart</span>
            <div>
              <h4>Visual Analytics</h4>
              <p>View spending patterns and financial trends through interactive charts.</p>
            </div>
          </div>
        </div>

        <div class="section card">
          <h3>Tips & Tricks</h3>
          <ul class="tips-list">
            <li>
              <span class="material-icons">tips_and_updates</span>
              <p>Use the month picker to quickly navigate between different months</p>
            </li>
            <li>
              <span class="material-icons">tips_and_updates</span>
              <p>Group similar transactions by creating custom categories</p>
            </li>
            <li>
              <span class="material-icons">tips_and_updates</span>
              <p>Regular backups: Export your data periodically for safekeeping</p>
            </li>
            <li>
              <span class="material-icons">tips_and_updates</span>
              <p>Use the calculator in Add Transaction for quick calculations</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tutorial {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .section {
      margin-bottom: 1.5rem;
    }

    .section h3 {
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .step {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .step:last-child {
      margin-bottom: 0;
    }

    .step-number {
      width: 32px;
      height: 32px;
      background-color: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-content h4 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .feature {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: flex-start;
    }

    .feature:last-child {
      margin-bottom: 0;
    }

    .feature .material-icons {
      color: var(--primary-color);
      font-size: 24px;
    }

    .feature h4 {
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .tips-list {
      list-style: none;
      padding: 0;
    }

    .tips-list li {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .tips-list li:last-child {
      margin-bottom: 0;
    }

    .tips-list .material-icons {
      color: var(--primary-color);
    }
  `]
})
export class TutorialComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}