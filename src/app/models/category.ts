export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  subType: 'none' | 'loan' | 'repaid' | 'loanCost' | 'asset' | 'assetCost' | 'assetIncome' | 'fuel';
  order?: number;
  budget?: number;
  parentId?: number;
  children?: Category[];
}
