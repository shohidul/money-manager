import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../components/shared/translate.pipe';
import { FeatureFlagService } from '../../../services/feature-flag.service';

@Component({
  selector: 'app-mode-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="card">
      <h3>{{ 'settings.advancedMode.title' | translate }}</h3>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-info">
            <span>{{ 'settings.advancedMode.label' | translate }}</span>
            <small>{{ 'settings.advancedMode.description' | translate }}</small>
          </div>
          <div class="switch-button">
            <input 
              type="checkbox" 
              id="advanced_mode"
              [checked]="isAdvancedMode"
              (change)="toggleAppMode($event)"
            >
            <label for="advanced_mode"></label>
          </div>
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
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .setting-info small {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .switch-button {
      position: relative;
      min-width: 50px;
      height: 24px;
    }

    .switch-button input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-button label {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .switch-button label:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    .switch-button input:checked + label {
      background-color: var(--primary-color);
    }

    .switch-button input:checked + label:before {
      transform: translateX(26px);
    }
  `]
})
export class AppModeCardComponent implements OnInit {
  isAdvancedMode = false;

  constructor(private featureFlagService: FeatureFlagService) {}

  ngOnInit() {
    this.featureFlagService.getAppMode().subscribe(
      isAdvanced => this.isAdvancedMode = isAdvanced
    );
  }

  toggleAppMode(event: any) {
    this.featureFlagService.setAppMode(event.target.checked);
  }
}
