import { Injectable } from '@angular/core';
import { Category, DbService } from './db.service';
import { defaultCategories } from '../data/category-icons';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesCache: Category[] | null = null;

  constructor(private dbService: DbService) {}

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();

    const defaultCategoriesWithDetails = defaultCategories.map((category, index) => ({
      id: index + 1, // Start IDs from 1
      name: category.name,
      icon: category.icon,
      type: category.type,
      subType: category.subType,
      isCustom: false,
      order: index + 1
    }));

    for (const category of defaultCategoriesWithDetails) {
      const exists = existingCategories.some(
        c => c.id === category.id
      );

      if (!exists) {
        await this.dbService.addCategory(category);
      }
    }

    // Clear cache to force reload
    this.clearCategoriesCache();
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
    this.clearCategoriesCache();
    return this.dbService.addCategory(category);
  }

  async updateCategory(category: Category) {
    // Clear cache to force reload
    this.clearCategoriesCache();
    return this.dbService.updateCategory(category);
  }

  async deleteCategory(id: number) {
    // Clear cache to force reload
    this.clearCategoriesCache();
    return this.dbService.deleteCategory(id);
  }

  // Add a method to explicitly clear the cache
  clearCategoriesCache() {
    this.categoriesCache = null;
  }
}