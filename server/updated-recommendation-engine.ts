import { UserData, DetailedRecommendation } from '@shared/schema';
import { DataProcessor } from './data-processor';
import fs from 'fs';
import path from 'path';

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
    description: 'توازن مدروس بين النمو والأمان لتحقيق عوائد جيدة مع مخاطر محسوبة'
  },
  aggressive: {
    name: 'Aggressive',
    nameAr: 'جريء',
    riskProfile: 'عالي',
    allocation: {
      'real-estate': 20,
      'stocks': 40,
      'gold': 10,
      'bonds': 10,
      'savings': 5,
      'crypto': 15
    },
    description: 'استراتيجية نمو قوية تهدف لتحقيق أقصى عوائد مع قبول مخاطر أعلى'
  },
  retirement: {
    name: 'Retirement',
    nameAr: 'تقاعد',
    riskProfile: 'منخفض',
    allocation: {
      'real-estate': 30,
      'stocks': 25,
      'gold': 20,
      'bonds': 20,
      'savings': 5,
      'crypto': 0
    },
    description: 'خطة تقاعد مصممة لضمان دخل مستقر وحماية رأس المال في المستقبل'
  },
  income: {
    name: 'Income',
    nameAr: 'دخل',
    riskProfile: 'متوسط',
    allocation: {
      'real-estate': 35,
      'stocks': 25,
      'gold': 10,
      'bonds': 25,
      'savings': 5,
      'crypto': 0
    },
    description: 'التركيز على توليد دخل منتظم من خلال استثمارات موزعة الأرباح والإيجارات'
  }
};

export class UpdatedRecommendationEngine {
  private dataProcessor: DataProcessor;
  
  constructor() {
    this.dataProcessor = new DataProcessor();
  }
  
  async generateRecommendations(userData: UserData): Promise<{
    id: string;
    userData: any;
    strategy: string;
    riskProfile: string;
    recommendations: DetailedRecommendation[];
    totalAllocated: number;
    remainingAmount: number;
    analysis: string;
    generatedAt: string;
  }> {
    try {
      console.log('Generating recommendations for user data:', userData);
      
      // Step 1: Select optimal strategy
      const strategy = this.selectOptimalStrategy(userData);
      console.log('Selected strategy:', strategy.nameAr);
      
      // Step 2: Adjust allocation based on preferences
      const adjustedAllocation = this.adjustAllocationByPreferences(strategy.allocation, userData.preferences);
      console.log('Adjusted allocation:', adjustedAllocation);
      
      // Step 3: Parse investment amount
      const investmentAmount = parseFloat(userData.investmentBudget);
      console.log('Investment amount:', investmentAmount);
      
      // Step 4: Generate detailed recommendations using real data
      const detailedRecommendations = await this.generateDetailedRecommendations(
        investmentAmount, 
        adjustedAllocation, 
        userData
      );
      
      console.log('Generated detailed recommendations:', detailedRecommendations.length);
      console.log('First recommendation sample:', detailedRecommendations[0]);
      
      // Step 5: Calculate totals and analysis
      const totalAllocated = detailedRecommendations.reduce((sum, rec) => sum + parseFloat(rec.price || '0'), 0);
      const remainingAmount = Math.max(0, investmentAmount - totalAllocated);
      
      console.log('Total allocated:', totalAllocated);
      console.log('Remaining amount:', remainingAmount);
      
      const analysis = this.generateAnalysis(strategy, userData, totalAllocated);
      
      return {
        id: Date.now().toString(),
        userData,
        strategy: strategy.nameAr,
        riskProfile: strategy.riskProfile,
        recommendations: detailedRecommendations,
        totalAllocated,
        remainingAmount,
        analysis,
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('فشل في توليد التوصيات الاستثمارية');
    }
  }
  
  private selectOptimalStrategy(userData: UserData): InvestmentStrategy {
    const age = userData.age;
    const riskTolerance = userData.riskTolerance;
    const goals = userData.goals;
    const income = userData.income;
    const investmentAmount = parseFloat(userData.investmentBudget);
    
    console.log('Selecting strategy based on:', { age, riskTolerance, goals, income, investmentAmount });
    
    // Age-based risk factor
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
    
    // Income-based investment capacity
    let incomeFactor = 0.5;
    if (income === '50000+') incomeFactor = 1;
    else if (income === '30000-50000') incomeFactor = 0.8;
    else if (income === '15000-30000') incomeFactor = 0.6;
    else if (income === '5000-15000') incomeFactor = 0.4;
    else incomeFactor = 0.2;
    
    // Investment amount factor
    let amountFactor = 0.5;
    if (investmentAmount >= 100000) amountFactor = 1;
    else if (investmentAmount >= 50000) amountFactor = 0.8;
    else if (investmentAmount >= 20000) amountFactor = 0.6;
    else if (investmentAmount >= 10000) amountFactor = 0.4;
    else amountFactor = 0.2;
    
    // Goals factor - affects strategy selection
    let goalsFactor = 0.5;
    if (goals.includes('retirement')) goalsFactor = 0.2;
    if (goals.includes('emergency')) goalsFactor = 0.1;
    if (goals.includes('investment')) goalsFactor = 0.8;
    if (goals.includes('income')) goalsFactor = 0.6;
    
    // Calculate combined risk score
    const riskScore = (ageFactor * 0.3 + riskFactor * 0.4 + goalsFactor * 0.3);
    const capacityScore = (incomeFactor * 0.6 + amountFactor * 0.4);
    
    console.log('Strategy selection factors:', { ageFactor, riskFactor, goalsFactor, incomeFactor, amountFactor, riskScore, capacityScore });
    
    // Select strategy based on goals first, then risk and capacity
    if (goals.includes('retirement')) {
      console.log('Selected retirement strategy based on goals');
      return investmentStrategies.retirement;
    } else if (goals.includes('income')) {
      console.log('Selected income strategy based on goals');
      return investmentStrategies.income;
    } else if (goals.includes('emergency') || riskScore < 0.3 || capacityScore < 0.3) {
      console.log('Selected conservative strategy based on low risk/capacity');
      return investmentStrategies.conservative;
    } else if (riskScore < 0.6 || capacityScore < 0.6) {
      console.log('Selected balanced strategy based on medium risk/capacity');
      return investmentStrategies.balanced;
    } else {
      console.log('Selected aggressive strategy based on high risk/capacity');
      return investmentStrategies.aggressive;
    }

  }
  
  private adjustAllocationByPreferences(
    baseAllocation: InvestmentStrategy['allocation'], 
    preferences: string[]
  ): InvestmentStrategy['allocation'] {
    const adjusted = { ...baseAllocation };
    
    // Create preference mapping for flexible matching
    const preferenceMapping: { [key: string]: string[] } = {
      'real-estate': ['real-estate', 'realestate', 'property'],
      'stocks': ['stocks', 'shares', 'equity'],
      'gold': ['gold', 'precious-metals'],
      'bonds': ['bonds', 'sukuk', 'fixed-income'],
      'savings': ['savings', 'deposits'],
      'crypto': ['crypto', 'cryptocurrency', 'crowdfunding'] // Map crowdfunding to crypto allocation
    };
    
    // Increase allocation for preferred categories and decrease for non-preferred ones
    console.log('User preferences:', preferences);
    
    // First, identify which categories the user prefers
    const preferredCategories: string[] = [];
    Object.entries(preferenceMapping).forEach(([category, categoryPrefs]) => {
      if (categoryPrefs.some(pref => preferences.includes(pref))) {
        preferredCategories.push(category);
      }
    });
    
    console.log('Preferred categories:', preferredCategories);
    
    // If user has specific preferences, boost those categories
    if (preferredCategories.length > 0) {
      const totalBoost = 30; // 30% extra allocation to distribute
      const boostPerCategory = totalBoost / preferredCategories.length;
      
      // Redistribute allocation
      Object.keys(adjusted).forEach(category => {
        if (preferredCategories.includes(category)) {
          adjusted[category] = Math.min(50, adjusted[category] + boostPerCategory); // Cap at 50%
        } else {
          // Reduce non-preferred categories
          adjusted[category] = Math.max(0, adjusted[category] - (boostPerCategory / (Object.keys(adjusted).length - preferredCategories.length)));
        }
      });
    }
    
    console.log('Adjusted allocation:', adjusted);
    return adjusted;
  }
  
  private async generateDetailedRecommendations(
    investmentAmount: number, 
    allocation: InvestmentStrategy['allocation'], 
    userData: UserData
  ): Promise<DetailedRecommendation[]> {
    const recommendations: DetailedRecommendation[] = [];
    
    console.log('Generating detailed recommendations with allocation:', allocation);
    console.log('Investment amount:', investmentAmount);
    
    // Generate recommendations for each category based on allocation percentage
    for (const [category, percentage] of Object.entries(allocation)) {
      if (percentage > 0) {
        const categoryAmount = (investmentAmount * percentage) / 100;
        console.log(`Generating ${category} recommendations for amount: ${categoryAmount}`);
        
        let categoryRecommendations: DetailedRecommendation[] = [];
        
        switch (category) {
          case 'stocks':
            categoryRecommendations = await this.generateStockRecommendations(categoryAmount, userData);
            break;
          case 'real-estate':
            categoryRecommendations = await this.generateRealEstateRecommendations(categoryAmount, userData);
            break;
          case 'gold':
            categoryRecommendations = await this.generateGoldRecommendations(categoryAmount, userData);
            break;
          case 'bonds':
            categoryRecommendations = await this.generateBondRecommendations(categoryAmount, userData);
            break;
          case 'savings':
            categoryRecommendations = await this.generateSavingsRecommendations(categoryAmount, userData);
            break;
          case 'crypto':
            categoryRecommendations = await this.generateCrowdfundingRecommendations(categoryAmount, userData);
            break;
        }
        
        recommendations.push(...categoryRecommendations);
      }
    }
    
    console.log('Total recommendations generated:', recommendations.length);
    return recommendations;
  }
  
  private async generateStockRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const stocksData = await this.dataProcessor.getStocksData();
      const recommendations: DetailedRecommendation[] = [];
      let remainingAmount = amount;
      
      // Filter stocks based on user profile
      const suitableStocks = stocksData
        .filter((stock: any) => stock.price <= remainingAmount)
        .sort((a: any, b: any) => {
          // Prioritize based on user's risk tolerance and dividend yield
          const scoreA = this.calculateStockScore(a, userData);
          const scoreB = this.calculateStockScore(b, userData);
          return scoreB - scoreA;
        });
      
      const maxStocks = Math.min(3, suitableStocks.length);
      
      for (let i = 0; i < maxStocks && remainingAmount > 0; i++) {
        const stock = suitableStocks[i];
        const allocation = remainingAmount / (maxStocks - i);
        const shares = Math.floor(allocation / stock.price);
        
        if (shares > 0) {
          const investmentAmount = shares * stock.price;
          remainingAmount -= investmentAmount;
          
          recommendations.push({
            id: `stock-${stock.symbol}-${userData.age}-${userData.riskTolerance}-${Date.now()}`,
            type: 'stocks',
            category: 'stocks',
            title: `${shares} سهم ${stock.name}`,
            description: `${shares} سهم في ${stock.name} (${stock.symbol}) - قطاع ${stock.sector} | العائد: ${stock.dividendYield || 8}% | المخاطر: ${this.getRiskLevelByReturn(stock.dividendYield || 8)}`,
            price: investmentAmount.toString(),
            expectedReturn: `${stock.dividendYield || 8}%`,
            paymentPlan: 'دفع فوري',
            riskLevel: this.getRiskLevelByReturn(stock.dividendYield || 8),
            timeline: 'طويل الأمد (3-5 سنوات)',
            recommendation: 'شراء',
            minimumInvestment: stock.price.toString(),
            features: [
              `القطاع: ${stock.sector}`,
              `الرمز: ${stock.symbol}`,
              `العائد السنوي: ${stock.dividendYield || 8}%`,
              `سعر السهم: ${stock.price} ريال`,
              `عدد الأسهم: ${shares}`,
              `إجمالي الاستثمار: ${investmentAmount.toFixed(0)} ريال`
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating stock recommendations:', error);
      return [];
    }
  }
  
  private calculateStockScore(stock: any, userData: UserData): number {
    let score = 0;
    
    // Risk tolerance alignment
    if (userData.riskTolerance === 'high' && stock.dividendYield > 10) score += 3;
    if (userData.riskTolerance === 'medium' && stock.dividendYield >= 6 && stock.dividendYield <= 12) score += 3;
    if (userData.riskTolerance === 'low' && stock.dividendYield <= 8) score += 3;
    
    // Sector preference (if any)
    if (userData.preferences.includes('stocks')) score += 2;
    
    // Age-based preference
    const age = userData.age;
    if (age === '18-25' && stock.sector === 'Technology') score += 2;
    if (age === '26-35' && (stock.sector === 'Finance' || stock.sector === 'Healthcare')) score += 2;
    if ((age === '36-45' || age === '46-55') && (stock.sector === 'Utilities' || stock.sector === 'Consumer Goods')) score += 2;
    
    return score;
  }
  
  private async generateRealEstateRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const realEstateData = await this.dataProcessor.getRealEstateData();
      const recommendations: DetailedRecommendation[] = [];
      let remainingAmount = amount;
      
      // Filter suitable properties
      const suitableProperties = realEstateData
        .filter((property: any) => property.price <= remainingAmount * 1.1) // Allow 10% flexibility
        .sort((a: any, b: any) => {
          // Prioritize based on expected return and user profile
          const scoreA = this.calculateRealEstateScore(a, userData);
          const scoreB = this.calculateRealEstateScore(b, userData);
          return scoreB - scoreA;
        });
      
      const maxProperties = Math.min(2, suitableProperties.length);
      
      for (let i = 0; i < maxProperties && remainingAmount > 0; i++) {
        const property = suitableProperties[i];
        const investmentAmount = Math.min(remainingAmount, property.price);
        remainingAmount -= investmentAmount;
        
        recommendations.push({
          id: `realestate-${property.name.replace(/\s+/g, '-')}-${userData.age}-${Date.now()}`,
          type: 'real-estate',
          category: 'real-estate',
          title: property.name,
          description: `استثمار في ${property.name} - ${property.location} | العائد: ${property.expectedReturn || 12}% سنوياً | ${property.type}`,
          price: investmentAmount.toString(),
          expectedReturn: `${property.expectedReturn || 12}%`,
          paymentPlan: property.paymentPlan || 'دفع فوري',
          riskLevel: this.getRiskLevelByReturn(property.expectedReturn || 12),
          timeline: 'طويل الأمد (5-10 سنوات)',
          recommendation: 'شراء',
          minimumInvestment: property.price.toString(),
          features: [
            `الموقع: ${property.location}`,
            `النوع: ${property.type}`,
            `المساحة: ${property.area} متر مربع`,
            `العائد المتوقع: ${property.expectedReturn || 12}% سنوياً`,
            `خطة الدفع: ${property.paymentPlan || 'دفع فوري'}`,
            `تاريخ التسليم: ${property.deliveryDate || 'فوري'}`
          ]
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating real estate recommendations:', error);
      return [];
    }
  }
  
  private calculateRealEstateScore(property: any, userData: UserData): number {
    let score = 0;
    
    // Risk tolerance alignment
    if (userData.riskTolerance === 'high' && property.expectedReturn > 15) score += 3;
    if (userData.riskTolerance === 'medium' && property.expectedReturn >= 10 && property.expectedReturn <= 15) score += 3;
    if (userData.riskTolerance === 'low' && property.expectedReturn <= 12) score += 3;
    
    // Preference for real estate
    if (userData.preferences.includes('real-estate')) score += 2;
    
    // Income-based affordability
    if (userData.income === '50000+' && property.price > 100000) score += 1;
    if (userData.income === '15000-30000' && property.price <= 50000) score += 1;
    
    return score;
  }
  
  private async generateGoldRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const goldData = await this.dataProcessor.getGoldData();
      const recommendations: DetailedRecommendation[] = [];
      
      if (goldData.length === 0) return recommendations;
      
      const currentGoldPrice = goldData[0]?.price || 180; // Fallback price per gram
      const grams = Math.floor(amount / currentGoldPrice);
      
      if (grams > 0) {
        const totalCost = grams * currentGoldPrice;
        
        recommendations.push({
          id: `gold-investment-${userData.age}-${userData.riskTolerance}-${Date.now()}`,
          type: 'gold',
          category: 'gold',
          title: `${grams} جرام ذهب`,
          description: `استثمار في ${grams} جرام من الذهب الخالص عيار 24 | حماية من التضخم | استثمار آمن طويل الأمد`,
          price: totalCost.toString(),
          expectedReturn: '6-8%',
          paymentPlan: 'دفع فوري',
          riskLevel: 'منخفض' as 'منخفض' | 'متوسط' | 'عالي',
          timeline: 'طويل الأمد (3-7 سنوات)',
          recommendation: 'شراء',
          minimumInvestment: currentGoldPrice.toString(),
          features: [
            `الكمية: ${grams} جرام`,
            `العيار: 24 قيراط`,
            `سعر الجرام: ${currentGoldPrice} ريال`,
            `حماية من التضخم`,
            `سيولة عالية`,
            `استثمار آمن ومستقر`
          ]
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating gold recommendations:', error);
      return [];
    }
  }
  
  private async generateBondRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const bondsData = await this.dataProcessor.getBondsData();
      const recommendations: DetailedRecommendation[] = [];
      let remainingAmount = amount;
      
      // Combine regular bonds and sukuk bonds
      const allBonds = [...bondsData];
      
      // Try to get sukuk data as well
      try {
        const sukukData = await this.dataProcessor.getSukukData();
        allBonds.push(...sukukData);
      } catch (error) {
        console.log('Could not load sukuk data, using bonds only');
      }
      
      // Filter suitable bonds
      const suitableBonds = allBonds
        .filter((bond: any) => bond.minInvestment <= amount)
        .sort((a: any, b: any) => {
          // Prefer Islamic sukuk if available, then by rating
          if (a.shariahCompliant && !b.shariahCompliant) return -1;
          if (!a.shariahCompliant && b.shariahCompliant) return 1;
          return b.rating?.localeCompare(a.rating) || 0;
        });
      
      const maxBonds = Math.min(2, suitableBonds.length);
      
      for (let i = 0; i < maxBonds && remainingAmount > 0; i++) {
        const bond = suitableBonds[i];
        const allocation = remainingAmount / (maxBonds - i);
        const faceValue = bond.faceValue || bond.minInvestment || 1000;
        const units = Math.floor(allocation / faceValue);
        
        if (units > 0) {
          const investmentAmount = units * faceValue;
          remainingAmount -= investmentAmount;
          
          recommendations.push({
            id: `bond-${bond.name?.replace(/\s+/g, '-')}-${userData.riskTolerance}-${Date.now()}`,
            type: 'bonds',
            category: 'bonds',
            title: `${units} وحدة ${bond.name}`,
            description: `${units} وحدة من ${bond.name}${bond.shariahCompliant ? ' (صك إسلامي)' : ''} | العائد: ${bond.couponRate || 5}% | التصنيف: ${bond.rating || 'A'}`,
            price: investmentAmount.toString(),
            expectedReturn: `${bond.couponRate || 5}%`,
            paymentPlan: 'دفع فوري',
            riskLevel: this.getRiskLevelByRating(bond.rating),
            timeline: bond.maturity || 'متوسط الأجل (2-5 سنوات)',
            recommendation: 'شراء',
            minimumInvestment: bond.minInvestment?.toString() || bond.faceValue?.toString() || '1000',
            features: [
              `الجهة المصدرة: ${bond.issuer || 'حكومية'}`,
              `التصنيف الائتماني: ${bond.rating || 'A'}`,
              `معدل الكوبون: ${bond.couponRate || 5}%`,
              `تاريخ الاستحقاق: ${bond.maturity || '5 سنوات'}`,
              bond.shariahCompliant ? 'متوافق مع الشريعة الإسلامية' : 'سند تقليدي',
              `القيمة الاسمية: ${faceValue} ريال`,
              `عدد الوحدات: ${units}`
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating bond recommendations:', error);
      return [];
    }
  }
  
  private async generateSavingsRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    const recommendations: DetailedRecommendation[] = [];
    
    // Generate different savings options based on amount and user profile
    if (amount >= 1000) {
      const expectedReturn = userData.riskTolerance === 'low' ? '3-4' : '4-5';
      
      recommendations.push({
        id: `savings-deposit-${userData.income}-${Date.now()}`,
        type: 'savings',
        category: 'savings',
        title: 'وديعة ادخارية',
        description: `وديعة ادخارية بعائد ثابت ${expectedReturn}% سنوياً | مضمونة ومؤمن عليها | سيولة جزئية`,
        price: amount.toString(),
        expectedReturn: `${expectedReturn}%`,
        paymentPlan: 'دفع فوري',
        riskLevel: 'منخفض' as 'منخفض' | 'متوسط' | 'عالي',
        timeline: 'قصير إلى متوسط الأجل (6 أشهر - 2 سنة)',
        recommendation: 'شراء',
        minimumInvestment: '1000',
        features: [
          `عائد ثابت ${expectedReturn}% سنوياً`,
          'مضمونة من البنك المركزي',
          'إمكانية السحب الجزئي',
          'لا توجد رسوم إدارية',
          'مناسبة للطوارئ',
          'استثمار آمن بنسبة 100%'
        ]
      });
    }
    
    return recommendations;
  }
  
  private async generateCrowdfundingRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const crowdfundingData = await this.dataProcessor.getCrowdfundingData();
      const recommendations: DetailedRecommendation[] = [];
      let remainingAmount = amount;
      
      // Filter suitable projects
      const suitableProjects = crowdfundingData
        .filter((project: any) => project.minInvestment <= amount)
        .sort((a: any, b: any) => {
          // Sort by expected return and funding progress
          const scoreA = (a.expectedReturn || 15) + ((a.raisedAmount / a.targetAmount) * 100);
          const scoreB = (b.expectedReturn || 15) + ((b.raisedAmount / b.targetAmount) * 100);
          return scoreB - scoreA;
        });
      
      const maxProjects = Math.min(2, suitableProjects.length);
      
      for (let i = 0; i < maxProjects && remainingAmount > 0; i++) {
        const project = suitableProjects[i];
        const allocation = remainingAmount / (maxProjects - i);
        const investmentAmount = Math.min(allocation, remainingAmount);
        
        if (investmentAmount >= project.minInvestment) {
          remainingAmount -= investmentAmount;
          
          recommendations.push({
            id: `crowdfunding-${project.name.replace(/\s+/g, '-')}-${userData.age}-${Date.now()}`,
            type: 'crowdfunding',
            category: 'crypto', // Map to crypto category for allocation
            title: project.name,
            description: `استثمار في مشروع ${project.name} - ${project.category} | العائد المتوقع: ${project.expectedReturn || 15}% | منصة: ${project.platform}`,
            price: investmentAmount.toString(),
            expectedReturn: `${project.expectedReturn || 15}%`,
            paymentPlan: project.paymentPlan || 'دفع فوري',
            riskLevel: project.riskLevel === 'low' ? 'منخفض' : project.riskLevel === 'medium' ? 'متوسط' : 'عالي',
            timeline: project.timeline || 'متوسط الأجل (1-3 سنوات)',
            recommendation: 'شراء',
            minimumInvestment: project.minInvestment?.toString() || '5000',
            features: [
              `الفئة: ${project.category}`,
              `البلد: ${project.country}`,
              `المبلغ المستهدف: ${this.formatCurrency(project.targetAmount)}`,
              `نسبة التحصيل: ${((project.raisedAmount / project.targetAmount) * 100).toFixed(1)}%`,
              `المنصة: ${project.platform}`,
              `مدة المشروع: ${project.duration}`,
              `نوع التمويل: ${project.fundingType}`
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating crowdfunding recommendations:', error);
      return [];
    }
  }
      const hasPreference = categoryPrefs.some(pref => preferences.includes(pref));
      
      if (!hasPreference) {
        adjusted[category as keyof typeof adjusted] = 0;
      }
    });
    
    // Redistribute the removed allocations among preferred categories
    const preferredCategories = Object.keys(adjusted).filter(category => {
      const categoryPrefs = preferenceMapping[category] || [category];
      return categoryPrefs.some(pref => preferences.includes(pref));
    });
    
    if (preferredCategories.length > 0) {
      const totalPreferredAllocation = preferredCategories
        .reduce((sum, category) => sum + baseAllocation[category as keyof typeof baseAllocation], 0);
      
      if (totalPreferredAllocation > 0) {
        preferredCategories.forEach(category => {
          const originalWeight = baseAllocation[category as keyof typeof baseAllocation];
          adjusted[category as keyof typeof adjusted] = (originalWeight / totalPreferredAllocation) * 100;
        });
      }
    } else {
      // If no preferences match, use original allocation
      return baseAllocation;
    }
    
    return adjusted;
  }
  
  private async generateDetailedRecommendations(
    totalAmount: number,
    allocation: InvestmentStrategy['allocation'],
    userData: UserData
  ): Promise<DetailedRecommendation[]> {
    const recommendations: DetailedRecommendation[] = [];
    
    for (const [category, percentage] of Object.entries(allocation)) {
      if (percentage > 0) {
        const categoryAmount = (totalAmount * percentage) / 100;
        
        switch (category) {
          case 'stocks':
            recommendations.push(...await this.generateStockRecommendations(categoryAmount, userData));
            break;
          case 'real-estate':
            recommendations.push(...await this.generateRealEstateRecommendations(categoryAmount, userData));
            break;
          case 'gold':
            recommendations.push(...await this.generateGoldRecommendations(categoryAmount, userData));
            break;
          case 'bonds':
            recommendations.push(...await this.generateBondRecommendations(categoryAmount, userData));
            break;
          case 'savings':
            recommendations.push(...this.generateSavingsRecommendations(categoryAmount, userData));
            break;
          case 'crypto':
            if (userData.preferences.includes('crypto')) {
              recommendations.push(...this.generateCryptoRecommendations(categoryAmount, userData));
            } else {
              // If crypto not preferred, add crowdfunding as alternative
              recommendations.push(...await this.generateCrowdfundingRecommendations(categoryAmount, userData));
            }
            break;
        }
      }
    }
    
    return recommendations;
  }
  
  private async generateStockRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const stocksData = await this.dataProcessor.loadData('stocks-data');
      const recommendations: DetailedRecommendation[] = [];
      
      if (stocksData.length === 0) {
        console.warn('No stocks data available');
        return [];
      }
      
      // Sort stocks by sector and dividend yield
      const suitableStocks = stocksData
        .filter((stock: any) => stock.price > 0 && stock.price < amount)
        .sort((a: any, b: any) => (b.dividendYield || 0) - (a.dividendYield || 0));
      
      let remainingAmount = amount;
      let stockCount = 0;
      const maxStocks = Math.min(3, suitableStocks.length);
      
      for (let i = 0; i < maxStocks && remainingAmount > 0; i++) {
        const stock = suitableStocks[i];
        const allocation = remainingAmount / (maxStocks - i);
        const shares = Math.floor(allocation / stock.price);
        
        if (shares > 0) {
          const investmentAmount = shares * stock.price;
          remainingAmount -= investmentAmount;
          stockCount++;
          
          recommendations.push({
            id: `stock-${stock.symbol}-${Date.now()}`,
            type: 'stocks',
            category: 'stocks',
            title: stock.name,
            description: `${shares} سهم في ${stock.name} (${stock.symbol}) - قطاع ${stock.sector}`,
            price: investmentAmount.toString(),
            expectedReturn: `${stock.dividendYield || 8}%`,
            paymentPlan: 'دفع فوري',
            riskLevel: this.getRiskLevelByReturn(stock.dividendYield || 8) as 'منخفض' | 'متوسط' | 'عالي',
            timeline: 'طويل الأمد (3-5 سنوات)',
            recommendation: 'شراء',
            minimumInvestment: stock.price.toString(),
            features: [
              `عائد توزيعات أرباح: ${stock.dividendYield?.toFixed(1) || 'غير محدد'}%`,
              `نسبة السعر للربح: ${stock.peRatio?.toFixed(1) || 'غير محدد'}`,
              `القيمة السوقية: ${this.formatCurrency(stock.marketCap)}`,
              `البورصة: ${stock.exchange || 'تداول'}`
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating stock recommendations:', error);
      return [];
    }
  }
  
  private async generateRealEstateRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      // Load both Saudi and UAE real estate data
      const saudiRealEstate = await this.dataProcessor.loadData('real-estate-projects');
      const uaeRealEstate = await this.dataProcessor.loadData('uae-real-estate');
      const allRealEstate = [...saudiRealEstate, ...uaeRealEstate];
      
      const recommendations: DetailedRecommendation[] = [];
      
      if (allRealEstate.length === 0) {
        console.warn('No real estate data available');
        return [];
      }
      
      // Filter suitable properties based on budget
      const suitableProperties = allRealEstate
        .filter((property: any) => property.minInvestment <= amount)
        .sort((a: any, b: any) => (b.expectedReturn || 0) - (a.expectedReturn || 0));
      
      // Select up to 2 properties for diversification
      const maxProperties = Math.min(2, suitableProperties.length);
      let remainingAmount = amount;
      
      for (let i = 0; i < maxProperties && remainingAmount > 0; i++) {
        const property = suitableProperties[i];
        const allocation = remainingAmount / (maxProperties - i);
        const investmentAmount = Math.min(allocation, property.price || property.minInvestment, remainingAmount);
        
        if (investmentAmount >= property.minInvestment) {
          remainingAmount -= investmentAmount;
          
          recommendations.push({
            id: `property-${property.name.replace(/\s+/g, '-')}-${Date.now()}`,
            type: 'real-estate',
            category: 'real-estate',
            title: property.name,
            description: `استثمار عقاري في ${property.name} - ${property.location}`,
            price: investmentAmount.toString(),
            expectedReturn: `${property.expectedReturn || 10}%`,
            paymentPlan: property.paymentPlan || 'دفعة مقدمة مع أقساط',
            riskLevel: property.riskLevel === 'low' ? 'منخفض' : property.riskLevel === 'medium' ? 'متوسط' : property.riskLevel === 'high' ? 'عالي' : 'متوسط',
            timeline: 'متوسط الأجل (2-3 سنوات)',
            recommendation: 'شراء',
            location: property.location,
            minimumInvestment: (property.minInvestment || investmentAmount).toString(),
            features: [
              `الموقع: ${property.location}`,
              `نوع العقار: ${property.type}`,
              `المطور: ${property.developer}`,
              `المساحة: ${property.area || 'غير محدد'}`,
              `تاريخ التسليم: ${property.readyDate || 'غير محدد'}`,
              property.currency === 'AED' ? 'استثمار في السوق الإماراتي' : 'استثمار في السوق السعودي'
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating real estate recommendations:', error);
      return [];
    }
  }
  
  private async generateGoldRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const goldData = await this.dataProcessor.loadData('gold-prices');
      const recommendations: DetailedRecommendation[] = [];
      
      if (goldData.length === 0) {
        console.warn('No gold data available');
        return [];
      }
      
      // Find the best gold investment option
      const suitableGold = goldData
        .filter((gold: any) => (gold.minPurchase * gold.pricePerGram) <= amount)
        .sort((a: any, b: any) => b.purity.localeCompare(a.purity)); // Prefer higher purity
      
      if (suitableGold.length > 0) {
        const gold = suitableGold[0];
        const maxGrams = Math.floor(amount / gold.pricePerGram);
        const actualGrams = Math.max(gold.minPurchase, Math.min(maxGrams, 100)); // Cap at 100 grams
        const investmentAmount = actualGrams * gold.pricePerGram;
        
        recommendations.push({
          id: `gold-${gold.type}-${Date.now()}`,
          type: 'gold',
          category: 'gold',
          title: `${gold.type} - ${gold.purity}`,
          description: `${actualGrams} جرام من ${gold.type} عيار ${gold.purity}`,
          price: investmentAmount.toString(),
          expectedReturn: '6%',
          paymentPlan: 'دفع فوري',
          riskLevel: 'منخفض',
          timeline: 'طويل الأمد (5+ سنوات)',
          recommendation: 'شراء',
          minimumInvestment: (gold.minPurchase * gold.pricePerGram).toString(),
          features: [
            `النوع: ${gold.type}`,
            `العيار: ${gold.purity}`,
            `المورد: ${gold.supplier}`,
            `الوزن: ${actualGrams} جرام`,
            `الحماية من التضخم`,
            `سيولة عالية`
          ]
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating gold recommendations:', error);
      return [];
    }
  }
  
  private async generateBondRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      // Load both regular bonds and sukuk Islamic bonds
      const regularBonds = await this.dataProcessor.loadData('bonds-sukuk');
      const sukukBonds = await this.dataProcessor.loadData('sukuk-bonds');
      const allBonds = [...regularBonds, ...sukukBonds];
      
      const recommendations: DetailedRecommendation[] = [];
      
      if (allBonds.length === 0) {
        console.warn('No bonds data available');
        return [];
      }
      
      // Filter suitable bonds
      const suitableBonds = allBonds
        .filter((bond: any) => bond.minInvestment <= amount)
        .sort((a: any, b: any) => {
          // Prefer Islamic sukuk if available, then by rating
          if (a.shariahCompliant && !b.shariahCompliant) return -1;
          if (!a.shariahCompliant && b.shariahCompliant) return 1;
          return b.rating?.localeCompare(a.rating) || 0;
        });
      
      // Select up to 2 bonds for diversification
      const maxBonds = Math.min(2, suitableBonds.length);
      let remainingAmount = amount;
      
      for (let i = 0; i < maxBonds && remainingAmount > 0; i++) {
        const bond = suitableBonds[i];
        const allocation = remainingAmount / (maxBonds - i);
        const maxUnits = Math.floor(allocation / bond.faceValue);
        const units = Math.max(1, maxUnits);
        const investmentAmount = units * bond.faceValue;
        
        if (investmentAmount <= remainingAmount && investmentAmount >= bond.minInvestment) {
          remainingAmount -= investmentAmount;
          
          recommendations.push({
            id: `bond-${bond.name.replace(/\s+/g, '-')}-${Date.now()}`,
            type: 'bonds',
            category: 'bonds',
            title: bond.name,
            description: `${units} وحدة من ${bond.name}${bond.shariahCompliant ? ' (صك إسلامي)' : ''}`,
            price: investmentAmount.toString(),
            expectedReturn: `${bond.couponRate || 5}%`,
            paymentPlan: 'دفع فوري',
            riskLevel: this.getRiskLevelByRating(bond.rating) as 'منخفض' | 'متوسط' | 'عالي',
            timeline: bond.maturity || 'متوسط الأجل (2-5 سنوات)',
            recommendation: 'شراء',
            minimumInvestment: bond.minInvestment?.toString() || bond.faceValue?.toString() || '1000',
            features: [
              `نوع السند: ${bond.type}`,
              `معدل الكوبون: ${bond.couponRate}%`,
              `تاريخ الاستحقاق: ${bond.maturity}`,
              `التصنيف الائتماني: ${bond.rating}`,
              `الجهة المصدرة: ${bond.issuer}`,
              bond.shariahCompliant ? 'متوافق مع الشريعة الإسلامية' : 'سند تقليدي',
              `دخل ثابت ومضمون`
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating bond recommendations:', error);
      return [];
    }
  }
  
  private generateSavingsRecommendations(amount: number, userData: UserData): DetailedRecommendation[] {
    const recommendations: DetailedRecommendation[] = [];
    
    // High-yield savings account
    recommendations.push({
      id: `savings-${Date.now()}`,
      type: 'savings',
      category: 'savings',
      title: 'حساب توفير عالي العائد',
      description: `حساب توفير بعائد ${(4.5).toFixed(1)}% سنوياً`,
      price: amount.toString(),
      expectedReturn: '4.5%',
      paymentPlan: 'إيداع فوري',
      riskLevel: 'منخفض',
      timeline: 'مرن',
      recommendation: 'شراء قوي',
      minimumInvestment: '10000',
      features: [
        'عائد مضمون 4.5% سنوياً',
        'مؤمن من قبل مؤسسة النقد',
        'سيولة فورية',
        'لا توجد رسوم إدارية',
        'حساب متوافق مع الشريعة'
      ]
    });
    
    return recommendations;
  }
  
  private generateCryptoRecommendations(amount: number, userData: UserData): DetailedRecommendation[] {
    const recommendations: DetailedRecommendation[] = [];
    
    // Only recommend if user has high risk tolerance
    if (userData.riskTolerance === 'high') {
      recommendations.push({
        id: `crypto-${Date.now()}`,
        type: 'crypto',
        category: 'crypto',
        title: 'محفظة العملات المشفرة المتنوعة',
        description: 'استثمار في محفظة متنوعة من العملات المشفرة الرائدة',
        price: amount.toString(),
        expectedReturn: '20%',
        paymentPlan: 'استثمار تدريجي (DCA)',
        riskLevel: 'عالي',
        timeline: 'طويل الأمد (3-5 سنوات)',
        recommendation: 'شراء متوسط',
        minimumInvestment: '1000',
        features: [
          'تنويع على العملات الرائدة',
          'إمكانية عوائد عالية',
          'تقنية البلوك تشين',
          'سيولة عالية',
          'تحوط ضد التضخم'
        ]
      });
    }
    
    return recommendations;
  }
  
  private async generateCrowdfundingRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const crowdfundingData = await this.dataProcessor.loadData('crowdfunding-projects');
      const recommendations: DetailedRecommendation[] = [];
      
      if (crowdfundingData.length === 0) {
        console.warn('No crowdfunding data available');
        return [];
      }
      
      // Filter suitable projects
      const suitableProjects = crowdfundingData
        .filter((project: any) => project.minInvestment <= amount)
        .sort((a: any, b: any) => (b.expectedReturn || 0) - (a.expectedReturn || 0));
      
      // Select 1-2 projects for diversification
      const maxProjects = Math.min(2, suitableProjects.length);
      let remainingAmount = amount;
      
      for (let i = 0; i < maxProjects && remainingAmount > 0; i++) {
        const project = suitableProjects[i];
        const allocation = remainingAmount / (maxProjects - i);
        const investmentAmount = Math.min(allocation, remainingAmount);
        
        if (investmentAmount >= project.minInvestment) {
          remainingAmount -= investmentAmount;
          
          recommendations.push({
            id: `crowdfunding-${project.name.replace(/\s+/g, '-')}-${Date.now()}`,
            type: 'crowdfunding',
            category: 'crypto', // Map to crypto category for allocation
            title: project.name,
            description: `استثمار في مشروع ${project.name} - ${project.category}`,
            price: investmentAmount.toString(),
            expectedReturn: `${project.expectedReturn || 15}%`,
            paymentPlan: project.paymentPlan || 'دفع فوري',
            riskLevel: project.riskLevel === 'low' ? 'منخفض' : project.riskLevel === 'medium' ? 'متوسط' : 'عالي',
            timeline: project.timeline || 'متوسط الأجل (1-3 سنوات)',
            recommendation: 'شراء',
            minimumInvestment: project.minInvestment?.toString() || '5000',
            features: [
              `الفئة: ${project.category}`,
              `البلد: ${project.country}`,
              `المبلغ المستهدف: ${this.formatCurrency(project.targetAmount)}`,
              `نسبة التحصيل: ${((project.raisedAmount / project.targetAmount) * 100).toFixed(1)}%`,
              `المنصة: ${project.platform}`,
              `مدة المشروع: ${project.duration}`,
              `نوع التمويل: ${project.fundingType}`
            ]
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating crowdfunding recommendations:', error);
      return [];
    }
  }
  
  private getRiskLevelByReturn(returnRate: number): 'منخفض' | 'متوسط' | 'عالي' {
    if (returnRate < 5) return 'منخفض';
    if (returnRate < 12) return 'متوسط';
    return 'عالي';
  }
  
  private getRiskLevelByRating(rating: string): 'منخفض' | 'متوسط' | 'عالي' {
    if (rating?.startsWith('AAA') || rating?.startsWith('AA')) return 'منخفض';
    if (rating?.startsWith('A') || rating?.startsWith('BBB')) return 'متوسط';
    return 'عالي';
  }
  
  private formatCurrency(amount: number): string {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} مليار ريال`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} مليون ريال`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} ألف ريال`;
    }
    return `${amount.toFixed(0)} ريال`;
  }
  
  private generateAnalysis(strategy: InvestmentStrategy, userData: UserData, totalAllocated: number): string {
    return `
تم اختيار الاستراتيجية "${strategy.nameAr}" بناءً على ملفك الاستثماري:

📊 **تحليل المحفظة:**
- مستوى المخاطر: ${strategy.riskProfile}
- إجمالي المبلغ المستثمر: ${this.formatCurrency(totalAllocated)}
- نسبة الاستثمار: ${((totalAllocated / parseFloat(userData.investmentBudget)) * 100).toFixed(1)}%

🎯 **التوافق مع أهدافك:**
${userData.goals.map(goal => `• ${this.translateGoal(goal)}`).join('\n')}

⚡ **نقاط القوة:**
• تنويع ممتاز عبر فئات الأصول المختلفة
• استخدام بيانات حقيقية من السوق السعودي والخليجي
• توصيات مخصصة لملفك الشخصي
• توازن مدروس بين العائد والمخاطر

📈 **التوقعات:**
العائد المتوقع السنوي: 8-12% حسب تقلبات السوق
أفق الاستثمار الموصى به: 3-5 سنوات للحصول على أفضل النتائج

⚠️ **تنبيهات مهمة:**
• هذه توصيات تعليمية وليست استشارة مالية
• يُنصح بمراجعة المحفظة كل 6 أشهر
• تأكد من فهم المخاطر قبل الاستثمار
• احتفظ بصندوق طوارئ منفصل
    `.trim();
  }
  
  private translateGoal(goal: string): string {
    const goalTranslations: { [key: string]: string } = {
      'retirement': 'التقاعد والضمان المالي',
      'investment': 'نمو رأس المال',
      'emergency': 'صندوق الطوارئ',
      'income': 'توليد دخل إضافي',
      'education': 'تعليم الأطفال',
      'house': 'شراء منزل',
      'business': 'بدء مشروع تجاري'
    };
    
    return goalTranslations[goal] || goal;
  }
}