import { BusinessType } from '@prisma/client';

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  taxDeductible: boolean;
}

export const DEFAULT_EXPENSE_CATEGORIES: Record<BusinessType, DefaultCategory[]> = {
  CLEANING: [
    { name: 'Cleaning Supplies', icon: '🧹', color: '#3B82F6', taxDeductible: true },
    { name: 'Equipment', icon: '🔧', color: '#8B5CF6', taxDeductible: true },
    { name: 'Vehicle', icon: '🚐', color: '#EF4444', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#10B981', taxDeductible: true },
    { name: 'Uniforms', icon: '👔', color: '#F59E0B', taxDeductible: true },
    { name: 'Marketing', icon: '📢', color: '#EC4899', taxDeductible: true },
    { name: 'Office Supplies', icon: '📎', color: '#6366F1', taxDeductible: true },
    { name: 'Fuel', icon: '⛽', color: '#14B8A6', taxDeductible: true },
  ],
  PLUMBING: [
    { name: 'Parts & Materials', icon: '🔩', color: '#3B82F6', taxDeductible: true },
    { name: 'Tools', icon: '🔨', color: '#8B5CF6', taxDeductible: true },
    { name: 'Vehicle', icon: '🚐', color: '#EF4444', taxDeductible: true },
    { name: 'Licenses', icon: '📜', color: '#10B981', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#F59E0B', taxDeductible: true },
    { name: 'Fuel', icon: '⛽', color: '#14B8A6', taxDeductible: true },
    { name: 'Training', icon: '📚', color: '#EC4899', taxDeductible: true },
    { name: 'Safety Equipment', icon: '🦺', color: '#6366F1', taxDeductible: true },
  ],
  HVAC: [
    { name: 'Parts & Materials', icon: '❄️', color: '#3B82F6', taxDeductible: true },
    { name: 'Tools & Equipment', icon: '🔧', color: '#8B5CF6', taxDeductible: true },
    { name: 'Vehicle', icon: '🚐', color: '#EF4444', taxDeductible: true },
    { name: 'Licenses & Permits', icon: '📜', color: '#10B981', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#F59E0B', taxDeductible: true },
    { name: 'Fuel', icon: '⛽', color: '#14B8A6', taxDeductible: true },
    { name: 'Certifications', icon: '🏆', color: '#EC4899', taxDeductible: true },
    { name: 'Diagnostic Equipment', icon: '📊', color: '#6366F1', taxDeductible: true },
  ],
  DENTAL: [
    { name: 'Medical Supplies', icon: '🦷', color: '#3B82F6', taxDeductible: true },
    { name: 'Equipment', icon: '🔬', color: '#8B5CF6', taxDeductible: true },
    { name: 'Lab Fees', icon: '🧪', color: '#EF4444', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#10B981', taxDeductible: true },
    { name: 'Office Rent', icon: '🏢', color: '#F59E0B', taxDeductible: true },
    { name: 'Utilities', icon: '💡', color: '#14B8A6', taxDeductible: true },
    { name: 'Professional Development', icon: '📚', color: '#EC4899', taxDeductible: true },
    { name: 'Software & Technology', icon: '💻', color: '#6366F1', taxDeductible: true },
  ],
  BEAUTY: [
    { name: 'Beauty Products', icon: '💄', color: '#EC4899', taxDeductible: true },
    { name: 'Equipment', icon: '✂️', color: '#8B5CF6', taxDeductible: true },
    { name: 'Salon Rent', icon: '🏢', color: '#3B82F6', taxDeductible: true },
    { name: 'Utilities', icon: '💡', color: '#14B8A6', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#10B981', taxDeductible: true },
    { name: 'Marketing', icon: '📢', color: '#F59E0B', taxDeductible: true },
    { name: 'Training & Education', icon: '📚', color: '#6366F1', taxDeductible: true },
    { name: 'Licenses', icon: '📜', color: '#EF4444', taxDeductible: true },
  ],
  FITNESS: [
    { name: 'Equipment', icon: '🏋️', color: '#3B82F6', taxDeductible: true },
    { name: 'Facility Rent', icon: '🏢', color: '#8B5CF6', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#10B981', taxDeductible: true },
    { name: 'Marketing', icon: '📢', color: '#F59E0B', taxDeductible: true },
    { name: 'Certifications', icon: '🏆', color: '#EC4899', taxDeductible: true },
    { name: 'Utilities', icon: '💡', color: '#14B8A6', taxDeductible: true },
    { name: 'Maintenance', icon: '🔧', color: '#6366F1', taxDeductible: true },
    { name: 'Music & Software', icon: '🎵', color: '#EF4444', taxDeductible: true },
  ],
  TUTORING: [
    { name: 'Educational Materials', icon: '📚', color: '#3B82F6', taxDeductible: true },
    { name: 'Software & Apps', icon: '💻', color: '#8B5CF6', taxDeductible: true },
    { name: 'Office Supplies', icon: '✏️', color: '#10B981', taxDeductible: true },
    { name: 'Transportation', icon: '🚗', color: '#F59E0B', taxDeductible: true },
    { name: 'Professional Development', icon: '🎓', color: '#EC4899', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#14B8A6', taxDeductible: true },
    { name: 'Marketing', icon: '📢', color: '#6366F1', taxDeductible: true },
    { name: 'Internet & Phone', icon: '📱', color: '#EF4444', taxDeductible: true },
  ],
  AUTO_REPAIR: [
    { name: 'Parts & Materials', icon: '🔧', color: '#3B82F6', taxDeductible: true },
    { name: 'Tools & Equipment', icon: '🔨', color: '#8B5CF6', taxDeductible: true },
    { name: 'Shop Rent', icon: '🏢', color: '#10B981', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#F59E0B', taxDeductible: true },
    { name: 'Utilities', icon: '💡', color: '#14B8A6', taxDeductible: true },
    { name: 'Waste Disposal', icon: '♻️', color: '#EC4899', taxDeductible: true },
    { name: 'Licenses', icon: '📜', color: '#6366F1', taxDeductible: true },
    { name: 'Diagnostic Software', icon: '💻', color: '#EF4444', taxDeductible: true },
  ],
  LANDSCAPING: [
    { name: 'Equipment', icon: '🚜', color: '#10B981', taxDeductible: true },
    { name: 'Plants & Materials', icon: '🌱', color: '#3B82F6', taxDeductible: true },
    { name: 'Vehicle', icon: '🚐', color: '#EF4444', taxDeductible: true },
    { name: 'Fuel', icon: '⛽', color: '#F59E0B', taxDeductible: true },
    { name: 'Tools', icon: '🔧', color: '#8B5CF6', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#14B8A6', taxDeductible: true },
    { name: 'Maintenance', icon: '🔨', color: '#EC4899', taxDeductible: true },
    { name: 'Safety Gear', icon: '🦺', color: '#6366F1', taxDeductible: true },
  ],
  CATERING: [
    { name: 'Food & Ingredients', icon: '🍽️', color: '#EF4444', taxDeductible: true },
    { name: 'Kitchen Equipment', icon: '👨‍🍳', color: '#3B82F6', taxDeductible: true },
    { name: 'Transportation', icon: '🚐', color: '#8B5CF6', taxDeductible: true },
    { name: 'Packaging', icon: '📦', color: '#10B981', taxDeductible: true },
    { name: 'Insurance', icon: '🛡️', color: '#F59E0B', taxDeductible: true },
    { name: 'Licenses & Permits', icon: '📜', color: '#14B8A6', taxDeductible: true },
    { name: 'Uniforms', icon: '👔', color: '#EC4899', taxDeductible: true },
    { name: 'Marketing', icon: '📢', color: '#6366F1', taxDeductible: true },
  ],
};

// Common categories for all businesses
export const COMMON_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: 'Payroll', icon: '💰', color: '#059669', taxDeductible: true },
  { name: 'Advertising', icon: '📣', color: '#7C3AED', taxDeductible: true },
  { name: 'Software & Subscriptions', icon: '💻', color: '#2563EB', taxDeductible: true },
  { name: 'Professional Services', icon: '💼', color: '#DC2626', taxDeductible: true },
  { name: 'Bank Fees', icon: '🏦', color: '#92400E', taxDeductible: true },
  { name: 'Taxes', icon: '📋', color: '#991B1B', taxDeductible: false },
  { name: 'Other', icon: '📌', color: '#6B7280', taxDeductible: true },
];

export async function createDefaultCategories(organizationId: string, businessType: BusinessType, prisma: any) {
  const businessCategories = DEFAULT_EXPENSE_CATEGORIES[businessType] || [];
  const allCategories = [...businessCategories, ...COMMON_EXPENSE_CATEGORIES];

  const promises = allCategories.map(category => 
    prisma.expenseCategory.upsert({
      where: {
        organizationId_name: {
          organizationId,
          name: category.name,
        },
      },
      update: {},
      create: {
        organizationId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        taxDeductible: category.taxDeductible,
        isDefault: true,
      },
    })
  );

  await Promise.all(promises);
}

export function getCategoryIcon(category: string): string {
  // Check business-specific categories
  for (const businessCategories of Object.values(DEFAULT_EXPENSE_CATEGORIES)) {
    const found = businessCategories.find(c => c.name === category);
    if (found) return found.icon;
  }
  
  // Check common categories
  const common = COMMON_EXPENSE_CATEGORIES.find(c => c.name === category);
  if (common) return common.icon;
  
  return '📌'; // Default icon
}

export function getCategoryColor(category: string): string {
  // Check business-specific categories
  for (const businessCategories of Object.values(DEFAULT_EXPENSE_CATEGORIES)) {
    const found = businessCategories.find(c => c.name === category);
    if (found) return found.color;
  }
  
  // Check common categories
  const common = COMMON_EXPENSE_CATEGORIES.find(c => c.name === category);
  if (common) return common.color;
  
  return '#6B7280'; // Default color
}