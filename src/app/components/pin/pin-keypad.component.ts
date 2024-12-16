import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pin-keypad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pin-keypad">
      <div class="keypad-grid">
        @for (number of numbers; track number) {
          <button 
            class="keypad-button" 
            (click)="onNumberClick(number)"
          >
            {{ number }}
          </button>
        }
        <button 
          class="keypad-button function-button" 
          (click)="onBackspace()"
        >
          <span class="material-icons">backspace</span>
        </button>
        <button 
          class="keypad-button" 
          (click)="onNumberClick('0')"
        >
          0
        </button>
        <button 
          class="keypad-button function-button"
          [class.disabled]="!canSubmit"
          (click)="onSubmit()"
        >
          <span class="material-icons">check_circle</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pin-keypad {
      padding: 1rem;
    }

    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      max-width: 300px;
      margin: 0 auto;
    }

    .keypad-button {
      aspect-ratio: 1;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.04);
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }

    .keypad-button:hover {
      background: rgba(0, 0, 0, 0.08);
    }

    .keypad-button:active {
      transform: scale(0.95);
    }

    .function-button {
      color: var(--primary-color);
    }

    .function-button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .function-button.disabled:active {
      transform: none;
    }
  `]
})
export class PinKeypadComponent {
  @Output() numberClick = new EventEmitter<string>();
  @Output() backspace = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Input() canSubmit = false;

  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  onNumberClick(number: string) {
    this.numberClick.emit(number);
  }

  onBackspace() {
    this.backspace.emit();
  }

  onSubmit() {
    if (this.canSubmit) {
      this.submit.emit();
    }
  }
}