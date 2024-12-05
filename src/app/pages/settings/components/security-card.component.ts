import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinService } from '../../../services/pin.service';
import { PinDialogComponent } from '../../../components/pin-dialog/pin-dialog.component';

@Component({
  selector: 'app-security-card',
  standalone: true,
  imports: [CommonModule, PinDialogComponent],
  template: `
    <div class="card">
      <h3>Security</h3>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-info">
            <span>PIN Lock</span>
            <small>Protect your data with a 4-digit PIN</small>
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
              <span>Auto-lock</span>
              <small>Lock app when switching to background</small>
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
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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

    .pin-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  `]
})
export class SecurityCardComponent {
  showPinDialog = false;

  constructor(public pinService: PinService) {}

  togglePinLock() {
    if (this.pinService.hasPin()) {
      if (confirm('Are you sure you want to disable PIN lock? This will remove your PIN.')) {
        this.pinService.removePin();
      }
    } else {
      this.showPinDialog = true;
    }
  }

  toggleAutoLock() {
    const newState = !this.pinService.isAutoLockEnabled();
    this.pinService.setAutoLock(newState);
  }

  onPinSet(pin: string) {
    this.pinService.setPin(pin);
    this.closePinDialog();
    alert('PIN has been set successfully');
  }

  closePinDialog() {
    this.showPinDialog = false;
  }
}