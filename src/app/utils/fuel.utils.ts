import { FuelTransaction, Transaction, isFuelTransaction } from '../models/transaction-types';

export interface FuelStats {
  mileage: number;
  distance: number;
  fuelQuantity: number;
  fuelCost: number;
  costPerKm: number;
}

export function calculateMileage(currentTx: FuelTransaction, previousTx?: FuelTransaction): number {
  if (!previousTx) return 0;
  
  const distance = currentTx.odometerReading - previousTx.odometerReading;
  if (distance <= 0 || currentTx.fuelQuantity <= 0) return 0;
  
  return distance / currentTx.fuelQuantity; // km/L
}

export function calculateFuelStats(transactions: Transaction[]): FuelStats {
  const fuelTransactions = transactions
    .filter(isFuelTransaction)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let totalDistance = 0;
  let totalFuel = 0;
  let totalCost = 0;

  for (let i = 1; i < fuelTransactions.length; i++) {
    const current = fuelTransactions[i];
    const previous = fuelTransactions[i - 1];
    const distance = current.odometerReading - previous.odometerReading;
    
    if (distance > 0) {
      totalDistance += distance;
      totalFuel += current.fuelQuantity;
      totalCost += current.amount;
    }
  }

  return {
    mileage: totalFuel > 0 ? totalDistance / totalFuel : 0,
    distance: totalDistance,
    fuelQuantity: totalFuel,
    fuelCost: totalCost,
    costPerKm: totalDistance > 0 ? totalCost / totalDistance : 0
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