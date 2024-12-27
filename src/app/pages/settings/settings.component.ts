import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { SecurityCardComponent } from './components/security-card.component';
import { DataManagementCardComponent } from './components/data-management-card.component';
import { LanguageCardComponent } from './components/language-card.component';
import { AppModeCardComponent } from './components/app-mode-card.component';
import { ThemeCardComponent } from './components/theme-card.component';
import { TranslatePipe } from '../../components/shared/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MobileHeaderComponent,
    SecurityCardComponent,
    DataManagementCardComponent,
    LanguageCardComponent,
    AppModeCardComponent,
    ThemeCardComponent,
    TranslatePipe,
  ],
  template: `
    <div class="settings">
      <app-mobile-header
        [title]="'settings.title' | translate"
        [showBackButton]="true"
        (back)="goBack()"
      />

      <div class="content">
        <app-mode-card />
        <app-language-card />
        <app-theme-card />
        <app-security-card />
        <app-data-management-card />
      </div>
    </div>
  `,
  styles: [
    `
    .settings {
      max-width: 800px;
      margin: 0 auto;
    }
    .content {
      padding: 1rem;
    }
  `,
  ],
})

export class SettingsComponent implements OnInit {
  constructor(
    private router: Router,
  ) {}

  async ngOnInit() {}

  goBack() {
    this.router.navigate(['/']);
  }
}
