import { GoogleGenAI } from "@google/genai";
import { DataProcessor } from "./data-processor";
import type { UserData } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GeminiRecommendation {
  id: string;
  type: string;
  title: string;
  amount: number;
  currency: string;
  description: string;
  reasoning: string;
  expectedReturn: string;
  riskLevel: string;
  timeline: string;
  features: string[];
}

export interface GeminiAnalysis {
  id: string;
  userData: UserData;
  strategy: string;
  riskProfile: string;
  totalAllocated: number;
  remainingAmount: number;
  recommendations: GeminiRecommendation[];
  analysis: string;
  generatedAt: string;
  currencyRates: Record<string, number>;
}

export class GeminiRecommendationEngine {
  private dataProcessor: DataProcessor;
  private currencyRates: Record<string, number> = {
    'AED': 1.0,
    'SAR': 1.02,
    'USD': 3.67,
    'EUR': 4.01,
    'GBP': 4.69
  };

  constructor() {
    this.dataProcessor = new DataProcessor();
  }

  async generateRecommendations(userData: UserData): Promise<GeminiAnalysis> {
    console.log('🧠 Starting Gemini-powered recommendation generation...');
    
    try {
      // Load market data
      const [stocks, realEstate, gold, bonds, crowdfunding] = await Promise.all([
        this.dataProcessor.getStocksData(),
        this.dataProcessor.getRealEstateData(),
        this.dataProcessor.getGoldData(),
        this.dataProcessor.getBondsData(),
        this.dataProcessor.getCrowdfundingData()
      ]);

      // Filter data based on user preferences and compliance
      const filteredData = this.filterDataByPreferences(
        { stocks, realEstate, gold, bonds, crowdfunding },
        userData
      );

      // Convert budget to base currency (AED)
      const baseBudget = this.convertToBaseCurrency(
        parseFloat(userData.investmentBudget),
        userData.currency
      );

      // Create comprehensive prompt for Gemini
      const prompt = this.createGeminiPrompt(userData, filteredData, baseBudget);

      console.log('🚀 Sending request to Gemini API...');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const rawResponse = response.text;
      console.log('📥 Received response from Gemini');
      console.log('🔍 Raw response length:', rawResponse?.length || 0);

      if (!rawResponse) {
        throw new Error('Empty response from Gemini API');
      }

      // Extract JSON from response
      let jsonStr = rawResponse;
      const jsonStart = rawResponse.indexOf('{');
      const jsonEnd = rawResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = rawResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('📝 Parsing JSON response...');
      const geminiResult = JSON.parse(jsonStr);

      // Convert amounts back to user's preferred currency
      const convertedRecommendations = geminiResult.recommendations.map((rec: any) => ({
        ...rec,
        amount: this.convertFromBaseCurrency(rec.amount, userData.currency),
        currency: userData.currency
      }));

      const totalConverted = this.convertFromBaseCurrency(geminiResult.totalAllocated, userData.currency);
      const budget = parseFloat(userData.investmentBudget);
      
      const result: GeminiAnalysis = {
        id: `gemini-analysis-${userData.age}-${userData.riskTolerance}-${Date.now()}`,
        userData: userData,
        strategy: geminiResult.strategy,
        riskProfile: geminiResult.riskProfile,
        totalAllocated: totalConverted,
        remainingAmount: budget - totalConverted,
        recommendations: convertedRecommendations,
        analysis: geminiResult.analysis,
        generatedAt: new Date().toISOString(),
        currencyRates: this.currencyRates
      };

      console.log(`✅ Generated ${result.recommendations.length} AI-powered recommendations`);
      console.log(`💰 Total allocated: ${result.totalAllocated} ${userData.currency}`);

      return result;

    } catch (error) {
      console.error('❌ Error in Gemini recommendation generation:', error);
      throw new Error(`Failed to generate AI recommendations: ${error}`);
    }
  }

  private createGeminiPrompt(userData: UserData, data: any, budget: number): string {
    // Simple and direct prompt to avoid API errors
    const prompt = `
خبير مالي خليجي: أنصح مستخدم عمره ${userData.age}، دخله ${userData.income}، ميزانيته ${budget} درهم، مخاطره ${userData.riskTolerance}.

أسعار السوق:
- أرامكو: 27.85 ريال/سهم
- الراجحي: 85.2 ريال/سهم  
- سابك: 89.5 ريال/سهم
- ذهب: 180 ريال/جرام

أعط 3-4 توصيات بتنسيق JSON فقط:
{
  "strategy": "نوع الاستراتيجية",
  "riskProfile": "المخاطر",
  "totalAllocated": رقم,
  "analysis": "تحليل قصير",
  "recommendations": [
    {
      "id": "id1",
      "type": "stocks",
      "title": "عنوان",
      "amount": رقم,
      "currency": "AED",
      "description": "وصف",
      "reasoning": "سبب",
      "expectedReturn": "نسبة",
      "riskLevel": "مستوى",
      "timeline": "وقت",
      "features": ["ميزة1", "ميزة2"]
    }
  ]
}`;

    return prompt;
  }

  private filterDataByPreferences(data: any, userData: UserData) {
    const filtered: any = {
      stocks: [],
      realEstate: [],
      gold: [],
      bonds: [],
      crowdfunding: []
    };

    // Filter based on user preferences
    if (userData.preferences.includes('stocks')) {
      filtered.stocks = data.stocks.filter((stock: any) => {
        if (userData.islamicCompliance) {
          return stock.shariahCompliant !== false;
        }
        return true;
      });
    }

    if (userData.preferences.includes('real-estate')) {
      filtered.realEstate = data.realEstate.filter((property: any) => {
        if (userData.targetMarket === 'UAE') {
          return property.location?.includes('UAE') || property.country === 'UAE';
        }
        if (userData.targetMarket === 'Saudi Arabia') {
          return property.location?.includes('Saudi') || property.country === 'Saudi Arabia';
        }
        return true;
      });
    }

    if (userData.preferences.includes('gold')) {
      filtered.gold = data.gold;
    }

    if (userData.preferences.includes('bonds') || userData.preferences.includes('sukuk')) {
      filtered.bonds = data.bonds.filter((bond: any) => {
        if (userData.islamicCompliance) {
          return bond.type === 'sukuk' || bond.shariahCompliant === true;
        }
        return true;
      });
    }

    if (userData.preferences.includes('crowdfunding')) {
      filtered.crowdfunding = data.crowdfunding.filter((project: any) => {
        if (userData.islamicCompliance) {
          return project.shariahCompliant !== false;
        }
        return true;
      });
    }

    return filtered;
  }

  private convertToBaseCurrency(amount: number, fromCurrency: string): number {
    const rate = this.currencyRates[fromCurrency] || 1;
    return amount / rate;
  }

  private convertFromBaseCurrency(amount: number, toCurrency: string): number {
    const rate = this.currencyRates[toCurrency] || 1;
    return amount * rate;
  }
}