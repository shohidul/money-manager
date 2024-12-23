import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="input-with-suggestions">
      <input
        [type]="type"
        [id]="id"
        [(ngModel)]="value"
        (ngModelChange)="onInputChange($event)"
        (focus)="showSuggestions = true"
        (input)="onInput($event)"
        [class]="inputClass"
        [placeholder]="placeholder"
        [required]="required"
      >
      @if (showSuggestions && suggestions.length > 0) {
        <div class="suggestions-list">
          @for (suggestion of suggestions; track suggestion) {
            <div 
              class="suggestion-item" 
              (click)="selectSuggestion(suggestion)"
              [class.active]="suggestion === value"
            >
              {{ suggestion }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .input-with-suggestions {
      position: relative;
      width: 100%;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
    }

    .suggestions-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .suggestion-item {
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .suggestion-item:hover,
    .suggestion-item.active {
      background-color: #f5f5f5;
    }

    @media (max-width: 768px) {
      .suggestions-list {
        position: fixed;
        left: 0;
        right: 0;
        margin: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
    }
  `]
})
export class AutocompleteInputComponent {
  @Input() id = '';
  @Input() type = 'text';
  @Input() inputClass = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() suggestions: string[] = [];

  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() inputChange = new EventEmitter<string>();

  showSuggestions = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.input-with-suggestions')) {
      this.showSuggestions = false;
    }
  }

  onInputChange(value: string) {
    this.value = value;
    this.valueChange.emit(value);
    this.inputChange.emit(value);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(target.value);
    this.inputChange.emit(target.value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string) {
    this.value = suggestion;
    this.valueChange.emit(suggestion);
    this.showSuggestions = false;
  }
}
