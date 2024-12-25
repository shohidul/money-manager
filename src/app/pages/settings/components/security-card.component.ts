import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinService } from '../../../services/pin.service';
import { PinDialogComponent } from '../../../components/pin-dialog/pin-dialog.component';
import { TranslatePipe } from '../../../components/shared/translate.pipe';

@Component({
  selector: 'app-security-card',
  standalone: true,
  imports: [CommonModule, PinDialogComponent, TranslatePipe],
  template: `
    <div class="card">
      <h3>{{ 'security.title' | translate }}</h3>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-info">
            <span>{{ 'security.pinLock.title' | translate }}</span>
            <small>{{ 'security.pinLock.description' | translate }}</small>
          </div>
          <div class="switch-button">
            <input 
              type="checkbox" 
              [checked]="pinService.hasPin()"
              (change)="togglePinLock()"
              id="pinLock"
            >
            <label for="pinLock"></label>
          </div>
        </div>
        @if (pinService.hasPin()) {
          <div class="setting-item">
            <div class="setting-info">
              <span>{{ 'security.autoLock.title' | translate }}</span>
              <small>{{ 'security.autoLock.description' | translate }}</small>
            </div>
            <div class="switch-button">
              <input 
                type="checkbox" 
                [checked]="pinService.isAutoLockEnabled()"
                (change)="toggleAutoLock()"
                id="autoLock"
              >
              <label for="autoLock"></label>
            </div>
          </div>
        }
      </div>

      @if (showPinDialog) {
        <div class="pin-overlay">
          <app-pin-dialog
            mode="set"
            (pinEntered)="onPinSet($event)"
            (close)="closePinDialog()"
          />
        </div>
      }
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
      border-bottom: 1px solid var(--border-color)-light;
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

    .switch-button {
      position: relative;
      width: 50px;
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
      border-radius: 34px;
      transition: .4s;
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

    .pin-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  `],
})
export class SecurityCardComponent {
  showPinDialog = false;


  constructor(public pinService: PinService, private translate: TranslatePipe) {}

  togglePinLock() {
    if (this.pinService.hasPin()) {
      // If PIN is already set, show confirmation dialog
      if (confirm(this.translate.transform('security.dialogs.disablePinConfirm'))) {
        this.pinService.removePin();
      }
    } else {
      // If no PIN is set, show PIN dialog
      this.showPinDialog = true;
    }
  }

  toggleAutoLock() {
    const currentAutoLockStatus = this.pinService.isAutoLockEnabled();
    this.pinService.setAutoLock(!currentAutoLockStatus);
  }

  onPinSet(pin: string) {
    this.pinService.setPin(pin);
    this.closePinDialog();
    alert(this.translate.transform('security.dialogs.pinSetSuccess'));
  }

  closePinDialog() {
    this.showPinDialog = false;
  }
}