import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from "./shared/translate.pipe";

@Component({
  standalone: true,
  selector: 'app-modal',
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <span class="close" (click)="onClose()">&times;</span>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <div class="modal-footer">
          <button class="save-btn" (click)="onSave()">{{ 'common.save' | translate }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .modal-overlay { 
      position: fixed; 
      top: 0; left: 0; right: 0; bottom: 0; 
      background: var(--background-overlay);
      display: flex; align-items: center; 
      justify-content: center; 
      z-index: 1000; 
    }

    .modal-content { 
      background-color: var(--surface-color); 
      padding: 2.5rem; 
      width: 60%; 
      min-height: 60%;
      max-height: 90vh; 
      overflow-y: auto; 
      display: flex; 
      flex-direction: column; 
    }

    .modal-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }

    .modal-body { 
      flex-grow: 1; 
      overflow-y: auto; 
      padding: 1rem 0 1.5rem 0;
    }

    .modal-footer { 
      display: flex; 
      justify-content: flex-end; 
    }

    .close { 
      color: #aaa; 
      font-size: 28px; 
      font-weight: bold; cursor: pointer; 
    }

    .save-btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: white;
      cursor: pointer;
    }
    `
  ],
  imports: [TranslatePipe]
})
export class ModalComponent {
  @Input() modalTitle = 'Modal Title';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }

  onSave() {
    this.save.emit();
  }
}
