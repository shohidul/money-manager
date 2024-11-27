import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="side-menu" [class.open]="isOpen">
      <div class="menu-header">
        <span class="material-icons">account_balance_wallet</span>
        <h1>Money Manager</h1>
      </div>
      <div class="menu-items">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="close()">
          <span class="material-icons">dashboard</span>
          Dashboard
        </a>
        <a routerLink="/charts" routerLinkActive="active" (click)="close()">
          <span class="material-icons">pie_chart</span>
          Charts
        </a>
        <a routerLink="/settings" routerLinkActive="active" (click)="close()">
          <span class="material-icons">settings</span>
          Settings
        </a>
      </div>
    </nav>
  `,
  styles: [
    `
    .side-menu {
      width: 250px;
      background: var(--surface-color);
      height: 100vh;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      padding: 1rem;
      flex-shrink: 0;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      margin-bottom: 1rem;
    }

    .menu-header h1 {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .menu-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .menu-items a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: var(--text-primary);
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .menu-items a:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .menu-items a.active {
      background-color: var(--primary-color);
      color: white;
    }

    @media (max-width: 768px) {
      .side-menu {
        position: fixed;
        top: 0;
        left: 0; /* Keep it at the same position */
        z-index: 999;
        transform: translateX(-250px);
        transition: transform 0.2s ease;
      }
    }
  `,
  ],
})
export class SideMenuComponent {
  @Input() isOpen = false;
  @Output() menuClosed = new EventEmitter<void>();

  close() {
    this.menuClosed.emit();
  }
}
