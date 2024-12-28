/**
 * Defines the filter options for loan transactions
 */
export interface FilterOptions {
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  category?: string;
}
