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
      const [stocks, realEstate, gold, bonds, crowdfunding, crypto, governmentBonds] = await Promise.all([
        this.dataProcessor.getStocksData(),
        this.dataProcessor.getRealEstateData(),
        this.dataProcessor.getGoldData(),
        this.dataProcessor.getBondsData(),
        this.dataProcessor.getCrowdfundingData(),
        this.dataProcessor.getCryptoData(),
        this.dataProcessor.getGovernmentBondsData()
      ]);

      // Filter data based on user preferences and compliance
      const filteredData = this.filterDataByPreferences(
        { stocks, realEstate, gold, bonds, crowdfunding, crypto, governmentBonds },
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
    // Get market-specific data based on user's target market
    const marketData = this.getMarketSpecificData(data, userData.targetMarket);
    
    const prompt = `
خبير مالي إماراتي متخصص في السوق الإماراتي: أنصح مستثمر عمره ${userData.age}، دخله ${userData.income}، ميزانيته ${budget} درهم إماراتي، مخاطره ${userData.riskTolerance}.

${userData.targetMarket === 'UAE' ? 'البيانات الحقيقية للسوق الإماراتي فقط:' : 'البيانات الحقيقية للسوق:'}
${marketData}

قواعد إلزامية:
- يجب استخدام الشركات والاستثمارات الإماراتية المذكورة أعلاه فقط
- ${userData.targetMarket === 'UAE' ? 'FORBIDDEN: أرامكو، الراجحي، سابك، الاتصالات السعودية - هذه شركات سعودية وليست إماراتية' : ''}
- ${userData.targetMarket === 'UAE' ? 'REQUIRED: استخدم فقط الشركات الإماراتية: إعمار، FAB، ADCB، أدنوك، اتصالات الإمارات' : ''}
- ${userData.targetMarket === 'UAE' ? 'إذا اختار المستخدم UAE كسوق مستهدف، لا تذكر أي شركات سعودية نهائياً' : ''}
- ${userData.islamicCompliance ? 'تأكد من التوافق مع الشريعة الإسلامية' : ''}
- راعِ تفضيلات المستخدم: ${userData.preferences.join('، ')}

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

  private getMarketSpecificData(data: any, targetMarket: string): string {
    let marketInfo = '';
    
    if (targetMarket === 'UAE') {
      // Force UAE-specific data with explicit UAE companies only
      marketInfo += `الشركات الإماراتية المتاحة حصرياً (لا تستخدم أي شركات أخرى):\n`;
      marketInfo += `- إعمار العقارية (EMAAR): 4.85 درهم/سهم، العائد: 8.1%، بورصة دبي\n`;
      marketInfo += `- بنك أبوظبي الأول (FAB): 18.2 درهم/سهم، العائد: 4.8%، بورصة أبوظبي\n`;
      marketInfo += `- بنك أبوظبي التجاري (ADCB): 9.15 درهم/سهم، العائد: 5.4%، بورصة أبوظبي\n`;
      marketInfo += `- أدنوك للتوزيع (ADNOC): 3.95 درهم/سهم، العائد: 6.5%، بورصة أبوظبي\n`;
      marketInfo += `- اتصالات الإمارات (Etisalat): 15.6 درهم/سهم، العائد: 7.2%، بورصة أبوظبي\n`;

      // UAE Real Estate from data
      const uaeRealEstate = data.realEstate.filter((r: any) => 
        r.location?.includes('الإمارات') || r.location?.includes('UAE') || r.location?.includes('Dubai')
      ).slice(0, 3);

      if (uaeRealEstate.length > 0) {
        marketInfo += `\nالعقارات الإماراتية المتاحة:\n`;
        uaeRealEstate.forEach((property: any) => {
          marketInfo += `- ${property.name}: ${property.price} درهم، الحد الأدنى: ${property.minInvestment} درهم\n`;
        });
      }

      // UAE Crowdfunding projects
      const uaeCrowdfunding = data.crowdfunding.filter((c: any) => 
        c.country === 'UAE' || c.location?.includes('UAE')
      ).slice(0, 3);

      if (uaeCrowdfunding.length > 0) {
        marketInfo += `\nمشاريع التمويل الجماعي الإماراتية المتاحة:\n`;
        uaeCrowdfunding.forEach((project: any) => {
          marketInfo += `- ${project.name}: عائد ${project.expectedReturn}%، الحد الأدنى: ${project.minInvestment} درهم\n`;
        });
      }

      // Crypto currencies
      if (data.crypto && data.crypto.length > 0) {
        marketInfo += `\nالعملات الرقمية المتاحة:\n`;
        data.crypto.slice(0, 4).forEach((crypto: any) => {
          marketInfo += `- ${crypto.nameArabic} (${crypto.symbol}): ${crypto.price} درهم، عائد متوقع: ${crypto.expectedReturn}%\n`;
        });
      }

      // Government bonds
      const countryBonds = data.governmentBonds.filter((b: any) => 
        targetMarket === 'UAE' ? b.country === 'UAE' : b.country === 'Saudi Arabia'
      );
      if (countryBonds.length > 0) {
        marketInfo += `\nالسندات الحكومية المتاحة:\n`;
        countryBonds.forEach((bond: any) => {
          marketInfo += `- ${bond.name}: عائد ${bond.yield}%، الحد الأدنى: ${bond.minInvestment} درهم\n`;
        });
      }
      
    } else if (targetMarket === 'Saudi Arabia') {
      // Saudi-specific data
      const saudiStocks = data.stocks.filter((s: any) => 
        s.exchange === 'Tadawul' || s.country === 'Saudi Arabia'
      ).slice(0, 5);

      marketInfo += `الأسهم السعودية المتاحة:\n`;
      saudiStocks.forEach((stock: any) => {
        marketInfo += `- ${stock.name}: ${stock.price} ريال/سهم، العائد: ${stock.expectedReturn}%\n`;
      });
    }

    // Common data for all markets
    marketInfo += `\nالذهب: ${data.gold[0]?.price || 270} درهم/جرام\n`;
    
    const islamicBonds = data.bonds.filter((b: any) => 
      b.type === 'sukuk' || b.shariahCompliant === true
    ).slice(0, 2);
    
    marketInfo += `الصكوك المتاحة:\n`;
    islamicBonds.forEach((bond: any) => {
      marketInfo += `- ${bond.name}: عائد ${bond.expectedReturn}% سنوياً\n`;
    });

    return marketInfo;
  }

  private filterDataByPreferences(data: any, userData: UserData) {
    const filtered: any = {
      stocks: [],
      realEstate: [],
      gold: [],
      bonds: [],
      crowdfunding: [],
      crypto: [],
      governmentBonds: []
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

    if (userData.preferences.includes('crowdfunding')) {
      filtered.crowdfunding = data.crowdfunding.filter((project: any) => {
        if (userData.targetMarket === 'UAE') {
          return project.country === 'UAE' || project.location?.includes('UAE');
        }
        if (userData.targetMarket === 'Saudi Arabia') {
          return project.country === 'KSA' || project.country === 'Saudi Arabia';
        }
        return true;
      });
    }

    if (userData.preferences.includes('crypto') || userData.preferences.includes('cryptocurrency')) {
      filtered.crypto = data.crypto.filter((crypto: any) => {
        if (userData.islamicCompliance) {
          return crypto.shariahCompliant === true;
        }
        return true;
      });
    }

    if (userData.preferences.includes('government-bonds') || userData.preferences.includes('bonds')) {
      filtered.governmentBonds = data.governmentBonds.filter((bond: any) => {
        if (userData.targetMarket === 'UAE') {
          return bond.country === 'UAE';
        }
        if (userData.targetMarket === 'Saudi Arabia') {
          return bond.country === 'Saudi Arabia';
        }
        if (userData.islamicCompliance) {
          return bond.shariahCompliant === true;
        }
        return true;
      });
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