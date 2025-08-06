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
          systemInstruction: `أنت خبير استثمار محترف متخصص في الأسواق المالية الخليجية. 
          مهمتك تحليل ملف المستثمر وتقديم توصيات استثمارية دقيقة ومفصلة باستخدام البيانات الحقيقية المتوفرة فقط.
          
          قواعد مهمة:
          1. اختر الأدوات الاستثمارية من البيانات المتوفرة فقط
          2. اعط مبالغ محددة وليس نسب مئوية
          3. اشرح منطق التوزيع بناءً على استراتيجيات استثمار معروفة
          4. تأكد أن المجموع لا يتجاوز الميزانية المتاحة
          5. استخدم اللغة العربية في التحليل`,
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

  private buildInvestmentPrompt(profile: UserInvestmentProfile, data: any): string {
    const { budget, goals, timeHorizon, riskTolerance, targetMarket, islamicCompliance } = profile;
    
    let prompt = `أنت خبير في الاستثمار وإدارة المحافظ المالية. لديك البيانات التالية:

1. الميزانية المتاحة للاستثمار: ${budget.toLocaleString()} درهم
2. الهدف الاستثماري: ${goals.join(', ')}
3. المدة الزمنية: ${timeHorizon}
4. مستوى المخاطرة المقبول: ${riskTolerance}
5. السوق المستهدف: ${targetMarket}
6. الالتزام بالمعايير الإسلامية: ${islamicCompliance ? 'نعم' : 'لا'}

7. بيانات السوق المتوفرة (من mockdata):

`;

    // إضافة بيانات الأسهم
    if (data.stocks?.length > 0) {
      prompt += `\n📈 الأسهم المتاحة:\n`;
      data.stocks.slice(0, 8).forEach((stock: any) => {
        prompt += `- ${stock.nameArabic || stock.name}: السعر ${stock.price} درهم، العائد المتوقع ${stock.expectedReturn}%، القطاع: ${stock.sector}\n`;
      });
    }

    // إضافة بيانات الذهب
    if (data.gold?.length > 0) {
      prompt += `\n🥇 الذهب:\n`;
      data.gold.forEach((item: any) => {
        prompt += `- ${item.type}: السعر ${item.pricePerGram} درهم للجرام\n`;
      });
    }

    // إضافة بيانات العقارات
    if (data.realEstate?.length > 0) {
      prompt += `\n🏠 العقارات المتاحة:\n`;
      data.realEstate.slice(0, 5).forEach((property: any) => {
        prompt += `- ${property.name}: ${property.price} درهم، العائد السنوي ${property.expectedReturn}%، المكان: ${property.location}\n`;
      });
    }

    // إضافة مشاريع التمويل الجماعي
    if (data.crowdfunding?.length > 0) {
      prompt += `\n👥 مشاريع Crowdfunding:\n`;
      data.crowdfunding.forEach((project: any) => {
        prompt += `- ${project.name}: الحد الأدنى ${project.minInvestment} درهم، العائد المتوقع ${project.expectedReturn}%\n`;
      });
    }

    // إضافة العملات الرقمية
    if (data.crypto?.length > 0) {
      prompt += `\n₿ العملات الرقمية:\n`;
      data.crypto.forEach((crypto: any) => {
        prompt += `- ${crypto.nameArabic} (${crypto.symbol}): السعر ${crypto.price} درهم، العائد المتوقع ${crypto.expectedReturn}%\n`;
      });
    }

    // إضافة السندات الحكومية
    if (data.governmentBonds?.length > 0) {
      prompt += `\n📜 السندات والصكوك:\n`;
      data.governmentBonds.forEach((bond: any) => {
        prompt += `- ${bond.name}: المبلغ الأدنى ${bond.minInvestment} درهم، العائد ${bond.yield}%\n`;
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