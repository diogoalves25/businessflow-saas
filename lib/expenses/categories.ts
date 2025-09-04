export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  parentId?: string;
  budgetLimit?: number;
}

export const defaultCategories: ExpenseCategory[] = [
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#3b82f6',
    icon: 'megaphone',
    description: 'Advertising, campaigns, and promotional activities',
  },
  {
    id: 'operations',
    name: 'Operations',
    color: '#10b981',
    icon: 'cog',
    description: 'Day-to-day operational expenses',
  },
  {
    id: 'technology',
    name: 'Technology',
    color: '#8b5cf6',
    icon: 'computer',
    description: 'Software, hardware, and IT services',
  },
  {
    id: 'salaries',
    name: 'Salaries & Benefits',
    color: '#f59e0b',
    icon: 'users',
    description: 'Employee compensation and benefits',
  },
  {
    id: 'office',
    name: 'Office & Admin',
    color: '#ef4444',
    icon: 'building',
    description: 'Office supplies, rent, and administrative costs',
  },
  {
    id: 'travel',
    name: 'Travel & Entertainment',
    color: '#06b6d4',
    icon: 'plane',
    description: 'Business travel and client entertainment',
  },
  {
    id: 'professional',
    name: 'Professional Services',
    color: '#84cc16',
    icon: 'briefcase',
    description: 'Legal, accounting, and consulting fees',
  },
  {
    id: 'other',
    name: 'Other',
    color: '#6b7280',
    icon: 'dots-horizontal',
    description: 'Miscellaneous expenses',
  },
];

export function getCategoryById(id: string): ExpenseCategory | undefined {
  return defaultCategories.find(cat => cat.id === id);
}

export function getCategoryColor(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.color || '#6b7280';
}

export function getCategoryIcon(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.icon || 'dots-horizontal';
}

export function formatCategoryName(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.name || 'Unknown';
}