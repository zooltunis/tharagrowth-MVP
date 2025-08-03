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
  
  async generateRecommendations(userData: UserData): Promise<DetailedRecommendation> {
    try {
      console.log('Generating recommendations for user data:', userData);
      
      // Step 1: Select optimal strategy
      const strategy = this.selectOptimalStrategy(userData);
      console.log('Selected strategy:', strategy.nameAr);
      
      // Step 2: Adjust allocation based on preferences
      const adjustedAllocation = this.adjustAllocationByPreferences(strategy.allocation, userData.preferences);
      console.log('Adjusted allocation:', adjustedAllocation);
      
      // Step 3: Generate detailed recommendations using real data
      const detailedRecommendations = await this.generateDetailedRecommendations(
        userData.amount, 
        adjustedAllocation, 
        userData
      );
      
      // Step 4: Calculate totals and analysis
      const totalAllocated = detailedRecommendations.reduce((sum, rec) => sum + rec.amount, 0);
      const remainingAmount = userData.amount - totalAllocated;
      
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
    } else if (goals.includes('income')) {
      return investmentStrategies.income;
    } else if (goals.includes('emergency') || riskScore < 0.3) {
      return investmentStrategies.conservative;
    } else if (riskScore < 0.6) {
      return investmentStrategies.balanced;
    } else {
      return investmentStrategies.aggressive;
    }
  }
  
  private adjustAllocationByPreferences(
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
            type: 'stocks',
            name: stock.name,
            amount: investmentAmount,
            quantity: shares,
            unitPrice: stock.price,
            currency: stock.currency || 'SAR',
            expectedReturn: stock.dividendYield || 8,
            riskLevel: this.getRiskLevelByReturn(stock.dividendYield || 8),
            description: `${shares} سهم في ${stock.name} (${stock.symbol}) - قطاع ${stock.sector}`,
            details: {
              symbol: stock.symbol,
              sector: stock.sector,
              exchange: stock.exchange,
              peRatio: stock.peRatio,
              marketCap: stock.marketCap,
              dividendYield: stock.dividendYield
            },
            paymentPlan: 'دفع فوري',
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
      const realEstateData = await this.dataProcessor.loadData('real-estate-projects');
      const recommendations: DetailedRecommendation[] = [];
      
      if (realEstateData.length === 0) {
        console.warn('No real estate data available');
        return [];
      }
      
      // Filter suitable properties based on budget
      const suitableProperties = realEstateData
        .filter((property: any) => property.minInvestment <= amount)
        .sort((a: any, b: any) => (b.expectedReturn || 0) - (a.expectedReturn || 0));
      
      if (suitableProperties.length > 0) {
        const property = suitableProperties[0];
        const investmentAmount = Math.min(amount, property.price || property.minInvestment);
        
        recommendations.push({
          type: 'real-estate',
          name: property.name,
          amount: investmentAmount,
          quantity: 1,
          unitPrice: investmentAmount,
          currency: property.currency || 'SAR',
          expectedReturn: property.expectedReturn || 10,
          riskLevel: property.riskLevel || 'متوسط',
          description: `استثمار عقاري في ${property.name} - ${property.location}`,
          details: {
            location: property.location,
            type: property.type,
            developer: property.developer,
            area: property.area,
            readyDate: property.readyDate
          },
          paymentPlan: property.paymentPlan || 'دفعة مقدمة مع أقساط',
          features: [
            `الموقع: ${property.location}`,
            `نوع العقار: ${property.type}`,
            `المطور: ${property.developer}`,
            `المساحة: ${property.area || 'غير محدد'} متر مربع`,
            `تاريخ التسليم: ${property.readyDate || 'غير محدد'}`
          ]
        });
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
          type: 'gold',
          name: `${gold.type} - ${gold.purity}`,
          amount: investmentAmount,
          quantity: actualGrams,
          unitPrice: gold.pricePerGram,
          currency: gold.currency || 'SAR',
          expectedReturn: 6, // Gold typically 5-7% annual return
          riskLevel: 'منخفض',
          description: `${actualGrams} جرام من ${gold.type} عيار ${gold.purity}`,
          details: {
            type: gold.type,
            purity: gold.purity,
            supplier: gold.supplier,
            weight: gold.weight,
            description: gold.description
          },
          paymentPlan: 'دفع فوري',
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
      const bondsData = await this.dataProcessor.loadData('bonds-sukuk');
      const recommendations: DetailedRecommendation[] = [];
      
      if (bondsData.length === 0) {
        console.warn('No bonds data available');
        return [];
      }
      
      // Filter suitable bonds
      const suitableBonds = bondsData
        .filter((bond: any) => bond.minInvestment <= amount)
        .sort((a: any, b: any) => b.rating.localeCompare(a.rating)); // Prefer higher ratings
      
      if (suitableBonds.length > 0) {
        const bond = suitableBonds[0];
        const units = Math.floor(amount / bond.faceValue);
        const investmentAmount = units * bond.faceValue;
        
        if (units > 0) {
          recommendations.push({
            type: 'bonds',
            name: bond.name,
            amount: investmentAmount,
            quantity: units,
            unitPrice: bond.faceValue,
            currency: bond.currency || 'SAR',
            expectedReturn: bond.couponRate || 5,
            riskLevel: this.getRiskLevelByRating(bond.rating),
            description: `${units} وحدة من ${bond.name}`,
            details: {
              type: bond.type,
              faceValue: bond.faceValue,
              couponRate: bond.couponRate,
              maturity: bond.maturity,
              rating: bond.rating,
              issuer: bond.issuer,
              issuedDate: bond.issuedDate
            },
            paymentPlan: 'دفع فوري',
            features: [
              `نوع السند: ${bond.type}`,
              `معدل الكوبون: ${bond.couponRate}%`,
              `تاريخ الاستحقاق: ${bond.maturity}`,
              `التصنيف الائتماني: ${bond.rating}`,
              `الجهة المصدرة: ${bond.issuer}`,
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
      type: 'savings',
      name: 'حساب توفير عالي العائد',
      amount: amount,
      quantity: 1,
      unitPrice: amount,
      currency: 'SAR',
      expectedReturn: 4.5,
      riskLevel: 'منخفض',
      description: `حساب توفير بعائد ${(4.5).toFixed(1)}% سنوياً`,
      details: {
        bank: 'البنك الأهلي التجاري',
        interestRate: 4.5,
        compoundingFrequency: 'شهري',
        minimumBalance: 10000
      },
      paymentPlan: 'إيداع فوري',
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
        type: 'crypto',
        name: 'محفظة العملات المشفرة المتنوعة',
        amount: amount,
        quantity: 1,
        unitPrice: amount,
        currency: 'USD',
        expectedReturn: 20,
        riskLevel: 'عالي',
        description: 'استثمار في محفظة متنوعة من العملات المشفرة الرائدة',
        details: {
          allocation: {
            'Bitcoin (BTC)': '50%',
            'Ethereum (ETH)': '30%',
            'Binance Coin (BNB)': '20%'
          },
          platform: 'منصة تداول موثوقة',
          security: 'تخزين آمن بمحافظ باردة'
        },
        paymentPlan: 'استثمار تدريجي (DCA)',
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
  
  private getRiskLevelByReturn(returnRate: number): string {
    if (returnRate < 5) return 'منخفض';
    if (returnRate < 12) return 'متوسط';
    return 'عالي';
  }
  
  private getRiskLevelByRating(rating: string): string {
    if (rating.startsWith('AAA') || rating.startsWith('AA')) return 'منخفض';
    if (rating.startsWith('A') || rating.startsWith('BBB')) return 'متوسط';
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
- نسبة الاستثمار: ${((totalAllocated / userData.amount) * 100).toFixed(1)}%

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