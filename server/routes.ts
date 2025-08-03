import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userDataSchema, type DetailedRecommendation } from "@shared/schema";
import { getRecommendationsByCategory, getAllRecommendations } from "./investment-data";
import { 
  getGoldPrice, 
  getStockData, 
  realEstateProjects, 
  sukukBondsData, 
  crowdfundingProjects,
  calculateGoldRecommendation,
  type RealEstateProject,
  type StockData 
} from "./api-integrations";
import {
  getMarketSummary,
  getLiveGoldPrice,
  getCurrencyRates,
  convertCurrency,
  getActiveStocks
} from "./market-data";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-fake-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze investment data using AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const userData = userDataSchema.parse(req.body);
      
      // Generate AI recommendations
      const recommendations = await generateInvestmentRecommendations(userData);
      
      // Store the analysis
      const analysis = await storage.createInvestmentAnalysis({
        ...userData,
        recommendations
      });
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(400).json({ 
        message: error.message || "فشل في تحليل البيانات"
      });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getInvestmentAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "التحليل غير موجود" });
      }
      
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Live Market Data endpoint
  app.get("/api/market-data", async (req, res) => {
    try {
      const currency = (req.query.currency as string) || 'SAR';
      const marketData = await getMarketSummary(currency);
      res.json(marketData);
    } catch (error: any) {
      console.error("Market data error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات السوق" });
    }
  });

  // Gold price endpoint
  app.get("/api/gold-price", async (req, res) => {
    try {
      const currency = (req.query.currency as string) || 'SAR';
      const goldPrice = await getLiveGoldPrice(currency);
      res.json(goldPrice);
    } catch (error: any) {
      console.error("Gold price error:", error);
      res.status(500).json({ message: "خطأ في جلب سعر الذهب" });
    }
  });

  // Currency conversion endpoint
  app.get("/api/currency-rates", async (req, res) => {
    try {
      const baseCurrency = (req.query.base as string) || 'USD';
      const rates = await getCurrencyRates(baseCurrency);
      res.json(rates);
    } catch (error: any) {
      console.error("Currency rates error:", error);
      res.status(500).json({ message: "خطأ في جلب أسعار العملات" });
    }
  });

  // Convert currency endpoint
  app.post("/api/convert-currency", async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      
      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ message: "معاملات مطلوبة: amount, fromCurrency, toCurrency" });
      }
      
      const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
      res.json({
        originalAmount: amount,
        fromCurrency,
        toCurrency,
        convertedAmount,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Currency conversion error:", error);
      res.status(500).json({ message: "خطأ في تحويل العملة" });
    }
  });

  // Active stocks endpoint
  app.get("/api/active-stocks", async (req, res) => {
    try {
      const market = (req.query.market as string) || 'TADAWUL';
      const stocks = await getActiveStocks(market);
      res.json(stocks);
    } catch (error: any) {
      console.error("Stocks data error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الأسهم" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateInvestmentRecommendations(userData: any) {
  // Use intelligent local recommendations with real data integration
  return await generateIntelligentRecommendations(userData);
}

async function generateIntelligentRecommendations(userData: any) {
  const { age, income, investmentBudget, currency, goals, riskTolerance, preferences } = userData;
  
  // Calculate base allocation based on risk tolerance
  let baseAllocation = getBaseAllocation(riskTolerance);
  
  // Adjust based on age (younger = more aggressive)
  baseAllocation = adjustForAge(baseAllocation, age);
  
  // Adjust based on investment budget and currency
  baseAllocation = adjustForAmount(baseAllocation, investmentBudget, currency);
  
  // Adjust based on goals
  baseAllocation = adjustForGoals(baseAllocation, goals);
  
  // Filter based on user preferences
  baseAllocation = filterByPreferences(baseAllocation, preferences);
  
  // Normalize to ensure sum is 100%
  const allocation = normalizeAllocation(baseAllocation);
  
  // Generate detailed summary
  const summary = generateDetailedSummary(userData, allocation);
  
  // Calculate expected return
  const expectedReturn = calculateExpectedReturn(allocation, riskTolerance);
  
  // Determine risk level
  const riskLevel = getRiskLevel(riskTolerance);
  
  // Generate detailed recommendations with real data
  const detailedRecommendations = await generateDetailedInvestmentRecommendations(userData, allocation);
  
  return {
    allocation,
    summary,
    expectedReturn,
    riskLevel,
    detailedRecommendations
  };
}

function getBaseAllocation(riskTolerance: string): Record<string, number> {
  switch (riskTolerance) {
    case 'low':
      return {
        'حسابات الادخار': 35,
        'السندات': 30,
        'الذهب': 20,
        'العقارات': 15
      };
    case 'medium':
      return {
        'العقارات': 30,
        'الأسهم': 25,
        'الذهب': 20,
        'السندات': 15,
        'حسابات الادخار': 10
      };
    case 'high':
      return {
        'الأسهم': 40,
        'العقارات': 25,
        'العملات الرقمية': 15,
        'الذهب': 12,
        'السندات': 8
      };
    default:
      return {
        'العقارات': 30,
        'الأسهم': 25,
        'الذهب': 25,
        'السندات': 20
      };
  }
}

function adjustForAge(allocation: Record<string, number>, age: string): Record<string, number> {
  const adjusted = { ...allocation };
  
  if (age === '18-25' || age === '26-35') {
    // Younger investors - more growth-oriented
    if (adjusted['الأسهم']) adjusted['الأسهم'] += 5;
    if (adjusted['العقارات']) adjusted['العقارات'] += 5;
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] -= 10;
  } else if (age === '46-55' || age === '55+') {
    // Older investors - more conservative
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] += 10;
    if (adjusted['السندات']) adjusted['السندات'] += 5;
    if (adjusted['الأسهم']) adjusted['الأسهم'] -= 10;
    if (adjusted['العملات الرقمية']) adjusted['العملات الرقمية'] -= 5;
  }
  
  return adjusted;
}

function adjustForAmount(allocation: Record<string, number>, budget: number, currency: string): Record<string, number> {
  const adjusted = { ...allocation };
  
  // Convert to USD equivalent for consistent logic
  const conversionRates: Record<string, number> = {
    'AED': 0.27, 'SAR': 0.27, 'USD': 1, 'EUR': 1.1, 'GBP': 1.3
  };
  const budgetUSD = budget * (conversionRates[currency] || 0.27);
  
  if (budgetUSD < 5000) {
    // Smaller amounts - reduce real estate, increase liquid investments
    if (adjusted['العقارات']) adjusted['العقارات'] -= 15;
    if (adjusted['الأسهم']) adjusted['الأسهم'] += 5;
    if (adjusted['الذهب']) adjusted['الذهب'] += 5;
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] += 5;
  } else if (budgetUSD > 50000) {
    // Larger amounts - more real estate and diverse investments
    if (adjusted['العقارات']) adjusted['العقارات'] += 10;
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] -= 5;
    if (adjusted['السندات']) adjusted['السندات'] -= 5;
  }
  
  return adjusted;
}

function adjustForGoals(allocation: Record<string, number>, goals: string[]): Record<string, number> {
  const adjusted = { ...allocation };
  
  if (goals.includes('passive-income')) {
    // Focus on income-generating assets
    if (adjusted['العقارات']) adjusted['العقارات'] += 10;
    if (adjusted['السندات']) adjusted['السندات'] += 5;
    if (adjusted['الأسهم']) adjusted['الأسهم'] -= 5;
    if (adjusted['الذهب']) adjusted['الذهب'] -= 10;
  }
  
  if (goals.includes('capital-growth')) {
    // Focus on growth assets
    if (adjusted['الأسهم']) adjusted['الأسهم'] += 15;
    if (adjusted['العملات الرقمية']) adjusted['العملات الرقمية'] += 5;
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] -= 10;
    if (adjusted['السندات']) adjusted['السندات'] -= 10;
  }
  
  if (goals.includes('children-savings')) {
    // Conservative approach for children's future
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] += 10;
    if (adjusted['السندات']) adjusted['السندات'] += 5;
    if (adjusted['العملات الرقمية']) adjusted['العملات الرقمية'] -= 10;
  }
  
  if (goals.includes('wealth-preservation')) {
    // Focus on inflation hedges
    if (adjusted['الذهب']) adjusted['الذهب'] += 15;
    if (adjusted['العقارات']) adjusted['العقارات'] += 5;
    if (adjusted['العملات الرقمية']) adjusted['العملات الرقمية'] -= 10;
  }
  
  if (goals.includes('retirement')) {
    // Balanced approach for retirement
    if (adjusted['السندات']) adjusted['السندات'] += 10;
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] += 5;
    if (adjusted['العملات الرقمية']) adjusted['العملات الرقمية'] -= 10;
    if (adjusted['الأسهم']) adjusted['الأسهم'] -= 5;
  }
  
  return adjusted;
}

function filterByPreferences(allocation: Record<string, number>, preferences: string[]): Record<string, number> {
  const filtered: Record<string, number> = {};
  
  // Map preferences to allocation keys
  const preferenceMap: Record<string, string> = {
    'real-estate': 'العقارات',
    'stocks': 'الأسهم',
    'gold': 'الذهب',
    'bonds': 'السندات',
    'crypto': 'العملات الرقمية',
    'savings': 'حسابات الادخار',
    'crowdfunding': 'التمويل الجماعي',
    'sukuk': 'الصكوك الإسلامية'
  };
  
  // Only include preferred investment types
  preferences.forEach(pref => {
    const key = preferenceMap[pref];
    if (key && allocation[key]) {
      filtered[key] = allocation[key];
    }
  });
  
  // If no preferences match existing allocation, use safer defaults
  if (Object.keys(filtered).length === 0) {
    filtered['حسابات الادخار'] = 50;
    filtered['الذهب'] = 30;
    filtered['السندات'] = 20;
  }
  
  return filtered;
}

function normalizeAllocation(allocation: Record<string, number>): Record<string, number> {
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  const normalized: Record<string, number> = {};
  
  Object.entries(allocation).forEach(([key, value]) => {
    normalized[key] = Math.round((value / total) * 100);
  });
  
  // Ensure total is exactly 100%
  const normalizedTotal = Object.values(normalized).reduce((sum, val) => sum + val, 0);
  if (normalizedTotal !== 100) {
    const largestKey = Object.keys(normalized).reduce((a, b) => 
      normalized[a] > normalized[b] ? a : b
    );
    normalized[largestKey] += (100 - normalizedTotal);
  }
  
  return normalized;
}

function generateDetailedSummary(userData: any, allocation: Record<string, number>): string {
  const { age, riskTolerance, goals, investmentBudget, currency } = userData;
  
  let summary = `بناءً على تحليل دقيق لملفك الاستثماري، تم تصميم هذه المحفظة خصيصاً لتناسب:\n\n`;
  
  // Age consideration
  if (age === '18-25' || age === '26-35') {
    summary += `✓ عمرك (${age}) يتيح لك اتخاذ مخاطر محسوبة للاستفادة من النمو طويل المدى\n`;
  } else if (age === '46-55' || age === '55+') {
    summary += `✓ مرحلتك العمرية (${age}) تتطلب استراتيجية أكثر حذراً للحفاظ على رأس المال\n`;
  }
  
  // Risk tolerance
  const riskText = riskTolerance === 'low' ? 'المنخفض' : riskTolerance === 'medium' ? 'المتوسط' : 'العالي';
  summary += `✓ مستوى تحملك للمخاطر ${riskText} تم مراعاته في توزيع الاستثمارات\n`;
  
  // Investment budget
  summary += `✓ الميزانية المتاحة (${investmentBudget.toLocaleString()} ${currency}) تم تحسين التوزيع وفقاً لها\n\n`;
  
  // Goals
  summary += `أهدافك الاستثمارية:\n`;
  if (goals.includes('wealth-preservation')) summary += `• حفظ الثروة وحمايتها من التضخم\n`;
  if (goals.includes('passive-income')) summary += `• توليد دخل منتظم من العقارات والسندات\n`;
  if (goals.includes('retirement')) summary += `• التحضير للتقاعد بمحفظة متوازنة وآمنة\n`;
  if (goals.includes('capital-growth')) summary += `• تحقيق نمو سريع من خلال الأسهم والاستثمارات عالية العائد\n`;
  if (goals.includes('children-savings')) summary += `• بناء مستقبل آمن للأطفال والتعليم\n`;
  if (goals.includes('emergency-fund')) summary += `• إنشاء احتياطي مالي للظروف الطارئة\n`;
  
  summary += `\n📈 توزيع المحفظة:\n`;
  Object.entries(allocation).forEach(([type, percentage]) => {
    summary += `• ${type}: ${percentage}% - `;
    switch (type) {
      case 'العقارات':
        summary += `استثمار آمن مع دخل منتظم وحماية من التضخم\n`;
        break;
      case 'الأسهم':
        summary += `نمو رأس المال مع إمكانيات عوائد عالية\n`;
        break;
      case 'الذهب':
        summary += `حماية من التضخم واستقرار في الأزمات\n`;
        break;
      case 'السندات':
        summary += `استثمار آمن مع عوائد ثابتة ومنتظمة\n`;
        break;
      case 'العملات الرقمية':
        summary += `فرصة نمو عالية مع مخاطر محسوبة\n`;
        break;
      case 'حسابات الادخار':
        summary += `سيولة فورية وأمان كامل لرأس المال\n`;
        break;
    }
  });
  
  summary += `\n💡 توصيات إضافية:\n`;
  summary += `• قم بمراجعة المحفظة كل 6 أشهر وأعد توزيعها حسب الحاجة\n`;
  summary += `• ابدأ بمبالغ صغيرة واتعلم من كل استثمار\n`;
  summary += `• لا تضع كل أموالك في استثمار واحد\n`;
  summary += `• استشر خبيراً مالياً للقرارات الكبيرة\n`;
  
  return summary;
}

function calculateExpectedReturn(allocation: Record<string, number>, riskTolerance: string): string {
  const returns: Record<string, number> = {
    'العقارات': 8.5,
    'الأسهم': 12.0,
    'الذهب': 6.0,
    'السندات': 4.5,
    'العملات الرقمية': 18.0,
    'حسابات الادخار': 2.5
  };
  
  let weightedReturn = 0;
  Object.entries(allocation).forEach(([type, percentage]) => {
    weightedReturn += (returns[type] || 5) * (percentage / 100);
  });
  
  // Adjust based on risk tolerance
  if (riskTolerance === 'low') {
    weightedReturn *= 0.8; // More conservative estimate
  } else if (riskTolerance === 'high') {
    weightedReturn *= 1.1; // More optimistic estimate
  }
  
  return weightedReturn.toFixed(1);
}

function getRiskLevel(riskTolerance: string): string {
  switch (riskTolerance) {
    case 'low': return 'منخفض';
    case 'medium': return 'متوسط';
    case 'high': return 'عالي';
    default: return 'متوسط';
  }
}

async function generateDetailedInvestmentRecommendations(userData: any, allocation: Record<string, number>): Promise<DetailedRecommendation[]> {
  const { investmentBudget, currency, riskTolerance, preferences } = userData;
  const recommendations: DetailedRecommendation[] = [];
  
  // Use the actual investment budget from user input
  const budget = investmentBudget;
  
  // Map preferences to categories
  const preferenceMap: Record<string, string> = {
    'real-estate': 'real-estate',
    'stocks': 'stocks',
    'gold': 'gold',
    'bonds': 'bonds',
    'crypto': 'crypto',
    'savings': 'savings'
  };
  
  // Get recommendations for each allocation category  
  Object.entries(allocation).forEach(([arabicType, percentage]) => {
    const categoryAmount = (budget * percentage) / 100;
    
    // Map Arabic types to English categories
    const categoryMap: Record<string, string> = {
      'العقارات': 'real-estate',
      'الأسهم': 'stocks',
      'الذهب': 'gold',
      'السندات': 'bonds',
      'العملات الرقمية': 'crypto',
      'حسابات الادخار': 'savings'
    };
    
    const category = categoryMap[arabicType];
    if (!category) return;
    
    const categoryRecommendations = getRecommendationsByCategory(category);
    
    // Filter based on risk tolerance and budget
    const filteredRecommendations = categoryRecommendations.filter(rec => {
      const minInvestment = parseInt(rec.minimumInvestment.replace(/[^\d]/g, ''));
      const isAffordable = minInvestment <= Math.max(categoryAmount, budget * 0.1); // Allow at least 10% of total budget
      
      const riskMatch = 
        (riskTolerance === 'low' && rec.riskLevel === 'منخفض') ||
        (riskTolerance === 'medium' && ['منخفض', 'متوسط'].includes(rec.riskLevel)) ||
        (riskTolerance === 'high');
      
      return isAffordable && riskMatch;
    });
    
    // Select best recommendations (max 1-2 per category based on allocation)
    const maxRecommendationsForCategory = percentage >= 30 ? 2 : 1;
    const selectedRecommendations = filteredRecommendations
      .sort((a, b) => {
        // Sort by recommendation strength and expected return
        const strengthOrder = { 'شراء قوي': 3, 'شراء': 2, 'شراء متوسط': 1, 'انتظار': 0, 'تجنب': -1 };
        const aStrength = strengthOrder[a.recommendation] || 0;
        const bStrength = strengthOrder[b.recommendation] || 0;
        
        if (aStrength !== bStrength) return bStrength - aStrength;
        
        // Then by expected return
        const aReturn = parseFloat(a.expectedReturn.replace(/[^\d.]/g, ''));
        const bReturn = parseFloat(b.expectedReturn.replace(/[^\d.]/g, ''));
        return bReturn - aReturn;
      })
      .slice(0, maxRecommendationsForCategory);
    
    recommendations.push(...selectedRecommendations);
  });
  
  // If no recommendations found, add safe defaults
  if (recommendations.length === 0) {
    const safeRecommendations = getAllRecommendations().filter(rec => 
      rec.riskLevel === 'منخفض' && 
      parseInt(rec.minimumInvestment.replace(/[^\d]/g, '')) <= budget / 2
    ).slice(0, 3);
    
    recommendations.push(...safeRecommendations);
  }
  
  // Ensure we have at least 2-3 recommendations from different categories
  if (recommendations.length < 2) {
    const additionalRecommendations = getAllRecommendations()
      .filter(rec => {
        const alreadyIncluded = recommendations.some(existing => existing.id === rec.id);
        const minInvestment = parseInt(rec.minimumInvestment.replace(/[^\d]/g, ''));
        const affordableForAnyCategory = minInvestment <= budget * 0.15; // Allow up to 15% of budget
        
        const riskMatch = 
          (riskTolerance === 'low' && rec.riskLevel === 'منخفض') ||
          (riskTolerance === 'medium' && ['منخفض', 'متوسط'].includes(rec.riskLevel)) ||
          (riskTolerance === 'high');
        
        return !alreadyIncluded && affordableForAnyCategory && riskMatch;
      })
      .sort((a, b) => {
        const strengthOrder: Record<string, number> = { 
          'شراء قوي': 3, 
          'شراء': 2, 
          'شراء متوسط': 1,
          'انتظار': 0,
          'تجنب': -1
        };
        return (strengthOrder[b.recommendation] || 0) - (strengthOrder[a.recommendation] || 0);
      })
      .slice(0, 4 - recommendations.length);
    
    recommendations.push(...additionalRecommendations);
  }
  
  return recommendations.slice(0, 6); // Limit to 6 recommendations max
}
