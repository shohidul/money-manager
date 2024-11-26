import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Category } from '../../services/db.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings">
      <header class="top-bar">
        <h2>Settings</h2>
      </header>

      <div class="card">
        <h3>Category Management</h3>
        <div class="category-list">
          <div *ngFor="let category of categories" class="category-item">
            <div class="category-info">
              <span class="material-icons">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
              <span class="category-type">{{ category.type }}</span>
            </div>
            <button 
              *ngIf="category.isCustom"
              class="delete-button"
              (click)="deleteCategory(category)"
            >
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Data Management</h3>
        <div class="settings-group">
          <button class="export-button" (click)="exportData()">
            <span class="material-icons">download</span>
            Export Data
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .top-bar {
      margin-bottom: 1rem;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.04);
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .category-type {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .delete-button {
      background: none;
      border: none;
      color: var(--secondary-color);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
    }

    .delete-button:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    .settings-group {
      margin-top: 1rem;
    }

    .export-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
    }

    .export-button:hover {
      background-color: #1976d2;
    }
  `]
})
export class SettingsComponent implements OnInit {
  categories: Category[] = [];

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.dbService.getCategories();
  }

  async deleteCategory(category: Category) {
    if (!category.id) return;
    
    const confirm = window.confirm(`Are you sure you want to delete the category "${category.name}"?`);
    if (!confirm) return;

    await this.dbService.deleteCategory(category.id);
    await this.loadCategories();
  }

  async exportData() {
    const startDate = new Date(0); // Beginning of time
    const endDate = new Date(); // Current date
    
    const transactions = await this.dbService.getTransactions(startDate, endDate);
    const categories = await this.dbService.getCategories();

    const data = {
      transactions,
      categories
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `money-manager-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}