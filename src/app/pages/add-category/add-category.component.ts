import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { categoryGroups, CategoryIcon } from '../../data/category-icons';
import { DbService } from '../../services/db.service';
import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TransactionSubType, TransactionType } from '../../models/transaction-types';
import { TranslatePipe } from '../../components/shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule, MobileHeaderComponent, TranslatePipe],
  template: `
    <div class="add-category">
      <app-mobile-header
        [title]="'categories.add.title' | translate"
        [showBackButton]="true"
        [showOnDesktop]="true" 
        (back)="goBack()"
      />

      <div class="content">
        <div class="category-form">
          <div class="selected-icon-input">
            @if (selectedIcon) {
              <span class="material-symbols-rounded">{{ selectedIcon.icon }}</span>
            } @else {
              <span class="material-symbols-rounded placeholder">category</span>
            }
            <input 
              type="text" 
              [(ngModel)]="categoryName"
              [placeholder]="'categories.add.namePlaceholder' | translate"
              class="category-name-input"
            >
          </div>

          <div class="category-groups">
            @for (group of categoryGroups; track group.name) {
              <div class="category-group">
                <h3>{{ group.name | translate }}</h3>
                <div class="icon-grid">
                  @for (icon of group.icons; track icon.name) {
                    <button 
                      class="icon-button" 
                      [class.selected]="selectedIcon?.icon === icon.icon && selectedIcon?.name === icon.name"
                      (click)="selectIcon(icon)"
                    >
                      <span class="material-symbols-rounded">{{ icon.icon }}</span>
                      <span class="icon-name">{{ icon.name | translate }}</span>
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
        {{ 'common.save' | translate }}
      </button>
    </div>
  `,
  styles: [
    `
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
      padding-bottom: 50px;
    }

    .selected-icon-input {
      display: flex;
      align-items: center;
      gap: 1rem;
      background-color: var(--surface-color);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--box-shadow-color-light);
      position: sticky;
      top: 5px;
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
      background: var(--background-color-hover);
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
      text-align: center;
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
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      background: none;
      cursor: pointer;
      /*box-shadow: 0 2px 4px var(--box-shadow-color-light);*/
      transition: all 0.2s;
    }

    .icon-button:hover {
      background-color: var(--background-color-hover);
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
  `,
  ],
})
export class AddCategoryComponent implements OnInit {
  type: TransactionType = 'expense';
  // subType: TransactionSubType[] = ['none'];
  categoryGroups = categoryGroups;
  categoryName = '';
  selectedIcon: CategoryIcon | null = null;
  referer: string = '';
  private _selectedIconName = '';
  private initialTranslation = '';

  constructor(
    private dbService: DbService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private translationService: TranslationService
  ) {
    this.translationService.currentLang$.subscribe(() => {
      if (this.selectedIcon && this.categoryName === this.initialTranslation) {
        const newTranslation = this.translationService.translate(this._selectedIconName);
        this.categoryName = newTranslation;
        this.initialTranslation = newTranslation;
      }
    });
  }

  ngOnInit(): void {
    const typeFromQuery = this.route.snapshot.queryParamMap.get('type');
    this.type = typeFromQuery as TransactionType;

    // const subTypeFromQuery = this.route.snapshot.queryParamMap.get('subType');
    // if (subTypeFromQuery) {
    //   this.subType = [subTypeFromQuery] as TransactionSubType[];
    // }

    const refererFromQuery = this.route.snapshot.queryParamMap.get('referer');
    this.referer = refererFromQuery || '';
  }

  get isValid(): boolean {
    return !!this.selectedIcon && !!this.categoryName.trim();
  }

  get translatedIconName(): string {
    return this._selectedIconName ? this.translationService.translate(this._selectedIconName) : '';
  }

  selectIcon(icon: CategoryIcon) {
    this.selectedIcon = icon;
    this._selectedIconName = icon.name;
    
    const translation = this.translatedIconName;
    if (!this.categoryName || this.categoryName === this.initialTranslation) {
      this.categoryName = translation;
      this.initialTranslation = translation;
    }
  }

  async saveCategory() {
    if (!this.selectedIcon || !this.categoryName.trim()) return;

    // this.categoryName === this._selectedIconName 
    console.log(this.categoryName, this._selectedIconName, this.translatedIconName);

    const hasChanged = this.categoryName !== this.translatedIconName;

    const category = {
      name: hasChanged ? this.categoryName.trim() : this._selectedIconName,
      icon: this.selectedIcon.icon,
      type: this.type ?? 'expense',
      subType: ['none'] as TransactionSubType [],
      isCustom: true,
    };

    await this.dbService.addCategory(category);
    this.goBack();
  }

  goBack() {
    this.router.navigate([this.referer], {
      queryParams: { 
        type: this.type ?? 'expense',
        // subType: this.subType 
      },
    });
  }
}