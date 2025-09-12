import { GoogleGenAI } from "@google/genai";
import { DataProcessor } from "./data-processor";
import { CurrencyConverter } from "./currency-converter";

interface UserInvestmentProfile {
  budget: number;
  currency: string;
  goals: string[];
  timeHorizon: string;
  riskTolerance: string;
  preferences: string[];
  targetMarket: string;
  islamicCompliance: boolean;
  paymentFrequency: string;
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
  downPayment?: number;
  monthlyInstallment?: number;
  yearlyInstallment?: number;
  financingPeriod?: number;
  paymentMethod?: string;
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
  private currencyConverter: CurrencyConverter;

  constructor() {
    this.ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "" 
    });
    this.dataProcessor = new DataProcessor();
    this.currencyConverter = CurrencyConverter.getInstance();
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

      // تحويل جميع البيانات إلى الدرهم الإماراتي وتصفيتها للسوق الإماراتي فقط
      const uaeOnlyData = this.filterForUAEMarketsOnly({
        stocks, realEstate, gold, bonds, crowdfunding, crypto, governmentBonds
      });
      
      // تحويل جميع العملات إلى الدرهم الإماراتي
      const convertedData = this.convertAllDataToAED(uaeOnlyData);
      
      // تصفية البيانات حسب تفضيلات المستخدم
      const filteredData = this.filterDataByPreferences(convertedData, profile);

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
      
      // Merge custom real estate payment calculations into AI recommendations
      const enhancedResult = this.mergeRealEstatePaymentLogic(result, filteredData, profile);
      
      console.log('✅ تم توليد', enhancedResult.recommendations.length, 'توصية ذكية');
      console.log('💰 إجمالي المبلغ المخصص:', enhancedResult.totalAllocated, 'درهم');

      return enhancedResult;

    } catch (error: any) {
      console.error('❌ خطأ في توليد التوصيات الذكية:', error);
      
      // Handle specific Gemini API errors
      if (error.status === 503 || error.message?.includes('overloaded')) {
        throw new Error('GEMINI_OVERLOADED');
      }
      
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
      5. **يجب أن تكون جميع النصوص باللغة العربية فقط** - analysis, strategy, riskAssessment, reason, asset names
      6. مستويات المخاطر: منخفض، متوسط، عالي (فقط هذه الكلمات)
      7. أسماء الأصول يجب أن تكون بالعربية: مثل "شركة إعمار العقارية" وليس "Emaar Properties"
      8. إجابتك يجب أن تكون باللغة العربية 100% بما في ذلك أسماء الشركات والأصول`,
      
      en: `You are a professional investment expert specialized in Gulf financial markets.
      Your task is to analyze the investor profile and provide accurate and detailed investment recommendations using only the real data available.
      
      Important rules:
      1. Choose investment instruments only from the available data
      2. Give specific amounts, not percentages
      3. Explain the allocation logic based on known investment strategies
      4. Ensure the total does not exceed the available budget
      5. **ALL texts MUST be in English ONLY** - analysis, strategy, riskAssessment, reason, asset names
      6. Risk levels: Low, Medium, High (only these exact words)
      7. Asset names must be in English: like "Emaar Properties" not "شركة إعمار العقارية"
      8. Your response must be 100% in English including company and asset names`,
      
      fr: `Vous êtes un expert en investissement professionnel spécialisé dans les marchés financiers du Golfe.
      Votre tâche est d'analyser le profil de l'investisseur et de fournir des recommandations d'investissement précises et détaillées en utilisant uniquement les données réelles disponibles.
      
      Règles importantes:
      1. Choisissez les instruments d'investissement uniquement parmi les données disponibles
      2. Donnez des montants spécifiques, pas des pourcentages
      3. Expliquez la logique de répartition basée sur des stratégies d'investissement connues
      4. Assurez-vous que le total ne dépasse pas le budget disponible
      5. **TOUS les textes DOIVENT être en français UNIQUEMENT** - analysis, strategy, riskAssessment, reason, asset names
      6. Niveaux de risque: Faible, Moyen, Élevé (uniquement ces mots exacts)
      7. Les noms d'actifs doivent être en français: comme "Emaar Properties" pas "شركة إعمار العقارية"
      8. Votre réponse doit être 100% en français y compris les noms d'entreprises et d'actifs`
    };

    return instructions[language as keyof typeof instructions] || instructions.ar;
  }

  private buildInvestmentPrompt(profile: UserInvestmentProfile, data: any): string {
    const { budget, goals, timeHorizon, riskTolerance, targetMarket, islamicCompliance, paymentFrequency, language } = profile;
    
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
        payment: `طريقة الدفع`,
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
        payment: `Payment method`,
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
        payment: `Méthode de paiement`,
        yes: `Oui`,
        no: `Non`
      }
    };

    const currentLang = prompts[language as keyof typeof prompts] || prompts.ar;
    
    let prompt = `${currentLang.intro}

1. ${currentLang.budget}: ${budget.toLocaleString()} AED
2. ${currentLang.goal}: ${goals.join(', ')}
3. ${currentLang.timeHorizon}: ${timeHorizon}
4. ${currentLang.risk}: ${riskTolerance}
5. ${currentLang.market}: ${targetMarket}
6. ${currentLang.islamic}: ${islamicCompliance ? currentLang.yes : currentLang.no}
7. ${currentLang.payment}: ${paymentFrequency}

8. ${currentLang.data}:

`;

    // إضافة بيانات الأسهم
    if (data.stocks?.length > 0) {
      prompt += `\n📈 ${currentLang.stocks}:\n`;
      data.stocks.slice(0, 8).forEach((stock: any) => {
        prompt += `- ${stock.nameArabic || stock.name}: AED ${stock.price}, Expected Return ${stock.expectedReturn || 'N/A'}%, Sector: ${stock.sector || 'N/A'}\n`;
      });
    }

    // إضافة بيانات الذهب
    if (data.gold?.length > 0) {
      prompt += `\n🥇 ${currentLang.gold}:\n`;
      data.gold.forEach((item: any) => {
        prompt += `- ${item.type}: AED ${item.pricePerGram} per gram\n`;
      });
    }

    // إضافة بيانات العقارات المحسنة مع تفاصيل الدفع
    if (data.realEstate?.length > 0) {
      prompt += `\n🏠 ${currentLang.realEstate} (Enhanced Analysis):\n`;
      data.realEstate.forEach((property: any) => {
        prompt += `- ${property.asset}: AED ${property.amount}`;
        if (property.downPayment) {
          prompt += `, Down Payment: AED ${property.downPayment}`;
        }
        if (property.monthlyInstallment) {
          prompt += `, Monthly: AED ${property.monthlyInstallment}`;
        }
        if (property.yearlyInstallment) {
          prompt += `, Yearly: AED ${property.yearlyInstallment}`;
        }
        prompt += `, Return: ${property.expectedReturn}%, Location: ${property.location || 'N/A'}`;
        prompt += `, Payment Method: ${property.paymentMethod}`;
        prompt += `\n  Reason: ${property.reason}\n`;
      });
    }
    
    // إضافة البدائل العقارية إذا كانت متوفرة
    if (data.realEstateAlternatives?.length > 0) {
      prompt += `\n🏠 Real Estate Alternatives (REITs/Crowdfunding):\n`;
      data.realEstateAlternatives.forEach((alternative: any) => {
        prompt += `- ${alternative.message}\n`;
        prompt += `  Recommended: ${alternative.recommendedOptions.join(', ')}\n`;
        prompt += `  Reason: ${alternative.reason}\n`;
      });
    }

    // إضافة مشاريع التمويل الجماعي
    if (data.crowdfunding?.length > 0) {
      prompt += `\n👥 ${currentLang.crowdfunding}:\n`;
      data.crowdfunding.forEach((project: any) => {
        prompt += `- ${project.name}: Minimum AED ${project.minInvestment}, Expected Return ${project.expectedReturn || 'N/A'}%\n`;
      });
    }

    // إضافة العملات الرقمية
    if (data.crypto?.length > 0) {
      prompt += `\n₿ ${currentLang.crypto}:\n`;
      data.crypto.forEach((crypto: any) => {
        prompt += `- ${crypto.nameArabic} (${crypto.symbol}): AED ${crypto.price}, Expected Return ${crypto.expectedReturn || 'N/A'}%\n`;
      });
    }

    // إضافة السندات الحكومية
    if (data.governmentBonds?.length > 0) {
      prompt += `\n📜 Bonds & Sukuk:\n`;
      data.governmentBonds.forEach((bond: any) => {
        prompt += `- ${bond.name}: Minimum AED ${bond.minInvestment}, Yield ${bond.yield || 'N/A'}%\n`;
      });
    }

    prompt += `\n❗ المطلوب منك:
1. تقسيم الميزانية إلى مبالغ محددة (وليس نسب مئوية) موزعة على الأصول المناسبة
2. اختر الأدوات الاستثمارية من البيانات المتوفرة فقط (لا تقترح أدوات من خارج القائمة)
3. اشرح منطق التوزيع بناءً على استراتيجيات استثمار مشهورة
4. يجب أن تكون التوصية مفصلة مثل: "50000 درهم في 588 سهم من شركة إعمار بسعر 85 درهم"
5. قدم تحليلاً موجزاً يشرح سبب اختيار هذا التوزيع

تأكد أن إجمالي المبالغ لا يتجاوز ${budget} درهم إماراتي المتاحة.`;

    return prompt;
  }

  /**
   * Filter all data to UAE markets only (DFM, ADX, UAE real estate, UAE gold)
   */
  private filterForUAEMarketsOnly(data: any) {
    return {
      stocks: data.stocks.filter((stock: any) => 
        stock.exchange === 'DFM' || 
        stock.exchange === 'ADX' || 
        stock.market === 'UAE' ||
        stock.country === 'الإمارات' ||
        stock.country === 'UAE'
      ),
      realEstate: data.realEstate.filter((property: any) => 
        property.country === 'UAE' || 
        property.location === 'الإمارات' ||
        property.location?.includes('UAE') ||
        property.location?.includes('Dubai') ||
        property.location?.includes('Abu Dhabi') ||
        property.location?.includes('Sharjah')
      ),
      gold: data.gold.filter((item: any) => 
        item.supplier?.includes('UAE') || 
        item.location?.includes('Dubai') ||
        !item.location || // Include generic gold items
        item.supplier?.includes('Dubai')
      ),
      bonds: data.bonds.filter((bond: any) => 
        bond.issuer?.includes('UAE') || 
        bond.country === 'UAE' ||
        bond.market === 'UAE'
      ),
      crowdfunding: data.crowdfunding.filter((project: any) => 
        project.country === 'UAE' || 
        project.location?.includes('UAE') ||
        project.location?.includes('Dubai')
      ),
      crypto: data.crypto, // Crypto is location-independent
      governmentBonds: data.governmentBonds.filter((bond: any) => 
        bond.issuer?.includes('UAE') || 
        bond.country === 'UAE'
      )
    };
  }

  /**
   * Convert all market data to AED currency
   */
  private convertAllDataToAED(data: any) {
    return {
      stocks: this.currencyConverter.convertMarketDataToAED(data.stocks),
      realEstate: this.currencyConverter.convertMarketDataToAED(data.realEstate),
      gold: this.currencyConverter.convertMarketDataToAED(data.gold),
      bonds: this.currencyConverter.convertMarketDataToAED(data.bonds),
      crowdfunding: this.currencyConverter.convertMarketDataToAED(data.crowdfunding),
      crypto: this.currencyConverter.convertMarketDataToAED(data.crypto),
      governmentBonds: this.currencyConverter.convertMarketDataToAED(data.governmentBonds)
    };
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

    // تصفية الأسهم (الآن مقتصرة على الإمارات فقط)
    if (profile.preferences.includes('stocks')) {
      filtered.stocks = data.stocks; // Already filtered for UAE markets
    }

    // تصفية العقارات باستخدام المنطق المحسن للدفع
    if (profile.preferences.includes('real-estate')) {
      const realEstateAnalysis = this.analyzeRealEstateOptions(profile, data.realEstate);
      filtered.realEstate = realEstateAnalysis.recommendations;
      filtered.realEstateAlternatives = realEstateAnalysis.alternatives;
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

  /**
   * Enhanced real estate logic with payment method calculations
   */
  private analyzeRealEstateOptions(profile: UserInvestmentProfile, realEstateData: any[]) {
    const budget = profile.budget;
    const paymentMethod = profile.paymentFrequency;
    const language = profile.language || 'ar';
    
    console.log(`🏠 Analyzing real estate options for budget: ${budget} AED, payment method: ${paymentMethod}`);
    
    const realEstateRecommendations: any[] = [];
    const alternatives: any[] = [];
    
    // Real estate threshold for direct investment: 100,000 AED
    const DIRECT_REAL_ESTATE_THRESHOLD = 100000;
    const DOWN_PAYMENT_PERCENTAGE = 0.20; // 20% down payment
    const FINANCING_PERIOD_YEARS = 5; // Default financing period
    
    if (paymentMethod === 'One-time payment') {
      // One-time payment logic
      if (budget < DIRECT_REAL_ESTATE_THRESHOLD) {
        // Recommend alternatives: REITs or crowdfunding
        const message = language === 'ar' 
          ? `مبلغ الاستثمار الخاص بك غير كافٍ للاستثمار العقاري المباشر بدفعة واحدة. البدائل المقترحة: صناديق الاستثمار العقاري (REITs) أو منصات التمويل الجماعي.`
          : `Your investment amount is not enough for direct real estate with a single payment. Suggested alternatives: REITs or crowdfunding.`;
          
        alternatives.push({
          type: 'alternative',
          message,
          recommendedOptions: ['REITs', 'crowdfunding'],
          reason: language === 'ar' 
            ? 'المبلغ أقل من الحد الأدنى للاستثمار العقاري المباشر (100,000 درهم)'
            : 'Amount below minimum threshold for direct real estate investment (100,000 AED)'
        });
      } else {
        // Allow direct property investment
        const suitableProperties = realEstateData.filter((property: any) => {
          const propertyPrice = property.price || property.startingPrice || 0;
          return propertyPrice <= budget;
        });
        
        suitableProperties.forEach((property: any) => {
          const propertyPrice = property.price || property.startingPrice || 0;
          const downPayment = propertyPrice * DOWN_PAYMENT_PERCENTAGE;
          
          if (budget >= propertyPrice) {
            const message = language === 'ar'
              ? `يمكنك تحمل استثمار عقاري مباشر. الدفعة المقدرة: ${downPayment.toLocaleString()} درهم.`
              : `You can afford a direct property investment. Estimated down payment: ${downPayment.toLocaleString()} AED.`;
              
            realEstateRecommendations.push({
              asset: property.name || property.title,
              category: 'real-estate',
              amount: propertyPrice,
              quantity: '1 property',
              reason: message,
              expectedReturn: property.expectedReturn || property.roi || 7,
              riskLevel: 'متوسط',
              downPayment: downPayment,
              paymentMethod: 'One-time payment',
              location: property.location,
              developer: property.developer
            });
          }
        });
      }
    } else if (paymentMethod === 'Monthly') {
      // Monthly payment logic
      const suitableProperties = realEstateData.filter((property: any) => {
        const propertyPrice = property.price || property.startingPrice || 0;
        const downPayment = propertyPrice * DOWN_PAYMENT_PERCENTAGE;
        return downPayment <= budget; // Budget should cover down payment
      });
      
      suitableProperties.forEach((property: any) => {
        const propertyPrice = property.price || property.startingPrice || 0;
        const downPayment = propertyPrice * DOWN_PAYMENT_PERCENTAGE;
        const remainingAmount = propertyPrice - downPayment;
        const monthlyInstallment = remainingAmount / (FINANCING_PERIOD_YEARS * 12);
        
        if (budget >= downPayment) {
          const message = language === 'ar'
            ? `يمكنك تحمل استثمار عقاري مباشر. الدفعة المقدرة: ${downPayment.toLocaleString()} درهم. الأقساط الشهرية: ${monthlyInstallment.toLocaleString()} درهم لمدة ${FINANCING_PERIOD_YEARS} سنوات.`
            : `You can afford a direct property investment. Estimated down payment: ${downPayment.toLocaleString()} AED. Monthly installments: ${monthlyInstallment.toLocaleString()} AED for ${FINANCING_PERIOD_YEARS} years.`;
            
          realEstateRecommendations.push({
            asset: property.name || property.title,
            category: 'real-estate',
            amount: downPayment,
            quantity: '1 property',
            reason: message,
            expectedReturn: property.expectedReturn || property.roi || 7,
            riskLevel: 'متوسط',
            downPayment: downPayment,
            monthlyInstallment: monthlyInstallment,
            financingPeriod: FINANCING_PERIOD_YEARS,
            paymentMethod: 'Monthly',
            location: property.location,
            developer: property.developer
          });
        }
      });
    } else if (paymentMethod === 'Yearly') {
      // Yearly payment logic
      const suitableProperties = realEstateData.filter((property: any) => {
        const propertyPrice = property.price || property.startingPrice || 0;
        const downPayment = propertyPrice * DOWN_PAYMENT_PERCENTAGE;
        return downPayment <= budget; // Budget should cover down payment
      });
      
      suitableProperties.forEach((property: any) => {
        const propertyPrice = property.price || property.startingPrice || 0;
        const downPayment = propertyPrice * DOWN_PAYMENT_PERCENTAGE;
        const remainingAmount = propertyPrice - downPayment;
        const yearlyInstallment = remainingAmount / FINANCING_PERIOD_YEARS;
        
        if (budget >= downPayment) {
          const message = language === 'ar'
            ? `يمكنك تحمل استثمار عقاري مباشر. الدفعة المقدرة: ${downPayment.toLocaleString()} درهم. الأقساط السنوية: ${yearlyInstallment.toLocaleString()} درهم لمدة ${FINANCING_PERIOD_YEARS} سنوات.`
            : `You can afford a direct property investment. Estimated down payment: ${downPayment.toLocaleString()} AED. Yearly installments: ${yearlyInstallment.toLocaleString()} AED for ${FINANCING_PERIOD_YEARS} years.`;
            
          realEstateRecommendations.push({
            asset: property.name || property.title,
            category: 'real-estate',
            amount: downPayment,
            quantity: '1 property',
            reason: message,
            expectedReturn: property.expectedReturn || property.roi || 7,
            riskLevel: 'متوسط',
            downPayment: downPayment,
            yearlyInstallment: yearlyInstallment,
            financingPeriod: FINANCING_PERIOD_YEARS,
            paymentMethod: 'Yearly',
            location: property.location,
            developer: property.developer
          });
        }
      });
    }
    
    return {
      recommendations: realEstateRecommendations,
      alternatives: alternatives
    };
  }

  /**
   * Merge custom real estate payment logic into AI-generated recommendations
   */
  private mergeRealEstatePaymentLogic(aiResult: SmartRecommendationResult, filteredData: any, profile: UserInvestmentProfile): SmartRecommendationResult {
    console.log('🔄 Merging custom payment logic with AI recommendations...');
    
    const enhancedRecommendations = aiResult.recommendations.map((aiRec) => {
      // If this is a real estate recommendation, merge with custom payment logic
      if (aiRec.category === 'real-estate' && filteredData.realEstate && filteredData.realEstate.length > 0) {
        // Find matching real estate data with payment calculations
        const matchingRealEstate = filteredData.realEstate.find((reData: any) => 
          reData.asset === aiRec.asset || 
          (reData.asset && aiRec.asset && reData.asset.toLowerCase().includes(aiRec.asset.toLowerCase().substring(0, 10)))
        );
        
        if (matchingRealEstate) {
          console.log(`🏠 Merging payment details for ${aiRec.asset}`);
          
          return {
            ...aiRec,
            downPayment: matchingRealEstate.downPayment,
            monthlyInstallment: matchingRealEstate.monthlyInstallment,
            yearlyInstallment: matchingRealEstate.yearlyInstallment,
            financingPeriod: matchingRealEstate.financingPeriod,
            paymentMethod: matchingRealEstate.paymentMethod,
            location: matchingRealEstate.location,
            developer: matchingRealEstate.developer,
            // Override amount if using installments
            amount: matchingRealEstate.paymentMethod === 'One-time payment' 
              ? matchingRealEstate.amount 
              : matchingRealEstate.downPayment || matchingRealEstate.amount
          };
        }
      }
      
      return aiRec;
    });

    return {
      ...aiResult,
      recommendations: enhancedRecommendations
    };
  }
}