import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pin-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pin-dialog">
      <div class="pin-header">
        <h2>{{ mode === 'verify' ? 'Enter PIN' : 'Set New PIN' }}</h2>
        <button class="close-button" (click)="onClose()">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="pin-display">
        <div *ngFor="let digit of pinDisplay" class="pin-digit">
          {{ digit ? '•' : '' }}
        </div>
      </div>

      <div class="pin-pad">
        <button *ngFor="let num of numbers" 
                (click)="onNumberClick(num)"
                class="pin-button">
          {{ num }}
        </button>
        <button class="pin-button function" (click)="onClear()">
          <span class="material-icons">backspace</span>
        </button>
        <button class="pin-button" (click)="onNumberClick('0')">0</button>
        <button class="pin-button function" (click)="onEnter()">
          <span class="material-icons">check_circle</span>
        </button>
      </div>

      @if (mode === 'verify') {
        <button class="forgot-pin" (click)="onForgotPin()">
          Forgot PIN?
        </button>
      }
    </div>
  `,
  styles: [`
    .pin-dialog {
      padding: 2rem;
      text-align: center;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .pin-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .pin-header h2 {
      margin: 0;
    }

    .close-button {
      position: absolute;
      right: -1rem;
      top: -1rem;
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .pin-display {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin: 2rem 0;
    }

    .pin-digit {
      width: 40px;
      height: 40px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .pin-pad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      max-width: 300px;
      margin: 0 auto;
    }

    .pin-button {
      padding: 1rem;
      border: none;
      background: none;
      font-size: 1.5rem;
      border-radius: 50%;
      aspect-ratio: 1;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .pin-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .pin-button.function {
      color: var(--primary-color);
    }

    .forgot-pin {
      margin-top: 2rem;
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
    }
  `]
})
export class PinDialogComponent {
  @Input() mode: 'set' | 'verify' = 'verify';
  @Output() pinEntered = new EventEmitter<string>();
  @Output() forgotPin = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  currentPin = '';
  pinDisplay: boolean[] = [false, false, false, false];

  onNumberClick(num: string) {
    if (this.currentPin.length < 4) {
      this.currentPin += num;
      this.updatePinDisplay();
    }
  }

  onClear() {
    this.currentPin = this.currentPin.slice(0, -1);
    this.updatePinDisplay();
  }

  onEnter() {
    if (this.currentPin.length === 4) {
      this.pinEntered.emit(this.currentPin);
      this.currentPin = '';
      this.updatePinDisplay();
    }
  }

  onForgotPin() {
    this.forgotPin.emit();
  }

  onClose() {
    this.close.emit();
  }

  private updatePinDisplay() {
    this.pinDisplay = Array(4).fill(false).map((_, i) => i < this.currentPin.length);
  }
}