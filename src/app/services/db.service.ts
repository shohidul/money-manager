import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction, TransactionType, TransactionSubType } from '../models/transaction-types';

interface MoneyManagerDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': Date };
  };
  categories: {
    key: number;
    value: Category;
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
}

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db!: IDBPDatabase<MoneyManagerDB>;
  private readonly DB_NAME = 'money-manager-db';
  private readonly VERSION = 4; // Increased version for schema update

  async initializeDB() {
    this.db = await openDB<MoneyManagerDB>(this.DB_NAME, this.VERSION, {
      upgrade(db, oldVersion, newVersion) {
        if (oldVersion < 1) {
          const txStore = db.createObjectStore('transactions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          txStore.createIndex('by-date', 'date');

          const categoryStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        if (oldVersion < 2) {
          const categoryStore = db
            .transaction('categories', 'readwrite')
            .objectStore('categories');
          categoryStore
            .openCursor()
            .then(function addOrder(cursor): Promise<void> | undefined {
              if (!cursor) return;
              const category = cursor.value;
              category.order = cursor.key;
              categoryStore.put(category);
              return cursor.continue().then(addOrder);
            });
        }

        if (oldVersion < 3) {
          const txStore = db.transaction('transactions', 'readwrite').objectStore('transactions');
          txStore.openCursor().then(function updateTypes(cursor): Promise<void> | undefined {
            if (!cursor) return;
            const tx = cursor.value;
            if (!tx.type) {
              tx.type = 'expense';
            }
            txStore.put(tx);
            return cursor.continue().then(updateTypes);
          });
        }

        if (oldVersion < 4) {
          // Add subType to existing transactions and categories
          const txStore = db.transaction('transactions', 'readwrite').objectStore('transactions');
          txStore.openCursor().then(function addSubType(cursor): Promise<void> | undefined {
            if (!cursor) return;
            const tx = cursor.value;
            if (!tx.subType) {
              tx.subType = 'none';
            }
            txStore.put(tx);
            return cursor.continue().then(addSubType);
          });

          const categoryStore = db.transaction('categories', 'readwrite').objectStore('categories');
          categoryStore.openCursor().then(function addSubType(cursor): Promise<void> | undefined {
            if (!cursor) return;
            const category = cursor.value;
            if (!category.subType) {
              category.subType = 'none';
            }
            categoryStore.put(category);
            return cursor.continue().then(addSubType);
          });
        }
      },
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
    return categories.sort((a, b) => {
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

  async clearAllData() {
    const transaction = this.db.transaction(
      ['categories', 'transactions'],
      'readwrite'
    );
    await transaction.objectStore('transactions').clear();
    await transaction.objectStore('categories').clear();
    await transaction.done;
  }

  async restoreData(data: {
    transactions: Transaction[];
    categories: Category[];
  }) {
    const { transactions, categories } = data;
    const tx = this.db.transaction(['categories', 'transactions'], 'readwrite');

    try {
      for (const category of categories) {
        await tx.objectStore('categories').put(category);
      }

      for (const txn of transactions) {
        const newTransaction = {
          ...txn,
          date: new Date(txn.date),
        };
        delete newTransaction.id;
        await tx.objectStore('transactions').add(newTransaction);
      }

      await tx.done;
    } catch (error) {
      console.error('Error during restore:', error);
      throw error;
    }
  }
}