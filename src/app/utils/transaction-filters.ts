import { startOfMonth, endOfMonth } from 'date-fns';

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  month?: string;
  type?: string;
  subType?: string;
  status?: 'remaining' | 'partial' | 'completed' | 'all';
  category?: string;
}

export function filterTransactions<T extends { date: Date; type: string; subType: string; category?: string }>(
  transactions: T[],
  filters: FilterOptions
): T[] {
  return transactions.filter(transaction => {
    // Prioritize startDate and endDate over month
    if (filters.startDate || filters.endDate) {
      const dateMatch = (!filters.startDate || transaction.date >= filters.startDate) &&
                       (!filters.endDate || transaction.date <= filters.endDate);
      
      if (!dateMatch) {
        return false;
      }
    } else if (filters.month) {
      const monthDate = new Date(filters.month);
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);
      
      if (transaction.date < startDate || transaction.date > endDate) {
        return false;
      }
    }

    const typeMatch = !filters.type || transaction.type === filters.type;
    const subTypeMatch = !filters.subType || transaction.subType === filters.subType;
    const statusMatch = !filters.status || filters.status === 'all' || 
                        (transaction as any).status === filters.status;
    const categoryMatch = !filters.category || filters.category === 'all' || 
                          transaction.category === filters.category;

    return typeMatch && subTypeMatch && statusMatch && categoryMatch;
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