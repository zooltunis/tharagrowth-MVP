import { GoogleGenAI } from "@google/genai";
import { DataProcessor } from "./data-processor";

interface UserInvestmentProfile {
  budget: number;
  currency: string;
  goals: string[];
  timeHorizon: string;
  riskTolerance: string;
  preferences: string[];
  targetMarket: string;
  islamicCompliance: boolean;
  language?: string;
}

interface InvestmentRecommendation {
  asset: string;
  category: string;
  amount: number;
  quantity: string;
  reason: string;
  expectedReturn: number;
  riskLevel: string;
}

interface SmartRecommendationResult {
  recommendations: InvestmentRecommendation[];
  totalAllocated: number;
  strategy: string;
  analysis: string;
  riskAssessment: string;
}

export class SmartInvestmentEngine {
  private ai: GoogleGenAI;
  private dataProcessor: DataProcessor;

  constructor() {
    this.ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "" 
    });
    this.dataProcessor = new DataProcessor();
  }

  async generateSmartRecommendations(profile: UserInvestmentProfile): Promise<SmartRecommendationResult> {
    console.log('🧠 بدء توليد التوصيات الذكية باستخدام Gemini AI...');
    
    try {
      // تحميل جميع البيانات من mockdata
      const [stocks, realEstate, gold, bonds, crowdfunding, crypto, governmentBonds] = await Promise.all([
        this.dataProcessor.getStocksData(),
        this.dataProcessor.getRealEstateData(),
        this.dataProcessor.getGoldData(),
        this.dataProcessor.getBondsData(),
        this.dataProcessor.getCrowdfundingData(),
        this.dataProcessor.getCryptoData(),
        this.dataProcessor.getGovernmentBondsData()
      ]);

      // تصفية البيانات حسب تفضيلات المستخدم
      const filteredData = this.filterDataByPreferences({
        stocks, realEstate, gold, bonds, crowdfunding, crypto, governmentBonds
      }, profile);

      // بناء prompt شامل للـ Gemini
      const prompt = this.buildInvestmentPrompt(profile, filteredData);
      
      console.log('🚀 إرسال البيانات إلى Gemini API...');
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: this.getSystemInstructionByLanguage(profile.language || 'ar'),
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    asset: { type: "string" },
                    category: { type: "string" },
                    amount: { type: "number" },
                    quantity: { type: "string" },
                    reason: { type: "string" },
                    expectedReturn: { type: "number" },
                    riskLevel: { type: "string" }
                  },
                  required: ["asset", "category", "amount", "quantity", "reason", "expectedReturn", "riskLevel"]
                }
              },
              totalAllocated: { type: "number" },
              strategy: { type: "string" },
              analysis: { type: "string" },
              riskAssessment: { type: "string" }
            },
            required: ["recommendations", "totalAllocated", "strategy", "analysis", "riskAssessment"]
          }
        },
        contents: prompt,
      });

      const rawResponse = response.text;
      console.log('📥 استلام رد من Gemini، حجم البيانات:', rawResponse?.length);

      if (!rawResponse) {
        throw new Error('لم يتم استلام رد من Gemini AI');
      }

      const result = JSON.parse(rawResponse) as SmartRecommendationResult;
      
      console.log('✅ تم توليد', result.recommendations.length, 'توصية ذكية');
      console.log('💰 إجمالي المبلغ المخصص:', result.totalAllocated, 'درهم');

      return result;

    } catch (error) {
      console.error('❌ خطأ في توليد التوصيات الذكية:', error);
      throw new Error('فشل في توليد التوصيات الاستثمارية الذكية');
    }
  }

  private getSystemInstructionByLanguage(language: string): string {
    const instructions = {
      ar: `أنت خبير استثمار محترف متخصص في الأسواق المالية الخليجية. 
      مهمتك تحليل ملف المستثمر وتقديم توصيات استثمارية دقيقة ومفصلة باستخدام البيانات الحقيقية المتوفرة فقط.
      
      قواعد مهمة:
      1. اختر الأدوات الاستثمارية من البيانات المتوفرة فقط
      2. اعط مبالغ محددة وليس نسب مئوية
      3. اشرح منطق التوزيع بناءً على استراتيجيات استثمار معروفة
      4. تأكد أن المجموع لا يتجاوز الميزانية المتاحة
      5. استخدم اللغة العربية في جميع النصوص والتحليلات
      6. مستويات المخاطر: منخفض، متوسط، عالي`,
      
      en: `You are a professional investment expert specialized in Gulf financial markets.
      Your task is to analyze the investor profile and provide accurate and detailed investment recommendations using only the real data available.
      
      Important rules:
      1. Choose investment instruments only from the available data
      2. Give specific amounts, not percentages
      3. Explain the allocation logic based on known investment strategies
      4. Ensure the total does not exceed the available budget
      5. Use English language in all texts and analysis
      6. Risk levels: Low, Medium, High`,
      
      fr: `Vous êtes un expert en investissement professionnel spécialisé dans les marchés financiers du Golfe.
      Votre tâche est d'analyser le profil de l'investisseur et de fournir des recommandations d'investissement précises et détaillées en utilisant uniquement les données réelles disponibles.
      
      Règles importantes:
      1. Choisissez les instruments d'investissement uniquement parmi les données disponibles
      2. Donnez des montants spécifiques, pas des pourcentages
      3. Expliquez la logique de répartition basée sur des stratégies d'investissement connues
      4. Assurez-vous que le total ne dépasse pas le budget disponible
      5. Utilisez la langue française dans tous les textes et analyses
      6. Niveaux de risque: Faible, Moyen, Élevé`
    };

    return instructions[language as keyof typeof instructions] || instructions.ar;
  }

  private buildInvestmentPrompt(profile: UserInvestmentProfile, data: any): string {
    const { budget, goals, timeHorizon, riskTolerance, targetMarket, islamicCompliance, language } = profile;
    
    const prompts = {
      ar: {
        intro: `أنت خبير في الاستثمار وإدارة المحافظ المالية. لديك البيانات التالية:`,
        budget: `الميزانية المتاحة للاستثمار`,
        goal: `الهدف الاستثماري`,
        timeHorizon: `المدة الزمنية`,
        risk: `مستوى المخاطرة المقبول`,
        market: `السوق المستهدف`,
        islamic: `الالتزام بالمعايير الإسلامية`,
        data: `بيانات السوق المتوفرة (من mockdata)`,
        stocks: `الأسهم المتاحة`,
        gold: `الذهب`,
        realEstate: `العقارات المتاحة`,
        crowdfunding: `مشاريع Crowdfunding`,
        crypto: `العملات الرقمية`,
        yes: `نعم`,
        no: `لا`
      },
      en: {
        intro: `You are an expert in investment and portfolio management. You have the following data:`,
        budget: `Available investment budget`,
        goal: `Investment goals`,
        timeHorizon: `Time horizon`,
        risk: `Acceptable risk level`,
        market: `Target market`,
        islamic: `Islamic compliance`,
        data: `Available market data (from mockdata)`,
        stocks: `Available stocks`,
        gold: `Gold`,
        realEstate: `Available real estate`,
        crowdfunding: `Crowdfunding projects`,
        crypto: `Cryptocurrencies`,
        yes: `Yes`,
        no: `No`
      },
      fr: {
        intro: `Vous êtes un expert en investissement et gestion de portefeuille. Vous disposez des données suivantes :`,
        budget: `Budget d'investissement disponible`,
        goal: `Objectifs d'investissement`,
        timeHorizon: `Horizon temporel`,
        risk: `Niveau de risque acceptable`,
        market: `Marché cible`,
        islamic: `Conformité islamique`,
        data: `Données de marché disponibles (depuis mockdata)`,
        stocks: `Actions disponibles`,
        gold: `Or`,
        realEstate: `Immobilier disponible`,
        crowdfunding: `Projets de financement participatif`,
        crypto: `Cryptomonnaies`,
        yes: `Oui`,
        no: `Non`
      }
    };

    const currentLang = prompts[language as keyof typeof prompts] || prompts.ar;
    
    let prompt = `${currentLang.intro}

1. ${currentLang.budget}: ${budget.toLocaleString()} ${profile.currency}
2. ${currentLang.goal}: ${goals.join(', ')}
3. ${currentLang.timeHorizon}: ${timeHorizon}
4. ${currentLang.risk}: ${riskTolerance}
5. ${currentLang.market}: ${targetMarket}
6. ${currentLang.islamic}: ${islamicCompliance ? currentLang.yes : currentLang.no}

7. ${currentLang.data}:

`;

    // إضافة بيانات الأسهم
    if (data.stocks?.length > 0) {
      prompt += `\n📈 ${currentLang.stocks}:\n`;
      data.stocks.slice(0, 8).forEach((stock: any) => {
        prompt += `- ${stock.nameArabic || stock.name}: ${profile.currency} ${stock.price}, ${currentLang.expectedReturn || 'Expected Return'} ${stock.expectedReturn}%, ${currentLang.sector || 'Sector'}: ${stock.sector}\n`;
      });
    }

    // إضافة بيانات الذهب
    if (data.gold?.length > 0) {
      prompt += `\n🥇 ${currentLang.gold}:\n`;
      data.gold.forEach((item: any) => {
        prompt += `- ${item.type}: ${profile.currency} ${item.pricePerGram} ${currentLang.perGram || 'per gram'}\n`;
      });
    }

    // إضافة بيانات العقارات
    if (data.realEstate?.length > 0) {
      prompt += `\n🏠 ${currentLang.realEstate}:\n`;
      data.realEstate.slice(0, 5).forEach((property: any) => {
        prompt += `- ${property.name}: ${profile.currency} ${property.price}, ${currentLang.annualReturn || 'Annual Return'} ${property.expectedReturn}%, ${currentLang.location || 'Location'}: ${property.location}\n`;
      });
    }

    // إضافة مشاريع التمويل الجماعي
    if (data.crowdfunding?.length > 0) {
      prompt += `\n👥 ${currentLang.crowdfunding}:\n`;
      data.crowdfunding.forEach((project: any) => {
        prompt += `- ${project.name}: ${currentLang.minimum || 'Minimum'} ${profile.currency} ${project.minInvestment}, ${currentLang.expectedReturn || 'Expected Return'} ${project.expectedReturn}%\n`;
      });
    }

    // إضافة العملات الرقمية
    if (data.crypto?.length > 0) {
      prompt += `\n₿ ${currentLang.crypto}:\n`;
      data.crypto.forEach((crypto: any) => {
        prompt += `- ${crypto.nameArabic} (${crypto.symbol}): ${profile.currency} ${crypto.price}, ${currentLang.expectedReturn || 'Expected Return'} ${crypto.expectedReturn}%\n`;
      });
    }

    // إضافة السندات الحكومية
    if (data.governmentBonds?.length > 0) {
      prompt += `\n📜 ${currentLang.bonds || 'Bonds & Sukuk'}:\n`;
      data.governmentBonds.forEach((bond: any) => {
        prompt += `- ${bond.name}: ${currentLang.minimum || 'Minimum'} ${profile.currency} ${bond.minInvestment}, ${currentLang.yield || 'Yield'} ${bond.yield}%\n`;
      });
    }

    prompt += `\n❗ المطلوب منك:
1. تقسيم الميزانية إلى مبالغ محددة (وليس نسب مئوية) موزعة على الأصول المناسبة
2. اختر الأدوات الاستثمارية من البيانات المتوفرة فقط (لا تقترح أدوات من خارج القائمة)
3. اشرح منطق التوزيع بناءً على استراتيجيات استثمار مشهورة
4. يجب أن تكون التوصية مفصلة مثل: "50000 درهم في 588 سهم من شركة إعمار بسعر 85 درهم"
5. قدم تحليلاً موجزاً يشرح سبب اختيار هذا التوزيع

تأكد أن إجمالي المبالغ لا يتجاوز ${budget} درهم المتاحة.`;

    return prompt;
  }

  private filterDataByPreferences(data: any, profile: UserInvestmentProfile) {
    const filtered: any = {
      stocks: [],
      realEstate: [],
      gold: [],
      bonds: [],
      crowdfunding: [],
      crypto: [],
      governmentBonds: []
    };

    // تصفية الأسهم
    if (profile.preferences.includes('stocks')) {
      filtered.stocks = data.stocks.filter((stock: any) => {
        // تصفية حسب السوق المستهدف
        if (profile.targetMarket === 'UAE') {
          return stock.market === 'UAE' || stock.exchange === 'DFM' || stock.exchange === 'ADX';
        }
        if (profile.targetMarket === 'Saudi Arabia') {
          return stock.market === 'Saudi Arabia' || stock.exchange === 'TADAWUL';
        }
        return true;
      });
    }

    // تصفية العقارات
    if (profile.preferences.includes('real-estate')) {
      filtered.realEstate = data.realEstate.filter((property: any) => {
        if (profile.targetMarket === 'UAE') {
          return property.country === 'UAE';
        }
        return true;
      });
    }

    // تصفية الذهب
    if (profile.preferences.includes('gold')) {
      filtered.gold = data.gold;
    }

    // تصفية العملات الرقمية
    if (profile.preferences.includes('crypto')) {
      filtered.crypto = data.crypto.filter((crypto: any) => {
        if (profile.islamicCompliance) {
          return crypto.shariahCompliant === true;
        }
        return true;
      });
    }

    // تصفية مشاريع التمويل الجماعي
    if (profile.preferences.includes('crowdfunding')) {
      filtered.crowdfunding = data.crowdfunding.filter((project: any) => {
        if (profile.targetMarket === 'UAE') {
          return project.country === 'UAE' || project.market === 'UAE';
        }
        return true;
      });
    }

    // تصفية السندات الحكومية
    if (profile.preferences.includes('bonds') || profile.preferences.includes('government-bonds')) {
      filtered.governmentBonds = data.governmentBonds.filter((bond: any) => {
        if (profile.targetMarket === 'UAE') {
          return bond.country === 'UAE';
        }
        if (profile.targetMarket === 'Saudi Arabia') {
          return bond.country === 'Saudi Arabia';
        }
        if (profile.islamicCompliance) {
          return bond.shariahCompliant === true;
        }
        return true;
      });
    }

    return filtered;
  }
}