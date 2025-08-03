import { UserData, DetailedRecommendation } from '@shared/schema';
import { investmentDatabase } from './investment-data';

// Investment strategies based on user profile
export interface InvestmentStrategy {
  name: string;
  nameAr: string;
  riskProfile: 'منخفض' | 'متوسط' | 'عالي';
  allocation: {
    'real-estate': number;
    'stocks': number;
    'gold': number;
    'bonds': number;
    'savings': number;
    'crypto': number;
  };
  description: string;
}

export const investmentStrategies: Record<string, InvestmentStrategy> = {
  conservative: {
    name: 'Conservative',
    nameAr: 'محافظ',
    riskProfile: 'منخفض',
    allocation: {
      'real-estate': 15,
      'stocks': 20,
      'gold': 25,
      'bonds': 25,
      'savings': 15,
      'crypto': 0
    },
    description: 'استراتيجية آمنة تركز على الحفاظ على رأس المال مع عوائد مستقرة'
  },
  balanced: {
    name: 'Balanced',
    nameAr: 'متوازن',
    riskProfile: 'متوسط',
    allocation: {
      'real-estate': 25,
      'stocks': 30,
      'gold': 15,
      'bonds': 15,
      'savings': 10,
      'crypto': 5
    },
    description: 'توازن بين النمو والأمان مع تنويع متوسط المخاطر'
  },
  aggressive: {
    name: 'Aggressive',
    nameAr: 'جريء',
    riskProfile: 'عالي',
    allocation: {
      'real-estate': 30,
      'stocks': 40,
      'gold': 10,
      'bonds': 5,
      'savings': 5,
      'crypto': 10
    },
    description: 'استراتيجية عالية المخاطر تستهدف أقصى نمو للثروة'
  },
  income_focused: {
    name: 'Income Focused',
    nameAr: 'مركز على الدخل',
    riskProfile: 'منخفض',
    allocation: {
      'real-estate': 35,
      'stocks': 15,
      'gold': 10,
      'bonds': 30,
      'savings': 10,
      'crypto': 0
    },
    description: 'استراتيجية تركز على توليد دخل شهري منتظم'
  },
  retirement: {
    name: 'Retirement',
    nameAr: 'التقاعد',
    riskProfile: 'منخفض',
    allocation: {
      'real-estate': 20,
      'stocks': 25,
      'gold': 20,
      'bonds': 25,
      'savings': 10,
      'crypto': 0
    },
    description: 'استراتيجية طويلة المدى للادخار للتقاعد'
  }
};

// Currency conversion rates (should be fetched from API in production)
export const currencyRates = {
  SAR: 1,
  AED: 1.02,
  USD: 3.75,
  EUR: 4.15,
  GBP: 4.85
};

// Smart recommendation engine
export class SmartRecommendationEngine {
  
  /**
   * Analyze user data and generate intelligent recommendations
   */
  static generateRecommendations(userData: UserData): {
    allocation: Record<string, number>;
    summary: string;
    expectedReturn: string;
    riskLevel: string;
    detailedRecommendations: DetailedRecommendation[];
    strategy: InvestmentStrategy;
    totalAllocated: number;
    remainingAmount: number;
  } {
    
    // Step 1: Determine the best investment strategy
    const strategy = this.selectOptimalStrategy(userData);
    
    // Step 2: Convert investment amount to SAR for consistent calculations
    const investmentAmountSAR = this.convertToSAR(parseInt(userData.investmentBudget), userData.currency);
    
    // Step 3: Apply user preferences to modify strategy allocation
    const adjustedAllocation = this.adjustAllocationByPreferences(strategy.allocation, userData.preferences);
    
    // Step 4: Generate specific investment recommendations with exact amounts
    const detailedRecommendations = this.generateDetailedRecommendations(
      investmentAmountSAR, 
      adjustedAllocation, 
      userData
    );
    
    // Step 5: Calculate final allocation amounts
    const finalAllocation = this.calculateFinalAllocation(detailedRecommendations);
    const totalAllocated = Object.values(finalAllocation).reduce((sum, amount) => sum + amount, 0);
    const remainingAmount = investmentAmountSAR - totalAllocated;
    
    // Step 6: Generate summary and expected return
    const summary = this.generateSummary(strategy, detailedRecommendations, userData);
    const expectedReturn = this.calculateExpectedReturn(detailedRecommendations);
    
    return {
      allocation: finalAllocation,
      summary,
      expectedReturn,
      riskLevel: strategy.riskProfile,
      detailedRecommendations,
      strategy,
      totalAllocated,
      remainingAmount
    };
  }
  
  /**
   * Select optimal investment strategy based on user profile
   */
  private static selectOptimalStrategy(userData: UserData): InvestmentStrategy {
    const age = userData.age;
    const riskTolerance = userData.riskTolerance;
    const goals = userData.goals;
    
    // Age-based factor
    let ageFactor = 0;
    if (age === '18-25') ageFactor = 0.8; // Young, can take more risk
    else if (age === '26-35') ageFactor = 0.6;
    else if (age === '36-45') ageFactor = 0.4;
    else if (age === '46-55') ageFactor = 0.2;
    else ageFactor = 0.1; // 55+, conservative
    
    // Risk tolerance factor
    let riskFactor = 0;
    if (riskTolerance === 'high') riskFactor = 1;
    else if (riskTolerance === 'medium') riskFactor = 0.5;
    else riskFactor = 0.1;
    
    // Goals factor
    let goalsFactor = 0.5;
    if (goals.includes('retirement')) goalsFactor = 0.2;
    if (goals.includes('emergency')) goalsFactor = 0.1;
    if (goals.includes('investment')) goalsFactor = 0.8;
    
    // Calculate combined risk score
    const riskScore = (ageFactor + riskFactor + goalsFactor) / 3;
    
    // Select strategy based on risk score and specific goals
    if (goals.includes('retirement')) {
      return investmentStrategies.retirement;
    } else if (goals.includes('emergency') || riskScore < 0.3) {
      return investmentStrategies.conservative;
    } else if (riskScore < 0.6) {
      return investmentStrategies.balanced;
    } else {
      return investmentStrategies.aggressive;
    }
  }
  
  /**
   * Adjust strategy allocation based on user preferences
   */
  private static adjustAllocationByPreferences(
    baseAllocation: InvestmentStrategy['allocation'], 
    preferences: string[]
  ): InvestmentStrategy['allocation'] {
    const adjusted = { ...baseAllocation };
    
    // If user has no preferences for a category, reduce its allocation to 0
    Object.keys(adjusted).forEach(category => {
      if (!preferences.includes(category.replace('-', ''))) {
        adjusted[category as keyof typeof adjusted] = 0;
      }
    });
    
    // Redistribute the removed allocations among preferred categories
    const totalPreferredAllocation = Object.keys(adjusted)
      .filter(category => preferences.includes(category.replace('-', '')))
      .reduce((sum, category) => sum + baseAllocation[category as keyof typeof baseAllocation], 0);
    
    if (totalPreferredAllocation > 0) {
      Object.keys(adjusted).forEach(category => {
        if (preferences.includes(category.replace('-', ''))) {
          const originalWeight = baseAllocation[category as keyof typeof baseAllocation];
          adjusted[category as keyof typeof adjusted] = (originalWeight / totalPreferredAllocation) * 100;
        }
      });
    }
    
    return adjusted;
  }
  
  /**
   * Generate detailed recommendations with specific amounts and products
   */
  private static generateDetailedRecommendations(
    totalAmount: number,
    allocation: InvestmentStrategy['allocation'],
    userData: UserData
  ): DetailedRecommendation[] {
    const recommendations: DetailedRecommendation[] = [];
    
    Object.entries(allocation).forEach(([category, percentage]) => {
      if (percentage > 0) {
        const categoryAmount = Math.floor((totalAmount * percentage) / 100);
        const categoryRecommendations = this.selectBestProductsForCategory(
          category as keyof typeof investmentDatabase,
          categoryAmount,
          userData
        );
        recommendations.push(...categoryRecommendations);
      }
    });
    
    return recommendations;
  }
  
  /**
   * Select best products for a specific category based on amount and user profile
   */
  private static selectBestProductsForCategory(
    category: keyof typeof investmentDatabase,
    amount: number,
    userData: UserData
  ): DetailedRecommendation[] {
    const availableProducts = investmentDatabase[category] || [];
    const recommendations: DetailedRecommendation[] = [];
    
    // Sort products by recommendation strength and risk compatibility
    const sortedProducts = availableProducts
      .filter(product => this.isProductSuitable(product, userData))
      .sort((a, b) => {
        const scoreA = this.calculateProductScore(a, userData);
        const scoreB = this.calculateProductScore(b, userData);
        return scoreB - scoreA;
      });
    
    let remainingAmount = amount;
    
    for (const product of sortedProducts) {
      if (remainingAmount <= 0) break;
      
      const minInvestment = this.extractNumericValue(product.minimumInvestment);
      
      if (minInvestment <= remainingAmount) {
        // Calculate how much to invest in this product
        let investmentAmount = Math.min(remainingAmount, Math.floor(remainingAmount * 0.7));
        investmentAmount = Math.max(investmentAmount, minInvestment);
        
        if (investmentAmount >= minInvestment) {
          const recommendationWithAmount = this.createSpecificRecommendation(
            product, 
            investmentAmount, 
            userData.currency
          );
          recommendations.push(recommendationWithAmount);
          remainingAmount -= investmentAmount;
        }
      }
    }
    
    return recommendations;
  }
  
  /**
   * Check if a product is suitable for the user
   */
  private static isProductSuitable(product: DetailedRecommendation, userData: UserData): boolean {
    // Risk compatibility
    const userRisk = userData.riskTolerance;
    const productRisk = product.riskLevel;
    
    if (userRisk === 'low' && productRisk === 'عالي') return false;
    if (userRisk === 'medium' && productRisk === 'عالي') return Math.random() > 0.7; // Sometimes include
    
    return true;
  }
  
  /**
   * Calculate product score for ranking
   */
  private static calculateProductScore(product: DetailedRecommendation, userData: UserData): number {
    let score = 0;
    
    // Recommendation strength
    if (product.recommendation === 'شراء قوي') score += 5;
    else if (product.recommendation === 'شراء') score += 3;
    else if (product.recommendation === 'شراء متوسط') score += 2;
    
    // Risk compatibility
    const userRisk = userData.riskTolerance;
    const productRisk = product.riskLevel;
    
    if (userRisk === 'low' && productRisk === 'منخفض') score += 3;
    else if (userRisk === 'medium' && productRisk === 'متوسط') score += 3;
    else if (userRisk === 'high' && productRisk === 'عالي') score += 3;
    
    // Expected return
    const returnValue = parseFloat(product.expectedReturn.match(/(\d+\.?\d*)/)?.[1] || '0');
    score += returnValue / 10;
    
    return score;
  }
  
  /**
   * Create specific recommendation with calculated amounts
   */
  private static createSpecificRecommendation(
    product: DetailedRecommendation,
    amount: number,
    currency: string
  ): DetailedRecommendation {
    const convertedAmount = this.convertFromSAR(amount, currency);
    const specificRecommendation = { ...product };
    
    // Calculate specific quantities based on product type
    if (product.category === 'stocks') {
      const pricePerShare = this.extractNumericValue(product.price || product.currentPrice || '0');
      if (pricePerShare > 0) {
        const shares = Math.floor(amount / pricePerShare);
        const exactAmount = shares * pricePerShare;
        specificRecommendation.description = `شراء ${shares} سهم بسعر ${pricePerShare} ${this.getCurrencySymbol(currency)} للسهم الواحد. إجمالي الاستثمار: ${exactAmount.toLocaleString()} ${this.getCurrencySymbol(currency)}`;
      }
    } else if (product.category === 'gold') {
      const pricePerGram = this.extractNumericValue(product.price);
      if (pricePerGram > 0) {
        const grams = Math.floor(amount / pricePerGram);
        const exactAmount = grams * pricePerGram;
        specificRecommendation.description = `شراء ${grams} جرام ذهب بسعر ${pricePerGram} ${this.getCurrencySymbol(currency)} للجرام. إجمالي الاستثمار: ${exactAmount.toLocaleString()} ${this.getCurrencySymbol(currency)}`;
      }
    } else if (product.category === 'real-estate') {
      const downPaymentPercentage = this.extractPercentage(product.paymentPlan || '15%');
      const totalPrice = this.extractNumericValue(product.price);
      const requiredDownPayment = (totalPrice * downPaymentPercentage) / 100;
      
      if (amount >= requiredDownPayment) {
        specificRecommendation.description = `دفعة أولى قدرها ${amount.toLocaleString()} ${this.getCurrencySymbol(currency)} (${downPaymentPercentage}% من ${totalPrice.toLocaleString()} ${this.getCurrencySymbol(currency)}) مع خطة التقسيط ${product.paymentPlan}`;
      } else {
        specificRecommendation.description = `استثمار جزئي بمبلغ ${amount.toLocaleString()} ${this.getCurrencySymbol(currency)} في ${product.title} (يمكن زيادة المبلغ لاحقاً لإكمال الدفعة الأولى)`;
      }
    } else {
      // For bonds, savings, crypto, etc.
      specificRecommendation.description = `استثمار ${amount.toLocaleString()} ${this.getCurrencySymbol(currency)} في ${product.title}`;
    }
    
    return specificRecommendation;
  }
  
  /**
   * Calculate final allocation amounts
   */
  private static calculateFinalAllocation(recommendations: DetailedRecommendation[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    
    recommendations.forEach(rec => {
      const amount = this.extractNumericValue(rec.description);
      if (!allocation[rec.category]) allocation[rec.category] = 0;
      allocation[rec.category] += amount;
    });
    
    return allocation;
  }
  
  /**
   * Generate investment summary
   */
  private static generateSummary(
    strategy: InvestmentStrategy,
    recommendations: DetailedRecommendation[],
    userData: UserData
  ): string {
    const totalInvestment = parseInt(userData.investmentBudget);
    const currencySymbol = this.getCurrencySymbol(userData.currency);
    
    let summary = `تم تحليل ملفك الاستثماري وتطوير استراتيجية "${strategy.nameAr}" المناسبة لأهدافك ومستوى تحمل المخاطر.\n\n`;
    summary += `المبلغ الإجمالي: ${totalInvestment.toLocaleString()} ${currencySymbol}\n`;
    summary += `عدد الاستثمارات المقترحة: ${recommendations.length}\n\n`;
    summary += `توزيع الاستثمارات:\n`;
    
    const categoryAmounts: Record<string, number> = {};
    recommendations.forEach(rec => {
      const amount = this.extractNumericValue(rec.description);
      if (!categoryAmounts[rec.category]) categoryAmounts[rec.category] = 0;
      categoryAmounts[rec.category] += amount;
    });
    
    Object.entries(categoryAmounts).forEach(([category, amount]) => {
      const categoryName = this.getCategoryNameAr(category);
      const percentage = ((amount / this.convertToSAR(totalInvestment, userData.currency)) * 100).toFixed(1);
      summary += `• ${categoryName}: ${amount.toLocaleString()} ريال (${percentage}%)\n`;
    });
    
    return summary;
  }
  
  /**
   * Calculate expected return
   */
  private static calculateExpectedReturn(recommendations: DetailedRecommendation[]): string {
    let totalAmount = 0;
    let weightedReturn = 0;
    
    recommendations.forEach(rec => {
      const amount = this.extractNumericValue(rec.description);
      const returnRate = parseFloat(rec.expectedReturn.match(/(\d+\.?\d*)/)?.[1] || '0');
      
      totalAmount += amount;
      weightedReturn += amount * returnRate;
    });
    
    const averageReturn = totalAmount > 0 ? (weightedReturn / totalAmount).toFixed(1) : '0';
    return `${averageReturn}% سنوياً (متوسط مرجح)`;
  }
  
  /**
   * Utility functions
   */
  private static convertToSAR(amount: number, currency: string): number {
    return amount * (currencyRates[currency as keyof typeof currencyRates] || 1);
  }
  
  private static convertFromSAR(amount: number, currency: string): number {
    return amount / (currencyRates[currency as keyof typeof currencyRates] || 1);
  }
  
  private static extractNumericValue(text: string): number {
    const match = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  }
  
  private static extractPercentage(text: string): number {
    const match = text.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 15; // Default 15%
  }
  
  private static getCurrencySymbol(currency: string): string {
    const symbols = {
      SAR: 'ريال',
      AED: 'درهم',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return symbols[currency as keyof typeof symbols] || currency;
  }
  
  private static getCategoryNameAr(category: string): string {
    const names = {
      'real-estate': 'العقارات',
      'stocks': 'الأسهم',
      'gold': 'الذهب',
      'bonds': 'السندات',
      'savings': 'الادخار',
      'crypto': 'العملات الرقمية'
    };
    return names[category as keyof typeof names] || category;
  }
}