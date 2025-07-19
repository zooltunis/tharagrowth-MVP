import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userDataSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}

async function generateInvestmentRecommendations(userData: any) {
  // Use intelligent local recommendations instead of OpenAI
  return generateIntelligentRecommendations(userData);
}

function generateIntelligentRecommendations(userData: any) {
  const { age, income, investmentAmount, goals, riskTolerance, preferences } = userData;
  
  // Calculate base allocation based on risk tolerance
  let baseAllocation = getBaseAllocation(riskTolerance);
  
  // Adjust based on age (younger = more aggressive)
  baseAllocation = adjustForAge(baseAllocation, age);
  
  // Adjust based on investment amount
  baseAllocation = adjustForAmount(baseAllocation, investmentAmount);
  
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
  
  return {
    allocation,
    summary,
    expectedReturn,
    riskLevel
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

function adjustForAmount(allocation: Record<string, number>, amount: string): Record<string, number> {
  const adjusted = { ...allocation };
  
  if (amount === '<10000' || amount === '10000-50000') {
    // Smaller amounts - reduce real estate, increase stocks
    if (adjusted['العقارات']) adjusted['العقارات'] -= 10;
    if (adjusted['الأسهم']) adjusted['الأسهم'] += 5;
    if (adjusted['الذهب']) adjusted['الذهب'] += 5;
  } else if (amount === '500000+') {
    // Larger amounts - more real estate
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
  
  if (goals.includes('growth')) {
    // Focus on growth assets
    if (adjusted['الأسهم']) adjusted['الأسهم'] += 15;
    if (adjusted['العملات الرقمية']) adjusted['العملات الرقمية'] += 5;
    if (adjusted['حسابات الادخار']) adjusted['حسابات الادخار'] -= 10;
    if (adjusted['السندات']) adjusted['السندات'] -= 10;
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
    'savings': 'حسابات الادخار'
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
  const { age, riskTolerance, goals, investmentAmount } = userData;
  
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
  
  // Investment amount
  summary += `✓ المبلغ المتاح (${investmentAmount}) تم تحسين التوزيع وفقاً له\n\n`;
  
  // Goals
  summary += `أهدافك الاستثمارية:\n`;
  if (goals.includes('savings')) summary += `• بناء ثروة طويلة المدى من خلال استثمارات متنوعة\n`;
  if (goals.includes('passive-income')) summary += `• توليد دخل منتظم من العقارات والسندات\n`;
  if (goals.includes('retirement')) summary += `• التحضير للتقاعد بمحفظة متوازنة وآمنة\n`;
  if (goals.includes('growth')) summary += `• تحقيق نمو سريع من خلال الأسهم والاستثمارات عالية العائد\n`;
  
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
