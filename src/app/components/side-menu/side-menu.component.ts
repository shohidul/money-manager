import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../shared/translate.pipe';
import { FeatureFlagService } from '../../services/feature-flag.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="side-menu" [class.open]="isOpen">
      <div class="menu-header">
        <img src="assets/images/logo.png" alt="Logo" class="logo" (error)="onImageError($event)" *ngIf="!logoFailed" />
        <span *ngIf="logoFailed" class="material-icons">wallet</span>
        <h1>Money Manager</h1>
      </div>
      <div class="menu-items">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="close()">
          <span class="material-icons">view_stream</span>
          {{ 'menu.transactions' | translate }}
        </a>

        <a routerLink="/charts" routerLinkActive="active" (click)="close()">
          <span class="material-icons">donut_large</span>
          {{ 'menu.charts' | translate }}
        </a>

        <a *ngIf="isFeatureEnabled('fuel')" routerLink="/fuel" routerLinkActive="active" (click)="close()">
          <span class="material-icons">local_gas_station</span>
          {{ 'menu.fuelLogs' | translate }}
          <span class="beta-badge" *ngIf="isFeatureBeta('fuel')">BETA</span>
        </a>

        <a *ngIf="isFeatureEnabled('loans')" routerLink="/loans" routerLinkActive="active" (click)="close()">
          <span class="material-icons">account_balance</span>
          {{ 'menu.loanManagement' | translate }}
          <span class="beta-badge" *ngIf="isFeatureBeta('loans')">BETA</span>
        </a>

        <a *ngIf="isFeatureEnabled('assets')" routerLink="/assets" routerLinkActive="active" (click)="close()">
          <span class="material-icons">real_estate_agent</span>
          {{ 'menu.assetManagement' | translate }}
          <span class="beta-badge" *ngIf="isFeatureBeta('assets')">BETA</span>
        </a>

        <a routerLink="/export" routerLinkActive="active" (click)="close()">
          <span class="material-icons">download</span>
          {{ 'menu.export' | translate }}
        </a>

        <a routerLink="/settings" routerLinkActive="active" (click)="close()">
          <span class="material-icons">settings</span>
          {{ 'menu.settings' | translate }}
        </a>

        <a routerLink="/tutorial" routerLinkActive="active" (click)="close()">
          <span class="material-icons">help</span>
          {{ 'menu.howToUse' | translate }}
        </a>

        <a routerLink="/about" routerLinkActive="active" (click)="close()">
          <span class="material-icons">info</span>
          {{ 'menu.about' | translate }}
        </a>
      </div>
    </nav>
    <div class="menu-overlay" *ngIf="isOpen" (click)="close()"></div>
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
      background: var(--background-overlay);
      z-index: 999;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem 2rem 1.75rem 2rem;
      border-bottom: 1px solid var(--border-color);
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
      padding: 0.75rem 2.3rem;
      text-decoration: none;
      color: var(--text-primary);
      transition: background-color 0.2s;
    }

    .menu-items a:hover {
      background-color: var(--background-color-hover);
    }

    .menu-items a.active {
      background-color: var(--primary-color);
      color: white;
    }

    .menu-items a.active .beta-badge {
      color: white;
    }

    .beta-badge {
      font-size: 0.6rem;
      color: var(--primary-color);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 5px;
      font-weight: bold;
      position: absolute;
      right: 15px;
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
  logoFailed = false;

  constructor(private featureFlagService: FeatureFlagService) {}

  isFeatureEnabled(featureId: string): boolean {
    return this.featureFlagService.isFeatureEnabled(featureId);
  }

  isFeatureBeta(featureId: string): boolean {
    return this.featureFlagService.isFeatureBeta(featureId);
  }

  close() {
    this.menuClosed.emit();
  }

  onImageError(event: Event) {
    this.logoFailed = true;
    event.preventDefault();
  }
}