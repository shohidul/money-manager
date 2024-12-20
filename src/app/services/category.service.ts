import { Injectable } from '@angular/core';
import { Category, DbService } from './db.service';
import { defaultCategories } from '../data/category-icons';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesCache: Category[] | null = null;

  constructor(private dbService: DbService) {}

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();

    for (const category of defaultCategories) {
      const exists = existingCategories.some(
        c =>
          c.icon === category.icon &&
          c.type === category.type &&
          c.subType === category.subType &&
          c.isCustom === false
      );

      if (!exists) {
        await this.dbService.addCategory({
          name: category.name,
          icon: category.icon,
          type: category.type,
          subType: category.subType,
          isCustom: false
        });
      }
    }

    // Clear cache to force reload
    this.categoriesCache = null;
  }

  async getAllCategories() {
    if (this.categoriesCache === null) {
      this.categoriesCache = await this.dbService.getCategories();
    }
    return this.categoriesCache;
  }

  async getCategoriesByType(type: 'expense' | 'income') {
    const allCategories = await this.getAllCategories();
    return allCategories.filter(category => category.type === type);
  }

  async addCategory(category: Omit<Category, 'id'>) {
    // Clear cache to force reload
    this.categoriesCache = null;
    return this.dbService.addCategory(category);
  }

  async updateCategory(category: Category) {
    // Clear cache to force reload
    this.categoriesCache = null;
    return this.dbService.updateCategory(category);
  }

  async deleteCategory(id: number) {
    // Clear cache to force reload
    this.categoriesCache = null;
    return this.dbService.deleteCategory(id);
  }
}