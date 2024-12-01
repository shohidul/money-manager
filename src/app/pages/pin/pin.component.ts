import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PinDialogComponent } from '../../components/pin-dialog/pin-dialog.component';
import { PinService } from '../../services/pin.service';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [CommonModule, PinDialogComponent],
  template: `
    <div class="pin-page">
      <app-pin-dialog
        [mode]="'verify'"
        (pinEntered)="onPinEntered($event)"
        (forgotPin)="onForgotPin()"
      />
    </div>
  `,
  styles: [`
    .pin-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--background-color);
    }
  `]
})
export class PinComponent {
  constructor(
    private pinService: PinService,
    private router: Router
  ) {}

  onPinEntered(pin: string) {
    if (this.pinService.verifyPin(pin)) {
      this.pinService.setLocked(false);
      this.router.navigate(['/']);
    } else {
      alert('Incorrect PIN');
    }
  }

  onForgotPin() {
    if (confirm('Are you sure you want to reset your PIN? All data will be cleared for security reasons.')) {
      this.pinService.removePin();
      localStorage.clear();
      location.reload();
    }
  }
}