import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';
import { Subscription } from 'rxjs';
import { TranslatePipe } from "../../../components/shared/translate.pipe";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card theme-card">
      <h3>{{ 'settings.theme.title' | translate }}</h3>
      <div class="setting-item theme-mode">
        <div class="setting-info">
          <span>{{ 'settings.theme.mode' | translate }}</span>
          <small>{{ getThemeModeDescription() | translate }}</small>
        </div>
        <div class="mode-buttons">
          @for (mode of themeModes; track mode.value) {
            <button
              [class.active]="currentMode === mode.value"
              (click)="setMode(mode.value)"
            >
              <span class="material-icons">{{ mode.icon }}</span>
            </button>
          }
        </div>
      </div>

      <div class="setting-item theme-colors">
        <div class="setting-info">
          <span>{{ 'settings.theme.primaryColor' | translate }}</span>
          <small>{{ 'settings.theme.colors.' + getCurrentColorName() | translate }}</small>
        </div>
        <div class="color-options">
          @for (color of themeColors; track color.value) {
            <button
              class="color-button"
              [style.background-color]="color.value"
              [class.active]="currentColor === color.value"
              (click)="setColor(color.value)"
            >
              @if (currentColor === color.value) {
                <span class="material-icons">check</span>
              }
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-group {
      margin-top: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color-light);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
    }

    .setting-info small {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .mode-buttons {
      display: flex;
      gap: 1rem;
    }

    .mode-buttons button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 2px solid transparent;
      border-radius: 25px;
      background: var(--background-color-hover);
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.2s;
    }

    .mode-buttons button:hover {
      background: var(--background-color);
    }

    .mode-buttons button.active {
      background: var(--primary-color);
      color: white;
    }

    .mode-buttons button span {
      font-size: 18px;
    }

    .color-options {
      display: flex;
      gap: 0.5rem;
    }

    .color-button {
      width: 25px;
      height: 25px;
      border-radius: 20px;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: transform 0.2s;
    }

    .color-button:hover {
      transform: scale(1.1);
    }

    .color-button.active {
      border-color: var(--text-primary);
    }

    .color-button span {
      font-size: 16px;
    }
  `],
})
export class ThemeCardComponent implements OnInit, OnDestroy {
  currentMode: 'system' | 'light' | 'dark' = 'system';
  currentColor: string = '#2196F3';

  private modeSub!: Subscription;
  private colorSub!: Subscription;

  themeModes = [
    { value: 'system' as const, icon: 'computer' },
    { value: 'light' as const, icon: 'light_mode' },
    { value: 'dark' as const, icon: 'dark_mode' }
  ];

  themeColors = [
    { name: 'Blue', value: '#2196F3' },
    { name: 'Purple', value: '#673AB7' },
    { name: 'Green', value: '#4CAF50' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Red', value: '#F44336' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Indigo', value: '#3F51B5' },
    { name: 'Black', value: '#000000' }
  ];

  constructor(
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe to theme mode changes
    this.modeSub = this.themeService.currentMode$.subscribe(mode => {
      this.currentMode = mode;
    });

    // Subscribe to theme color changes
    this.colorSub = this.themeService.currentColor$.subscribe(color => {
      this.currentColor = color;
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.modeSub?.unsubscribe();
    this.colorSub?.unsubscribe();
  }

  setMode(mode: 'system' | 'light' | 'dark') {
    // Add a type guard to ensure only valid modes are passed
    if (mode !== 'system' && mode !== 'light' && mode !== 'dark') {
      console.error(`Invalid theme mode: ${mode}`);
      return;
    }
    this.themeService.setThemeMode(mode);
  }

  setColor(color: string) {
    this.themeService.setThemeColor(color);
  }

  getThemeModeDescription(): string {
    switch (this.currentMode) {
      case 'system':
        return 'settings.theme.systemDescription';
      case 'light':
        return 'settings.theme.lightDescription';
      case 'dark':
        return 'settings.theme.darkDescription';
      default:
        return '';
    }
  }

  getCurrentColorName(): string {
    const color = this.themeColors.find(c => c.value === this.currentColor);
    return color ? color.name : '';
  }
}
