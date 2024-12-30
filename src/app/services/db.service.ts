import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction, TransactionType, TransactionSubType } from '../models/transaction-types';

interface MoneyManagerDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': Date, 'by-subType': TransactionSubType };
  };
  categories: {
    key: number;
    value: Category;
  };
  budget_history: {
    key: number;
    value: BudgetHistory;
    indexes: { 'by-category': number };
  };
}

export interface Category {
  id?: number;
  name: string;
  icon: string;
  type: TransactionType;
  subType: TransactionSubType;
  isCustom: boolean;
  order?: number;
  budget?: number;
}

export interface BudgetHistory {
  id?: number;
  categoryId: number;
  budget: number;
  startDate: Date;
  endDate: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db!: IDBPDatabase<MoneyManagerDB>;
  private readonly DB_NAME = 'money-manager-db';
  private readonly VERSION = 2;

  async initializeDB() {
    this.db = await openDB<MoneyManagerDB>(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        // Ensure transactions store exists
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          
          // Explicitly create indexes
          txStore.createIndex('by-date', 'date', { unique: false });
          txStore.createIndex('by-subType', 'subType', { unique: false });
        }

        // Ensure categories store exists
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        // Ensure budget_history store exists
        if (!db.objectStoreNames.contains('budget_history')) {
          const bhStore = db.createObjectStore('budget_history', {
            keyPath: 'id',
            autoIncrement: true,
          });
          bhStore.createIndex('by-category', 'categoryId', { unique: false });
        }
      },
      blocked() {},
      blocking() {}
    });
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    return this.db.add('transactions', transaction);
  }

  async updateTransaction(transaction: Transaction) {
    return this.db.put('transactions', transaction);
  }

  async deleteTransaction(id: number) {
    return this.db.delete('transactions', id);
  }

  async getTransactions(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const index = this.db.transaction('transactions').store.index('by-date');
    return index.getAll(IDBKeyRange.bound(startDate, endDate));
  }

  async getTransactionsBySubType(
    subType: TransactionSubType, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Transaction[]> {
    if (!this.db) {
      await this.initializeDB();
    }

    try {
      const allTransactions = await this.db.getAll('transactions');
      return allTransactions.filter(tx => {
        const matchesSubType = tx.subType === subType;
        const matchesStartDate = !startDate || new Date(tx.date) >= startDate;
        const matchesEndDate = !endDate || new Date(tx.date) <= endDate;
        
        return matchesSubType && matchesStartDate && matchesEndDate;
      });
    } catch (error) {
      throw error;
    }
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.db.get('transactions', id);
  }

  async addCategory(category: Omit<Category, 'id'>) {
    const categories = await this.getCategories();
    
    // Filter categories by the same type
    const typeCategories = categories.filter(c => c.type === category.type);
    
    // Find the maximum order for the specific type
    const maxOrder = Math.max(...typeCategories.map((c) => c.order || 0), 0);
    
    return this.db.add('categories', { ...category, order: maxOrder + 1 });
  }

  async getCategoryById(id: string | number | undefined) {
    if (id === undefined) return null;
    const categories = await this.db.getAll('categories');
    return categories.find((category) => String(category.id) === String(id)) || null;
  }

  async getCategories(): Promise<Category[]> {
    const categories = await this.db.getAll('categories');
    
    // Fetch budgets for each category
    const categoriesWithBudgets = await Promise.all(
      categories.map(async (category) => ({
        ...category,
        budget: await this.getCurrentBudget(category.id!)
      }))
    );

    return categoriesWithBudgets.sort((a, b) => {
      // First sort by type (expense before income)
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare !== 0) return typeCompare;
      
      // Then sort by order within the type
      return (a.order || 0) - (b.order || 0);
    });
  }

  async updateCategory(category: Category) {
    return this.db.put('categories', category);
  }

  async updateCategoryOrder(categories: Category[]) {
    const tx = this.db.transaction('categories', 'readwrite');
    
    // Group categories by type
    const categoriesByType = categories.reduce((acc, category) => {
      if (!acc[category.type]) acc[category.type] = [];
      acc[category.type].push(category);
      return acc;
    }, {} as Record<string, Category[]>);

    // Update order for each type separately
    for (const type in categoriesByType) {
      const typedCategories = categoriesByType[type];
      await Promise.all(
        typedCategories.map((category, index) =>
          tx.store.put({ ...category, order: index + 1 })
        )
      );
    }

    await tx.done;
  }

  async resetCategoryOrder(type: 'expense' | 'income') {
    const categories = await this.getCategories();
    
    // Filter categories by the specified type
    const typedCategories = categories
      .filter(c => c.type === type)
      .sort((a, b) => (a.id || 0) - (b.id || 0)); // Sort by ID

    // Update order based on ID sorting
    const updatedCategories = typedCategories.map((category, index) => ({
      ...category,
      order: index + 1
    }));

    // Update the database
    const tx = this.db.transaction('categories', 'readwrite');
    await Promise.all(
      updatedCategories.map(category => 
        tx.store.put(category)
      )
    );
    await tx.done;

    return updatedCategories;
  }

  async deleteCategory(id: number) {
    return this.db.delete('categories', id);
  }

  async addBudgetHistory(budgetHistory: Omit<BudgetHistory, 'id'>) {
    return this.db.add('budget_history', budgetHistory);
  }

  async getBudgetHistoryByCategory(categoryId: number): Promise<BudgetHistory[]> {
    const index = this.db.transaction('budget_history').store.index('by-category');
    return index.getAll(categoryId);
  }

  async updateBudget(categoryId: number, budget: number) {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const budgetHistories = await this.getBudgetHistoryByCategory(categoryId);
    
    // Find current active budget (one with null end_date)
    const currentBudget = budgetHistories.find(bh => bh.endDate === null);
    
    if (currentBudget) {
      const currentBudgetStart = new Date(currentBudget.startDate);
      
      // If current budget is from the same month, update it
      if (currentBudgetStart.getMonth() === now.getMonth() && 
          currentBudgetStart.getFullYear() === now.getFullYear()) {
        currentBudget.budget = budget;
        return this.db.put('budget_history', currentBudget);
      } else {
        // Close current budget
        currentBudget.endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
        await this.db.put('budget_history', currentBudget);
      }
    }
    
    // Create new budget for current month
    return this.addBudgetHistory({
      categoryId,
      budget,
      startDate: startOfCurrentMonth,
      endDate: null
    });
  }

  async getCurrentBudget(categoryId: number): Promise<number> {
    const budgetHistories = await this.getBudgetHistoryByCategory(categoryId);
    const currentBudget = budgetHistories.find(bh => bh.endDate === null);
    return currentBudget?.budget || 0;
  }

  async getBudgetForDate(categoryId: number, date: Date): Promise<number> {
    const budgetHistories = await this.getBudgetHistoryByCategory(categoryId);
    const budget = budgetHistories.find(bh => {
      const start = new Date(bh.startDate);
      const end = bh.endDate ? new Date(bh.endDate) : new Date();
      return date >= start && date <= end;
    });
    return budget?.budget || 0;
  }

  async clearAllData() {
    const transaction = this.db.transaction(
      ['categories', 'transactions', 'budget_history'],
      'readwrite'
    );
    await transaction.objectStore('transactions').clear();
    await transaction.objectStore('categories').clear();
    await transaction.objectStore('budget_history').clear();
    await transaction.done;
  }

  async restoreData(data: {
    transactions: Transaction[];
    categories: Category[];
    budgetHistory: BudgetHistory[];
  }) {
    const { transactions, categories, budgetHistory } = data;
    const tx = this.db.transaction(['categories', 'transactions', 'budget_history'], 'readwrite');

    try {
      for (const category of categories) {
        await tx.objectStore('categories').put(category);
      }

      for (const transaction of transactions) {
        // Ensure date is a Date object and properly indexed
        const restoredTransaction = {
          ...transaction,
          date: transaction.date instanceof Date 
            ? transaction.date 
            : new Date(transaction.date)
        };
        await tx.objectStore('transactions').put(restoredTransaction);
      }

      for (const bh of budgetHistory) {
        await tx.objectStore('budget_history').put(bh);
      }

      await tx.done;
    } catch (error) {
      console.error('Error during restore:', error);
      throw error;
    }
  }

  async deleteDatabase() {
    // Close the current database connection
    if (this.db) {
      this.db.close();
    }

    // Delete the database
    await indexedDB.deleteDatabase(this.DB_NAME);

    // Reinitialize the database
    await this.initializeDB();
  }
}