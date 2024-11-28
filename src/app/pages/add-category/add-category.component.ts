import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { categoryGroups, CategoryIcon } from '../../data/category-icons';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-category">
      <header class="top-bar">
        <button class="back-button" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
        </button>
        <h2>Add Category</h2>
        <button class="save-button" (click)="saveCategory()" [disabled]="!selectedIcon">
          <span class="material-icons">check_circle</span>
        </button>
      </header>

      <div class="category-form">
        <div class="type-selector">
          <button 
            [class.active]="selectedType === 'expense'"
            (click)="selectedType = 'expense'"
          >
            Expense
          </button>
          <button 
            [class.active]="selectedType === 'income'"
            (click)="selectedType = 'income'"
          >
            Income
          </button>
        </div>

        <input 
          type="text" 
          [(ngModel)]="categoryName"
          placeholder="Category Name"
          class="category-name-input"
        >

        <div class="category-groups">
          @for (group of filteredGroups; track group.name) {
            <div class="category-group">
              <h3>{{ group.name }}</h3>
              <div class="icon-grid">
                @for (icon of group.icons; track icon.name) {
                  <button 
                    class="icon-button" 
                    [class.selected]="selectedIcon === icon"
                    (click)="selectIcon(icon)"
                  >
                    <span class="material-symbols-rounded">{{ icon.icon }}</span>
                    <span class="icon-name">{{ icon.name }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .add-category {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background-color: var(--surface-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-button, .save-button {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 50%;
    }

    .back-button:hover, .save-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .save-button .material-icons{
      color: var(--primary-color);
    }

    .save-button:disabled .material-icons{
      color: unset;
    }

    .save-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .category-form {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .type-selector {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .type-selector button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.04);
      cursor: pointer;
    }

    .type-selector button.active {
      background-color: var(--primary-color);
      color: white;
    }

    .category-name-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .category-groups {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .category-group h3 {
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
    }

    .icon-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background: none;
      cursor: pointer;
      text-align: center;
    }

    .icon-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .icon-button.selected {
      background-color: var(--primary-color);
      color: white;
    }

    .icon-name {
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
  `,
  ],
})
export class AddCategoryComponent {
  categoryGroups = categoryGroups;
  selectedType: 'income' | 'expense' = 'expense';
  categoryName = '';
  selectedIcon: CategoryIcon | null = null;

  constructor(private dbService: DbService, private router: Router) {}

  get filteredGroups() {
    return this.categoryGroups.filter((group) =>
      group.icons.some((icon) => icon.type === this.selectedType)
    );
  }

  selectIcon(icon: CategoryIcon) {
    this.selectedIcon = icon;
    if (!this.categoryName) {
      this.categoryName = icon.name;
    }
  }

  async saveCategory() {
    if (!this.selectedIcon || !this.categoryName.trim()) return;

    const category = {
      name: this.categoryName.trim(),
      icon: this.selectedIcon.icon,
      type: this.selectedType,
      isCustom: true,
    };

    await this.dbService.addCategory(category);
    this.router.navigate(['/add-transaction']);
  }

  goBack() {
    this.router.navigate(['/add-transaction']);
  }
}
