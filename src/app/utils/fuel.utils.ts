import {
  FuelTransaction,
  Transaction,
  isFuelTransaction,
} from '../models/transaction-types';

export interface FuelStats {
  mileage: number;
  totalMileageDistance: number;
  fuelQuantity: number;
  fuelCost: number;
  costPerKm: number;
  lastFuelPrice: number;
  lastOdoReading: number;
  totalFuelQuantity: number;
}

export function calculateMileage(
  currentTx: FuelTransaction,
  previousTx?: FuelTransaction
): number {
  if (!previousTx) return 0;

  const distance = currentTx.odometerReading - previousTx.odometerReading;

  if (Number.isNaN(distance) || distance <= 0 || currentTx.fuelQuantity <= 0)
    return 0;

  return distance / currentTx.fuelQuantity; // km/L
}

export function calculateFuelStats(transactions: Transaction[]): FuelStats {
  const fuelTransactions = transactions
    .filter(isFuelTransaction)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let totalMileageDistance = 0;
  let totalFuel = 0;
  let totalCost = 0;
  let lastFuelPrice = 0;
  let lastOdoReading = 0;
  let totalFuelQuantity = 0;

  for (let i = 1; i < fuelTransactions.length; i++) {
    const current = fuelTransactions[i];
    const previous = fuelTransactions[i - 1];
    const distance = current.odometerReading - previous.odometerReading;

    if (distance > 0) {
      totalMileageDistance += distance;
      totalFuel += current.fuelQuantity;
      totalCost += current.amount;
    }
  }

  // Get the last fuel transaction's price per liter
  if (fuelTransactions.length > 0) {
    const lastTransaction = fuelTransactions[fuelTransactions.length - 1];
    lastFuelPrice = lastTransaction.amount / lastTransaction.fuelQuantity;
    lastOdoReading = lastTransaction.odometerReading;
    totalFuelQuantity = fuelTransactions.reduce((sum, tx) => sum + tx.fuelQuantity, 0);
  }

  return {
    mileage: totalFuel > 0 ? totalMileageDistance / totalFuel : 0,
    totalMileageDistance: totalMileageDistance,
    fuelQuantity: totalFuel,
    fuelCost: totalCost,
    costPerKm: totalMileageDistance > 0 ? totalCost / totalMileageDistance : 0,
    lastFuelPrice: lastFuelPrice,
    lastOdoReading: lastOdoReading,
    totalFuelQuantity: totalFuelQuantity
  };
}

export function getFuelChartData(transactions: Transaction[]) {
  const fuelTransactions = transactions
    .filter(isFuelTransaction)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const mileageData = [];
  const costData = [];
  const odoData = [];

  for (let i = 1; i < fuelTransactions.length; i++) {
    const current = fuelTransactions[i];
    const previous = fuelTransactions[i - 1];
    const mileage = calculateMileage(current, previous);
    const date = current.date.toISOString().split('T')[0];

    mileageData.push({ date, value: mileage });
    costData.push({ date, value: current.amount / current.fuelQuantity }); // Cost per liter
    odoData.push({ date, value: current.odometerReading });
  }

  return { mileageData, costData, odoData };
}