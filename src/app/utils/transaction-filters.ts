export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  subType?: string;
  status?: 'active' | 'completed' | 'all';
}

export function filterTransactions<T extends { date: Date; type: string; subType: string }>(
  transactions: T[],
  options: FilterOptions
): T[] {
  return transactions.filter(tx => {
    const dateMatch = (!options.startDate || tx.date >= options.startDate) &&
                     (!options.endDate || tx.date <= options.endDate);
    const typeMatch = !options.type || tx.type === options.type;
    const subTypeMatch = !options.subType || tx.subType === options.subType;
    
    return dateMatch && typeMatch && subTypeMatch;
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