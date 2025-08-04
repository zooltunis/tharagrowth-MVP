import { DataProcessor } from './data-processor';
import { type UserData, type DetailedRecommendation } from '@shared/schema';

interface InvestmentStrategy {
  name: string;
  nameAr: string;
  riskProfile: string;
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

export class DynamicRecommendationEngine {
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
      console.log('🚀 Generating dynamic recommendations for user data:', {
        age: userData.age,
        income: userData.income,
        budget: userData.investmentBudget,
        risk: userData.riskTolerance,
        goals: userData.goals,
        preferences: userData.preferences
      });
      
      // Step 1: Select optimal strategy based on comprehensive user profile
      const strategy = this.selectOptimalStrategy(userData);
      console.log('📊 Selected strategy:', strategy.nameAr, '(', strategy.name, ')');
      
      // Step 2: Adjust allocation based on user preferences and profile
      const adjustedAllocation = this.adjustAllocationByUserProfile(strategy.allocation, userData);
      console.log('🎯 Adjusted allocation:', adjustedAllocation);
      
      // Step 3: Parse investment amount
      const investmentAmount = parseFloat(userData.investmentBudget);
      console.log('💰 Investment amount:', investmentAmount);
      
      // Step 4: Generate detailed recommendations using real data
      const detailedRecommendations = await this.generateDetailedRecommendations(
        investmentAmount, 
        adjustedAllocation, 
        userData
      );
      
      console.log('✅ Generated detailed recommendations:', detailedRecommendations.length);
      
      // Step 5: Calculate totals and analysis
      const totalAllocated = detailedRecommendations.reduce((sum, rec) => sum + parseFloat(rec.price || '0'), 0);
      const remainingAmount = Math.max(0, investmentAmount - totalAllocated);
      
      console.log('📈 Total allocated:', totalAllocated, 'Remaining:', remainingAmount);
      
      const analysis = this.generateAnalysis(strategy, userData, totalAllocated);
      
      return {
        id: `analysis-${userData.age}-${userData.riskTolerance}-${Date.now()}`,
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
      console.error('❌ Error generating recommendations:', error);
      throw new Error('فشل في توليد التوصيات الاستثمارية');
    }
  }
  
  private selectOptimalStrategy(userData: UserData): InvestmentStrategy {
    const { age, riskTolerance, goals, income, investmentBudget } = userData;
    const investmentAmount = parseFloat(investmentBudget);
    
    // Calculate risk factors
    const ageFactor = this.calculateAgeFactor(age);
    const riskFactor = this.calculateRiskFactor(riskTolerance);
    const incomeFactor = this.calculateIncomeFactor(income);
    const amountFactor = this.calculateAmountFactor(investmentAmount);
    const goalsFactor = this.calculateGoalsFactor(goals);
    
    console.log('🧮 Factors:', { ageFactor, riskFactor, incomeFactor, amountFactor, goalsFactor });
    
    // Select strategy based on goals first, then combined factors
    if (goals.includes('retirement')) {
      return investmentStrategies.retirement;
    } else if (goals.includes('income')) {
      return investmentStrategies.income;
    } else {
      const riskScore = (ageFactor * 0.3 + riskFactor * 0.4 + goalsFactor * 0.3);
      const capacityScore = (incomeFactor * 0.6 + amountFactor * 0.4);
      
      if (goals.includes('emergency') || riskScore < 0.3 || capacityScore < 0.3) {
        return investmentStrategies.conservative;
      } else if (riskScore < 0.6 || capacityScore < 0.6) {
        return investmentStrategies.balanced;
      } else {
        return investmentStrategies.aggressive;
      }
    }
  }
  
  private calculateAgeFactor(age: string): number {
    switch (age) {
      case '18-25': return 0.8;
      case '26-35': return 0.6;
      case '36-45': return 0.4;
      case '46-55': return 0.2;
      default: return 0.1;
    }
  }
  
  private calculateRiskFactor(riskTolerance: string): number {
    switch (riskTolerance) {
      case 'high': return 1.0;
      case 'medium': return 0.5;
      default: return 0.1;
    }
  }
  
  private calculateIncomeFactor(income: string): number {
    switch (income) {
      case '50000+': return 1.0;
      case '30000-50000': return 0.8;
      case '15000-30000': return 0.6;
      case '5000-15000': return 0.4;
      default: return 0.2;
    }
  }
  
  private calculateAmountFactor(amount: number): number {
    if (amount >= 100000) return 1.0;
    if (amount >= 50000) return 0.8;
    if (amount >= 20000) return 0.6;
    if (amount >= 10000) return 0.4;
    return 0.2;
  }
  
  private calculateGoalsFactor(goals: string[]): number {
    if (goals.includes('investment')) return 0.8;
    if (goals.includes('income')) return 0.6;
    if (goals.includes('retirement')) return 0.2;
    if (goals.includes('emergency')) return 0.1;
    return 0.5;
  }
  
  private adjustAllocationByUserProfile(
    baseAllocation: InvestmentStrategy['allocation'], 
    userData: UserData
  ): InvestmentStrategy['allocation'] {
    const adjusted = { ...baseAllocation };
    const { preferences, age, riskTolerance, income } = userData;
    
    // Map preferences to allocation categories
    const preferenceMapping: { [key: string]: string[] } = {
      'real-estate': ['real-estate', 'realestate', 'property'],
      'stocks': ['stocks', 'shares', 'equity'],
      'gold': ['gold', 'precious-metals'],
      'bonds': ['bonds', 'sukuk', 'fixed-income'],
      'savings': ['savings', 'deposits'],
      'crypto': ['crypto', 'cryptocurrency', 'crowdfunding']
    };
    
    // Find preferred categories
    const preferredCategories: string[] = [];
    Object.entries(preferenceMapping).forEach(([category, categoryPrefs]) => {
      if (categoryPrefs.some(pref => preferences.includes(pref))) {
        preferredCategories.push(category);
      }
    });
    
    // Boost preferred categories
    if (preferredCategories.length > 0) {
      const boostAmount = 25; // 25% extra allocation
      const boostPerCategory = boostAmount / preferredCategories.length;
      
      preferredCategories.forEach(category => {
        adjusted[category] = Math.min(45, adjusted[category] + boostPerCategory);
      });
      
      // Reduce non-preferred categories proportionally
      const nonPreferredCategories = Object.keys(adjusted).filter(cat => !preferredCategories.includes(cat));
      const reductionPerCategory = boostAmount / nonPreferredCategories.length;
      
      nonPreferredCategories.forEach(category => {
        adjusted[category] = Math.max(0, adjusted[category] - reductionPerCategory);
      });
    }
    
    // Age-based adjustments
    if (age === '18-25') {
      // Young investors: more stocks and crypto
      adjusted.stocks = Math.min(50, adjusted.stocks + 5);
      adjusted.crypto = Math.min(20, adjusted.crypto + 5);
      adjusted.bonds = Math.max(0, adjusted.bonds - 5);
      adjusted.savings = Math.max(0, adjusted.savings - 5);
    } else if (age === '55+') {
      // Older investors: more bonds and savings
      adjusted.bonds = Math.min(40, adjusted.bonds + 10);
      adjusted.savings = Math.min(25, adjusted.savings + 5);
      adjusted.stocks = Math.max(5, adjusted.stocks - 10);
      adjusted.crypto = 0;
    }
    
    // Income-based adjustments
    if (income === '0-5000') {
      // Low income: prioritize savings and low-risk investments
      adjusted.savings = Math.min(30, adjusted.savings + 10);
      adjusted.gold = Math.min(35, adjusted.gold + 5);
      adjusted.crypto = Math.max(0, adjusted.crypto - 10);
      adjusted.stocks = Math.max(5, adjusted.stocks - 5);
    }
    
    return adjusted;
  }
  
  private async generateDetailedRecommendations(
    investmentAmount: number, 
    allocation: InvestmentStrategy['allocation'], 
    userData: UserData
  ): Promise<DetailedRecommendation[]> {
    const recommendations: DetailedRecommendation[] = [];
    
    for (const [category, percentage] of Object.entries(allocation)) {
      if (percentage > 0) {
        const categoryAmount = (investmentAmount * percentage) / 100;
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
    
    return recommendations;
  }
  
  private async generateStockRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const stocksData = await this.dataProcessor.getStocksData();
      const recommendations: DetailedRecommendation[] = [];
      let remainingAmount = amount;
      
      const suitableStocks = stocksData
        .filter((stock: any) => stock.price <= remainingAmount)
        .sort((a: any, b: any) => {
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
            description: `${shares} سهم في ${stock.name} (${stock.symbol}) - قطاع ${stock.sector}`,
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
    
    // Preferences
    if (userData.preferences.includes('stocks')) score += 2;
    
    // Age-based preferences
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
      
      const suitableProperties = realEstateData
        .filter((property: any) => property.price <= remainingAmount * 1.1)
        .sort((a: any, b: any) => {
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
          description: `استثمار في ${property.name} - ${property.location}`,
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
    
    if (userData.riskTolerance === 'high' && property.expectedReturn > 15) score += 3;
    if (userData.riskTolerance === 'medium' && property.expectedReturn >= 10 && property.expectedReturn <= 15) score += 3;
    if (userData.riskTolerance === 'low' && property.expectedReturn <= 12) score += 3;
    
    if (userData.preferences.includes('real-estate')) score += 2;
    
    if (userData.income === '50000+' && property.price > 100000) score += 1;
    if (userData.income === '15000-30000' && property.price <= 50000) score += 1;
    
    return score;
  }
  
  private async generateGoldRecommendations(amount: number, userData: UserData): Promise<DetailedRecommendation[]> {
    try {
      const goldData = await this.dataProcessor.getGoldData();
      const recommendations: DetailedRecommendation[] = [];
      
      if (goldData.length === 0) return recommendations;
      
      const currentGoldPrice = goldData[0]?.price || 180;
      const grams = Math.floor(amount / currentGoldPrice);
      
      if (grams > 0) {
        const totalCost = grams * currentGoldPrice;
        
        recommendations.push({
          id: `gold-investment-${userData.age}-${userData.riskTolerance}-${Date.now()}`,
          type: 'gold',
          category: 'gold',
          title: `${grams} جرام ذهب`,
          description: `استثمار في ${grams} جرام من الذهب الخالص عيار 24`,
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
      
      const allBonds = [...bondsData];
      
      try {
        const sukukData = await this.dataProcessor.getSukukData();
        allBonds.push(...sukukData);
      } catch (error) {
        console.log('Could not load sukuk data, using bonds only');
      }
      
      const suitableBonds = allBonds
        .filter((bond: any) => bond.minInvestment <= amount)
        .sort((a: any, b: any) => {
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
            description: `${units} وحدة من ${bond.name}${bond.shariahCompliant ? ' (صك إسلامي)' : ''}`,
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
    
    if (amount >= 1000) {
      const expectedReturn = userData.riskTolerance === 'low' ? '3-4' : '4-5';
      
      recommendations.push({
        id: `savings-deposit-${userData.income}-${Date.now()}`,
        type: 'savings',
        category: 'savings',
        title: 'وديعة ادخارية',
        description: `وديعة ادخارية بعائد ثابت ${expectedReturn}% سنوياً`,
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
      
      const suitableProjects = crowdfundingData
        .filter((project: any) => project.minInvestment <= amount)
        .sort((a: any, b: any) => {
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
            category: 'crypto',
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
• توصيات مخصصة لملفك الشخصي (العمر: ${userData.age}، الدخل: ${userData.income})
• توازن مدروس بين العائد والمخاطر

📈 **التوقعات:**
العائد المتوقع السنوي: 8-12% حسب تقلبات السوق
أفق الاستثمار الموصى به: 3-5 سنوات للحصول على أفضل النتائج

⚠️ **تنبيهات مهمة:**
• هذه توصيات تعليمية وليست استشارة مالية
• يُنصح بمراجعة المحفظة كل 6 أشهر
• تأكد من فهم المخاطر قبل الاستثمار`;
  }
  
  private translateGoal(goal: string): string {
    const translations: { [key: string]: string } = {
      'investment': 'نمو رأس المال',
      'retirement': 'التقاعد',
      'emergency': 'صندوق الطوارئ',
      'income': 'توليد الدخل',
      'education': 'التعليم',
      'travel': 'السفر',
      'business': 'بدء مشروع تجاري'
    };
    return translations[goal] || goal;
  }
}