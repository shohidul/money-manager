import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { categoryGroups, CategoryIcon } from '../../data/category-icons';
import { DbService } from '../../services/db.service';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule, MobileHeaderComponent],
  template: `
    <div class="add-category">
      <app-mobile-header
        title="Add Category"
        [showBackButton]="true"
        [showOnDesktop]="true" 
        (back)="goBack()"
      />

      <div class="content">
        <div class="category-form card">
          <div class="selected-icon-input">
            @if (selectedIcon) {
              <span class="material-symbols-rounded">{{ selectedIcon.icon }}</span>
            } @else {
              <span class="material-symbols-rounded placeholder">category</span>
            }
            <input 
              type="text" 
              [(ngModel)]="categoryName"
              placeholder="Category Name"
              class="category-name-input"
            >
          </div>

          <div class="category-groups">
            @for (group of categoryGroups; track group.name) {
              <div class="category-group">
                <h3>{{ group.name }}</h3>
                <div class="icon-grid">
                  @for (icon of group.icons; track icon.name) {
                    <button 
                      class="icon-button" 
                      [class.selected]="selectedIcon?.icon === icon.icon"
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

      <button 
        class="save-button" 
        [disabled]="!isValid"
        (click)="saveCategory()"
      >
        Save Category
      </button>
    </div>
  `,
  styles: [`
    .add-category {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      width: 100%;
    }

    .category-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .selected-icon-input {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .selected-icon-input .placeholder {
      color: var(--text-secondary);
    }

    .category-name-input {
      flex: 1;
      border: none;
      font-size: 1rem;
      outline: none;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
    }

    .category-groups {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .category-group h3 {
      margin-bottom: 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-left: 0.5rem;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .icon-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }

    .icon-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .icon-button.selected {
      background-color: var(--primary-color);
      color: white;
    }

    .icon-name {
      font-size: 0.75rem;
      text-align: center;
    }

    .save-button {
      position: sticky;
      bottom: 0;
      width: 100%;
      padding: 1rem;
      border: none;
      background: var(--primary-color);
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .save-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class AddCategoryComponent {
  categoryGroups = categoryGroups;
  categoryName = '';
  selectedIcon: CategoryIcon | null = null;

  constructor(private dbService: DbService, private router: Router) {}

  get isValid(): boolean {
    return !!this.selectedIcon && !!this.categoryName.trim();
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
      type: this.selectedIcon.type,
      isCustom: true,
    };

    await this.dbService.addCategory(category);
    this.router.navigate(['/add-transaction']);
  }

  goBack() {
    this.router.navigate(['/add-transaction']);
  }
}