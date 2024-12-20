import { Transaction } from '../models/transaction-types';

export interface ChartData {
  labels: string[];
  values: number[];
}

export function createTimeSeriesData(
  transactions: Transaction[],
  getValue: (tx: Transaction) => number,
  dateFormat: (date: Date) => string = (d) => d.toLocaleDateString()
): ChartData {
  const sortedTx = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return {
    labels: sortedTx.map(tx => dateFormat(tx.date)),
    values: sortedTx.map(getValue)
  };
}

export function createAggregateData(
  transactions: Transaction[],
  getKey: (tx: Transaction) => string,
  getValue: (tx: Transaction) => number
): ChartData {
  const aggregates = new Map<string, number>();
  
  transactions.forEach(tx => {
    const key = getKey(tx);
    aggregates.set(key, (aggregates.get(key) || 0) + getValue(tx));
  });

  return {
    labels: Array.from(aggregates.keys()),
    values: Array.from(aggregates.values())
  };
}