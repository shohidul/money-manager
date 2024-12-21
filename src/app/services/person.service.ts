import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { isLoanTransaction } from '../models/transaction-types';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private personNamesCache: string[] = [];
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private dbService: DbService) {}

  async getPersonSuggestions(query: string): Promise<string[]> {
    await this.updatePersonNamesCache();
    query = query.toLowerCase();
    return this.personNamesCache
      .filter(name => name.toLowerCase().includes(query))
      .slice(0, 5); // Limit to 5 suggestions
  }

  private async updatePersonNamesCache() {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.CACHE_DURATION && this.personNamesCache.length > 0) {
      return;
    }

    // Get transactions from the last year
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    const transactions = await this.dbService.getTransactions(startDate, endDate);
    
    // Extract unique person names
    this.personNamesCache = Array.from(new Set(
      transactions
        .filter(isLoanTransaction)
        .map(tx => tx.personName)
        .filter(name => name && name.trim() !== '')
    )).sort();

    this.lastUpdateTime = now;
  }
}
