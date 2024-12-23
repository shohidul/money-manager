import { startOfMonth, endOfMonth } from 'date-fns';

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  month?: string;
  type?: string;
  subType?: string;
  status?: 'pending' | 'partial' | 'completed' | 'all';
}

export function filterTransactions<T extends { date: Date; type: string; subType: string }>(
  transactions: T[],
  options: FilterOptions
): T[] {
  return transactions.filter(tx => {
    // Month-based filtering
    if (options.month) {
      const monthDate = new Date(options.month);
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);
      
      if (tx.date < startDate || tx.date > endDate) {
        return false;
      }
    } else {
      // Existing date range filtering
      const dateMatch = (!options.startDate || tx.date >= options.startDate) &&
                       (!options.endDate || tx.date <= options.endDate);
      
      if (!dateMatch) {
        return false;
      }
    }

    const typeMatch = !options.type || tx.type === options.type;
    const subTypeMatch = !options.subType || tx.subType === options.subType;
    
    return typeMatch && subTypeMatch;
  });
}

export function groupTransactionsByDate<T extends { date: Date }>(transactions: T[]): { date: Date; items: T[] }[] {
  const groups = new Map<string, T[]>();
  
  transactions.forEach(tx => {
    const dateKey = tx.date.toISOString().split('T')[0];
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(tx);
  });

  return Array.from(groups.entries())
    .map(([dateStr, items]) => ({
      date: new Date(dateStr),
      items: items.sort((a, b) => b.date.getTime() - a.date.getTime())
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}