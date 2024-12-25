import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent],
  template: `
    <div class="about">
      <app-mobile-header
        title="About"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <div class="app-info card">
          <h3>Money Manager</h3>
          <p class="version">Version 1.0.0</p>
          <p class="description">
            A powerful personal finance tracking application designed to help you manage your income and expenses effectively.
            Built with modern web technologies, this app provides a seamless experience for tracking your financial transactions
            and understanding your spending patterns.
          </p>
        </div>

        <div class="features card">
          <h3>Key Features</h3>
          <ul>
            <li>Track income and expenses with detailed categorization</li>
            <li>Visual analytics with charts and graphs</li>
            <li>Monthly transaction overview</li>
            <li>Custom categories management</li>
            <li>Data export in Excel/CSV formats</li>
            <li>PIN protection for privacy</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>

        <div class="developer card">
          <h3>Developer</h3>
          <p>Created with ❤️ by 
            <a href="https://shohidul.github.io" target="_blank" rel="noopener noreferrer">
              Shohidul
            </a>
          </p>
          <div class="social-links">
            <a href="https://github.com/shohidul" target="_blank" rel="noopener noreferrer">
              <span class="material-icons">code</span>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/shohidulislamhridoy/" target="_blank" rel="noopener noreferrer">
              <span class="material-icons">person</span>
              LinkedIn
            </a>
          </div>
        </div>

        <div class="privacy card">
          <h3>Privacy & Security</h3>
          <p>
            All your data is stored locally on your device. We don't collect or transmit any personal information.
            The app works offline and your financial data remains private and secure.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about {
      max-width: 800px;
      margin: 0 auto;
    }

    .content {
      padding: 1rem;
    }

    .app-info {
      text-align: center;
      padding: 2rem;
    }

    .version {
      color: var(--text-secondary);
      margin: 0.5rem 0;
    }

    .description {
      margin: 1rem 0;
      line-height: 1.6;
    }

    .features ul {
      list-style: none;
      padding: 0;
    }

    .features li {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color-light);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .features li:last-child {
      border-bottom: none;
    }

    .developer {
      text-align: center;
      padding: 2rem;
    }

    .social-links {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .social-links a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--primary-color);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.04);
      transition: background-color 0.2s;
    }

    .social-links a:hover {
      background: rgba(0, 0, 0, 0.08);
    }

    .privacy {
      line-height: 1.6;
    }
  `]
})
export class AboutComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}