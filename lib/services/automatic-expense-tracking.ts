import { prisma } from '@/lib/prisma';

export interface AutomaticExpenseRule {
  id: string;
  name: string;
  description?: string;
  pattern: string;
  categoryId: string;
  isActive: boolean;
  amount?: number;
  amountType?: 'fixed' | 'percentage';
  vendorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseMatch {
  ruleId: string;
  confidence: number;
  suggestedCategory: string;
  suggestedAmount?: number;
}

export class AutomaticExpenseTracker {
  /**
   * Match a transaction description against expense rules
   */
  async matchTransaction(
    description: string,
    amount: number,
    organizationId: string
  ): Promise<ExpenseMatch | null> {
    try {
      // Get all active rules for the organization
      const rules = await this.getActiveRules(organizationId);
      
      // Find the best matching rule
      let bestMatch: ExpenseMatch | null = null;
      let highestConfidence = 0;
      
      for (const rule of rules) {
        const confidence = this.calculateMatchConfidence(description, rule);
        
        if (confidence > highestConfidence && confidence >= 0.5) {
          highestConfidence = confidence;
          bestMatch = {
            ruleId: rule.id,
            confidence,
            suggestedCategory: rule.categoryId,
            suggestedAmount: rule.amountType === 'fixed' 
              ? rule.amount 
              : rule.amountType === 'percentage' && rule.amount
                ? amount * (rule.amount / 100)
                : amount,
          };
        }
      }
      
      return bestMatch;
    } catch (error) {
      console.error('Failed to match transaction:', error);
      return null;
    }
  }

  /**
   * Calculate match confidence based on pattern matching
   */
  private calculateMatchConfidence(description: string, rule: AutomaticExpenseRule): number {
    const normalizedDescription = description.toLowerCase().trim();
    const pattern = rule.pattern.toLowerCase().trim();
    
    // Exact match
    if (normalizedDescription === pattern) {
      return 1.0;
    }
    
    // Contains pattern
    if (normalizedDescription.includes(pattern)) {
      return 0.8;
    }
    
    // Regex pattern matching
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(normalizedDescription)) {
        return 0.7;
      }
    } catch {
      // Invalid regex, skip
    }
    
    // Fuzzy matching (simplified)
    const words = pattern.split(/\s+/);
    const matchedWords = words.filter(word => 
      normalizedDescription.includes(word)
    );
    
    if (matchedWords.length > 0) {
      return matchedWords.length / words.length * 0.6;
    }
    
    return 0;
  }

  /**
   * Get all active expense rules for an organization
   */
  async getActiveRules(organizationId: string): Promise<AutomaticExpenseRule[]> {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        id: '1',
        name: 'Uber Rides',
        pattern: 'uber',
        categoryId: 'travel',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'AWS Services',
        pattern: 'amazon web services|aws',
        categoryId: 'technology',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Google Workspace',
        pattern: 'google workspace|gsuite',
        categoryId: 'technology',
        isActive: true,
        amountType: 'fixed',
        amount: 12.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Create a new automatic expense rule
   */
  async createRule(
    organizationId: string,
    rule: Omit<AutomaticExpenseRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AutomaticExpenseRule> {
    // In production, save to database
    return {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update an existing rule
   */
  async updateRule(
    ruleId: string,
    updates: Partial<AutomaticExpenseRule>
  ): Promise<AutomaticExpenseRule | null> {
    // In production, update in database
    const rule = await this.getRule(ruleId);
    if (!rule) return null;
    
    return {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    // In production, delete from database
    return true;
  }

  /**
   * Get a specific rule
   */
  async getRule(ruleId: string): Promise<AutomaticExpenseRule | null> {
    // In production, query database
    const rules = await this.getActiveRules('mock-org');
    return rules.find(r => r.id === ruleId) || null;
  }

  /**
   * Process bank transaction and create expense if matched
   */
  async processTransaction(
    transaction: {
      description: string;
      amount: number;
      date: Date;
      accountId: string;
    },
    organizationId: string,
    userId: string
  ): Promise<{ created: boolean; expenseId?: string }> {
    try {
      const match = await this.matchTransaction(
        transaction.description,
        transaction.amount,
        organizationId
      );
      
      if (!match || match.confidence < 0.6) {
        return { created: false };
      }
      
      // Create expense record (mock implementation)
      const expenseId = Date.now().toString();
      
      console.log('Creating automatic expense:', {
        description: transaction.description,
        amount: match.suggestedAmount,
        category: match.suggestedCategory,
        confidence: match.confidence,
      });
      
      return {
        created: true,
        expenseId,
      };
    } catch (error) {
      console.error('Failed to process transaction:', error);
      return { created: false };
    }
  }
}

// Export singleton instance
export const automaticExpenseTracker = new AutomaticExpenseTracker();