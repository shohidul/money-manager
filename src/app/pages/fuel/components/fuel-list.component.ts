import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fuel-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fuel-logs">
      <div class="card">
        <h3>Fuel Entries</h3>
        <!-- Fuel entries list will go here -->
      </div>
    </div>
  `,
  styles: [`
    .fuel-logs {
      margin-bottom: 1rem;
    }
  `]
})
export class FuelListComponent {}