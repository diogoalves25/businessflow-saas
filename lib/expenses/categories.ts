import { prisma } from '@/lib/prisma';

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  organizationId: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const defaultCategories = [
  {
    name: 'Travel',
    description: 'Business travel, transportation, and accommodation',
    color: '#3B82F6',
    icon: 'plane',
    isDefault: true,
  },
  {
    name: 'Meals & Entertainment',
    description: 'Business meals, client entertainment',
    color: '#10B981',
    icon: 'utensils',
    isDefault: true,
  },
  {
    name: 'Office Supplies',
    description: 'Stationery, equipment, and office materials',
    color: '#F59E0B',
    icon: 'briefcase',
    isDefault: true,
  },
  {
    name: 'Technology',
    description: 'Software, hardware, and IT services',
    color: '#8B5CF6',
    icon: 'laptop',
    isDefault: true,
  },
  {
    name: 'Marketing',
    description: 'Advertising, promotions, and marketing materials',
    color: '#EC4899',
    icon: 'megaphone',
    isDefault: true,
  },
  {
    name: 'Professional Services',
    description: 'Legal, accounting, consulting fees',
    color: '#14B8A6',
    icon: 'users',
    isDefault: true,
  },
  {
    name: 'Utilities',
    description: 'Internet, phone, electricity, and other utilities',
    color: '#F97316',
    icon: 'zap',
    isDefault: true,
  },
  {
    name: 'Other',
    description: 'Miscellaneous expenses',
    color: '#6B7280',
    icon: 'more-horizontal',
    isDefault: true,
  },
];

export async function createDefaultCategories(organizationId: string): Promise<void> {
  try {
    const categories = defaultCategories.map(category => ({
      ...category,
      organizationId,
    }));

    // In production, use Prisma to create categories
    // await prisma.expenseCategory.createMany({
    //   data: categories,
    //   skipDuplicates: true,
    // });

    console.log('Created default expense categories for organization:', organizationId);
  } catch (error) {
    console.error('Failed to create default categories:', error);
    throw error;
  }
}

export async function getCategories(organizationId: string): Promise<ExpenseCategory[]> {
  // In production, fetch from database
  // return prisma.expenseCategory.findMany({
  //   where: { organizationId },
  //   orderBy: { name: 'asc' },
  // });

  // Mock implementation
  return defaultCategories.map((cat, index) => ({
    ...cat,
    id: `cat_${index + 1}`,
    organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function createCategory(
  organizationId: string,
  data: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }
): Promise<ExpenseCategory> {
  // In production, create in database
  // return prisma.expenseCategory.create({
  //   data: {
  //     ...data,
  //     organizationId,
  //     isDefault: false,
  //   },
  // });

  // Mock implementation
  return {
    id: `cat_${Date.now()}`,
    ...data,
    organizationId,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateCategory(
  categoryId: string,
  data: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>
): Promise<ExpenseCategory> {
  // In production, update in database
  // return prisma.expenseCategory.update({
  //   where: { id: categoryId },
  //   data: {
  //     ...data,
  //     updatedAt: new Date(),
  //   },
  // });

  // Mock implementation
  const mockCategory = defaultCategories[0];
  return {
    id: categoryId,
    name: data.name || mockCategory.name,
    description: data.description || mockCategory.description,
    color: data.color || mockCategory.color,
    icon: data.icon || mockCategory.icon,
    organizationId: 'mock-org',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    // In production, check if category is in use and handle accordingly
    // await prisma.expenseCategory.delete({
    //   where: { id: categoryId },
    // });
    return true;
  } catch (error) {
    console.error('Failed to delete category:', error);
    return false;
  }
}