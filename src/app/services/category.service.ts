import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { defaultCategories } from '../data/category-icons';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private dbService: DbService) {}

  async initializeDefaultCategories() {
    const existingCategories = await this.dbService.getCategories();

    for (const category of defaultCategories) {
      console.log(category);
      const exists = existingCategories.some(
        c =>
          c.icon === category.icon &&
          c.type === category.type &&
          c.isCustom === false // Only check default categories
      );

      if (!exists) {
        await this.dbService.addCategory({
          name: category.name,
          icon: category.icon,
          type: category.type,
          isCustom: false
        });
      }
    }
  }

  async getAllCategories() {
    return await this.dbService.getCategories();
  }
}
