import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="mobile-header">
      @if (showBackButton) {
        <button class="back-button" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
        </button>
      } @else {
        <button class="menu-button" (click)="toggleMenu()">
          <span class="material-icons">menu</span>
        </button>
      }
      <h1 class="title">{{ title }}</h1>
      @if (showActions) {
        <ng-content></ng-content>
      } @else {
        <div class="spacer"></div>
      }
    </header>
  `,
  styles: [`
    .mobile-header {
      display: none;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background-color: var(--surface-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin: -1rem -1rem 1rem -1rem;
    }

    .title {
      flex: 1;
      font-size: 1.25rem;
      font-weight: 500;
      text-align: center;
      margin: 0;
    }

    .back-button,
    .menu-button {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 50%;
    }

    .back-button:hover,
    .menu-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .spacer {
      width: 40px;
    }

    @media (max-width: 768px) {
      .mobile-header {
        display: flex;
      }
    }
  `]
})
export class MobileHeaderComponent {
  @Input() title = '';
  @Input() showBackButton = false;
  @Input() showActions = false;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  toggleMenu() {
    this.menuToggle.emit();
  }

  goBack() {
    this.back.emit();
  }
}