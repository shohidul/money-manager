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
        <img src="assets/images/logo_foreground.png" alt="Logo" class="logo" />
        <!-- <span class="material-icons">wallet</span>-->
        <h1>Money Manager</h1>
      </div>
      <div class="menu-items">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="close()">
          <span class="material-icons">view_stream</span>
          Transactions
        </a>
        <a routerLink="/charts" routerLinkActive="active" (click)="close()">
          <span class="material-icons">donut_large</span>
          Charts
        </a>
        <a routerLink="/export" routerLinkActive="active" (click)="close()">
          <span class="material-icons">download</span>
          Export
        </a>
        <a routerLink="/settings" routerLinkActive="active" (click)="close()">
          <span class="material-icons">settings</span>
          Settings
        </a>
        <a routerLink="/tutorial" routerLinkActive="active" (click)="close()">
          <span class="material-icons">help</span>
          How to Use
        </a>
        <a routerLink="/about" routerLinkActive="active" (click)="close()">
          <span class="material-icons">info</span>
          About
        </a>
      </div>
    </nav>
    @if (isOpen) {
      <div class="menu-overlay" (click)="close()"></div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .side-menu {
      width: 280px;
      background: var(--surface-color);
      height: 100vh;
      flex-shrink: 0;
      position: relative;
      z-index: 1000;
    }

    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem 2rem 1.75rem 2rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    
    .menu-header .logo {
      height: 40px; 
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
      padding: 0.75rem 2rem;
      text-decoration: none;
      color: var(--text-primary);
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
        left: -280px;
        transition: transform 0.3s ease;
      }

      .side-menu.open {
        transform: translateX(280px);
      }
    }
  `]
})
export class SideMenuComponent {
  @Input() isOpen = false;
  @Output() menuClosed = new EventEmitter<void>();

  close() {
    this.menuClosed.emit();
  }
}