import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userDataSchema } from "@shared/schema";
import { SmartInvestmentEngine } from "./smart-investment-engine";
import { DataProcessor } from "./data-processor";

// Smart Investment Engine using Gemini AI

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Firebase Auth - Save user to database
  app.post("/api/auth/save-user", async (req, res) => {
    try {
      console.log('📥 Save user request received:', JSON.stringify(req.body, null, 2));
      const { id, email, name, photoURL } = req.body;
      
      if (!id) {
        console.error('❌ No user ID provided in request');
        return res.status(400).json({ message: "User ID (Firebase UID) is required" });
      }
      
      console.log('✅ Valid Firebase UID received:', id);
      
      const userData = {
        id,
        email: email || null,
        name: name || null,
        photoURL: photoURL || null,
      };
      
      console.log('💾 Attempting to save user:', userData);
      const user = await storage.saveUser(userData);
      console.log('✅ User saved successfully:', user.id);
      
      res.json(user);
    } catch (error: any) {
      console.error("❌ Critical error saving user:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint
      });
      res.status(500).json({ 
        message: "Failed to save user", 
        error: error.message,
        code: error.code 
      });
    }
  });
  
  // Analyze investment data using AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const userData = userDataSchema.parse(req.body);
      
      // Ensure user exists in database if Firebase UID is provided
      if (userData.userId) {
        console.log('🔍 فحص وجود المستخدم:', userData.userId);
        try {
          const existingUser = await storage.getUser(userData.userId);
          if (!existingUser) {
            console.log('👤 إنشاء مستخدم جديد...');
            await storage.saveUser({
              id: userData.userId,
              email: null,
              name: null,
              photoURL: null,
            });
            console.log('✅ تم إنشاء مستخدم جديد تلقائياً:', userData.userId);
          } else {
            console.log('✅ المستخدم موجود بالفعل:', userData.userId);
          }
        } catch (userError) {
          console.error('❌ خطأ في إدارة المستخدم:', userError);
          // Try to create user anyway
          try {
            await storage.saveUser({
              id: userData.userId,
              email: null,
              name: null,
              photoURL: null,
            });
            console.log('✅ تم إنشاء المستخدم في المحاولة الثانية');
          } catch (createError) {
            console.error('❌ فشل في إنشاء المستخدم:', createError);
          }
        }
      }
      
      // Generate smart investment recommendations using Gemini AI
      console.log('🧠 بدء نظام التوصية الذكي الجديد...');
      
      const investmentEngine = new SmartInvestmentEngine();
      const investmentProfile = {
        budget: parseInt(userData.investmentBudget.replace(/,/g, '')),
        currency: userData.currency,
        goals: userData.goals,
        timeHorizon: userData.age === '18-25' ? 'طويل الأجل' : 
                    userData.age === '26-35' ? 'متوسط إلى طويل الأجل' : 'متوسط الأجل',
        riskTolerance: userData.riskTolerance,
        preferences: userData.preferences,
        targetMarket: userData.targetMarket,
        islamicCompliance: userData.islamicCompliance,
        language: userData.language || 'ar'
      };

      const aiAnalysis = await investmentEngine.generateSmartRecommendations(investmentProfile);
      console.log('✅ تم توليد التوصيات الذكية بنجاح');
      
      // Store the analysis with proper format for database
      const formattedAnalysis = {
        id: `analysis_${Date.now()}`, // Add required ID field
        userData,
        strategy: aiAnalysis.strategy,
        riskProfile: aiAnalysis.riskAssessment,
        recommendations: aiAnalysis.recommendations.map((rec: any, index: number) => ({
          id: rec.asset + '_' + (index + 1),
          type: rec.category,
          category: rec.category as any,
          title: rec.asset,
          asset: rec.asset,  // اسم الأصل المالي
          description: rec.reason,
          reason: rec.reason,  // سبب التوصية
          price: rec.amount.toString(),
          amount: rec.amount,  // المبلغ بصيغة رقمية
          quantity: rec.quantity,  // الكمية
          expectedReturn: typeof rec.expectedReturn === 'number' 
            ? (rec.expectedReturn * 100).toFixed(1)  
            : rec.expectedReturn.toString(),  // العائد المتوقع كنسبة مئوية
          paymentPlan: 'N/A',
          riskLevel: rec.riskLevel as any,
          timeline: '1 year',
          recommendation: 'شراء قوي' as any,
          minimumInvestment: rec.amount.toString(),
          features: [rec.reason]
        })),
        totalAllocated: aiAnalysis.totalAllocated,
        remainingAmount: parseInt(userData.investmentBudget.replace(/,/g, '')) - aiAnalysis.totalAllocated,
        analysis: aiAnalysis.analysis,
        generatedAt: new Date().toISOString()
      };
      
      const analysis = await storage.createInvestmentAnalysis({
        userId: userData.userId || null, // Use Firebase UID if provided, null for anonymous users
        age: userData.age,
        income: userData.income,
        investmentBudget: userData.investmentBudget,
        currency: userData.currency,
        goals: Array.from(userData.goals),
        riskTolerance: userData.riskTolerance,
        preferences: Array.from(userData.preferences),
        targetMarket: userData.targetMarket,
        allowDiversification: userData.allowDiversification ? 'true' : 'false',
        islamicCompliance: userData.islamicCompliance ? 'true' : 'false',
        paymentFrequency: userData.paymentFrequency,
        language: userData.language,
        recommendations: formattedAnalysis
      });
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      // Handle Gemini API overload specifically
      if (error.message === 'GEMINI_OVERLOADED') {
        return res.status(503).json({ 
          message: 'خدمة الذكاء الاصطناعي محمّلة حالياً. يرجى المحاولة بعد دقيقة.',
          error: 'gemini_overloaded',
          retryAfter: 60
        });
      }
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'بيانات غير صحيحة',
          error: 'validation_error',
          details: error.errors 
        });
      }
      
      // General error
      res.status(500).json({ 
        message: error.message || 'خطأ في الخادم، يرجى المحاولة مرة أخرى',
        error: 'internal_error'
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

  // Market data endpoint (AED-only, UAE markets focus)
  app.get("/api/market-data", async (req, res) => {
    try {
      const currencyConverter = (await import("./currency-converter")).CurrencyConverter.getInstance();
      
      // UAE Gold prices in AED
      const goldPriceAED = {
        pricePerGram: 248.50, // Current UAE gold price per gram in AED
        currency: 'AED',
        market: 'UAE'
      };

      // UAE Stock exchanges (DFM/ADX) sample data in AED
      const uaeStocks = [
        { symbol: 'EMAAR', name: 'إعمار العقارية', price: 5.45, exchange: 'DFM', currency: 'AED' },
        { symbol: 'DIB', name: 'بنك دبي الإسلامي', price: 6.82, exchange: 'DFM', currency: 'AED' },
        { symbol: 'ADNOC', name: 'أدنوك للتوزيع', price: 3.76, exchange: 'ADX', currency: 'AED' },
        { symbol: 'FAB', name: 'بنك أبوظبي الأول', price: 15.20, exchange: 'ADX', currency: 'AED' }
      ];

      // UAE Real Estate projects in AED
      const uaeRealEstate = [
        { 
          name: 'Dubai Creek Harbour', 
          developer: 'Emaar', 
          startingPrice: 1200000, 
          currency: 'AED',
          location: 'Dubai',
          type: 'Residential'
        },
        { 
          name: 'Al Reem Island', 
          developer: 'Aldar', 
          startingPrice: 850000, 
          currency: 'AED',
          location: 'Abu Dhabi',
          type: 'Residential'
        }
      ];

      res.json({
        goldPrice: goldPriceAED,
        activeStocks: uaeStocks,
        newRealEstateProjects: uaeRealEstate,
        lastUpdated: new Date().toISOString(),
        market: 'UAE',
        currency: 'AED'
      });
    } catch (error: any) {
      console.error("Market data error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات السوق" });
    }
  });

  // Financial news endpoint with caching for performance
  const newsCache = new Map<string, { data: any[], timestamp: number }>();
  const NEWS_CACHE_DURATION = 300000; // 5 minutes

  app.get("/api/financial-news", async (req, res) => {
    try {
      const lang = (req.query.lang as string) || 'ar';
      const cacheKey = `news_${lang}`;
      
      // Check cache first
      const cached = newsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < NEWS_CACHE_DURATION) {
        return res.json(cached.data);
      }

      // Mock financial news data (in production, use RSS or NewsAPI)
      const mockNews = {
        ar: [
          {
            title: "السوق السعودي يحقق مكاسب قوية وسط توقعات إيجابية للاقتصاد",
            description: "ارتفعت الأسهم السعودية بنسبة 2.1% مدفوعة بقطاع البتروكيماويات والبنوك",
            url: "https://example.com/news/1",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            source: "العربية الاقتصادية"
          },
          {
            title: "مصرف الإمارات المركزي يطلق منصة رقمية جديدة للخدمات المصرفية",
            description: "المنصة تهدف لتعزيز الشمول المالي وتطوير قطاع التكنولوجيا المالية في الإمارات",
            url: "https://example.com/news/2",
            publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            source: "الإمارات اليوم"
          },
          {
            title: "صندوق الاستثمارات العامة يعلن عن استثمارات جديدة بقيمة 50 مليار ريال",
            description: "تركز الاستثمارات على التقنية المالية والطاقة المتجددة والذكاء الاصطناعي",
            url: "https://example.com/news/3",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: "الاقتصادية"
          },
          {
            title: "أسعار الذهب تواصل الارتفاع مع تزايد المخاوف التضخمية",
            description: "سجل الذهب أعلى مستوياته في 3 أشهر وسط توقعات برفع أسعار الفائدة",
            url: "https://example.com/news/3",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            source: "بلومبرغ العربية"
          },
          {
            title: "قطاع العقارات في دبي يشهد نمواً قوياً بنسبة 15% خلال الربع الثالث",
            description: "ارتفاع أسعار العقارات مدفوع بالطلب المحلي والاستثمار الأجنبي المباشر",
            url: "https://example.com/news/4",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            source: "الإمارات اليوم"
          },
          {
            title: "بورصة أبوظبي تسجل أعلى مستوى لها في العام الجاري",
            description: "المؤشر العام يرتفع 3.2% مدفوعاً بأداء قوي لأسهم البنوك والطاقة",
            url: "https://example.com/news/5",
            publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
            source: "البيان الاقتصادي"
          },
          {
            title: "شركة أرامكو السعودية تعلن عن استثمارات في الطاقة المتجددة بـ15 مليار دولار",
            description: "الاستثمارات تركز على الهيدروجين الأخضر والطاقة الشمسية وتقنيات تخزين الطاقة",
            url: "https://example.com/news/6",
            publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
            source: "العربية نت"
          },
          {
            title: "إعمار العقارية تطلق مشروعاً سكنياً جديداً بقيمة 8 مليار درهم",
            description: "المشروع يتضمن 3,500 وحدة سكنية ومرافق تجارية في منطقة دبي الجنوبية",
            url: "https://example.com/news/7",
            publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
            source: "الخليج الاقتصادي"
          },
          {
            title: "البنك المركزي السعودي يبقي أسعار الفائدة دون تغيير عند 5.5%",
            description: "قرار يأتي وسط استقرار مؤشرات التضخم وتحسن النمو الاقتصادي",
            url: "https://example.com/news/8",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            source: "رويترز العربية"
          }
        ],
        en: [
          {
            title: "Saudi Market Achieves Strong Gains Amid Positive Economic Outlook",
            description: "Saudi stocks rose 2.1% driven by petrochemical and banking sectors",
            url: "https://example.com/news/1",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: "Arabia Business"
          },
          {
            title: "UAE Central Bank Launches New Digital Banking Platform",
            description: "Platform aims to enhance financial inclusion and develop fintech sector",
            url: "https://example.com/news/2",
            publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            source: "Emirates Today"
          },
          {
            title: "Public Investment Fund Announces New $13.3B Investment Initiative",
            description: "Investments focus on fintech, renewable energy, and artificial intelligence",
            url: "https://example.com/news/3",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: "Financial Times"
          },
          {
            title: "Gold Prices Continue Rising Amid Inflation Concerns",
            description: "Gold hits 3-month high as interest rate hike expectations grow",
            url: "https://example.com/news/3",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            source: "Bloomberg"
          },
          {
            title: "Dubai Real Estate Sector Shows Strong 15% Growth in Q3",
            description: "Property price increases driven by local demand and foreign direct investment",
            url: "https://example.com/news/4",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            source: "Gulf News"
          },
          {
            title: "Abu Dhabi Securities Exchange Hits Yearly High",
            description: "Main index rises 3.2% driven by strong banking and energy stocks performance",
            url: "https://example.com/news/5",
            publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
            source: "Gulf News"
          },
          {
            title: "Saudi Aramco Announces $15B Renewable Energy Investment",
            description: "Investments focus on green hydrogen, solar power, and energy storage technologies",
            url: "https://example.com/news/6",
            publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
            source: "Arabia Business"
          },
          {
            title: "Saudi Central Bank Keeps Interest Rates Unchanged at 5.5%",
            description: "Decision comes amid stable inflation indicators and improved economic growth",
            url: "https://example.com/news/7",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            source: "Reuters"
          }
        ],
        fr: [
          {
            title: "Le Marché Saoudien Réalise des Gains Solides avec des Perspectives Économiques Positives",
            description: "Les actions saoudiennes ont augmenté de 2,1% portées par les secteurs pétrochimique et bancaire",
            url: "https://example.com/news/1",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: "Arabia Business FR"
          },
          {
            title: "La Banque Centrale des Émirats Lance une Nouvelle Plateforme Bancaire Numérique",
            description: "La plateforme vise à renforcer l'inclusion financière et développer le secteur fintech",
            url: "https://example.com/news/2",
            publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            source: "Emirates Today FR"
          },
          {
            title: "Le Fonds d'Investissement Public Annonce une Nouvelle Initiative de 50 Milliards SAR",
            description: "Les investissements se concentrent sur la fintech, l'énergie renouvelable et l'IA",
            url: "https://example.com/news/3",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: "Les Échos"
          },
          {
            title: "Les Prix de l'Or Continuent à Augmenter en Raison des Préoccupations Inflationnistes",
            description: "L'or atteint son plus haut niveau en 3 mois alors que les attentes de hausse des taux croissent",
            url: "https://example.com/news/3",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            source: "Bloomberg France"
          },
          {
            title: "Le Secteur Immobilier de Dubaï Affiche une Forte Croissance de 15% au T3",
            description: "Hausse des prix immobiliers alimentée par la demande locale et l'IDE",
            url: "https://example.com/news/4",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            source: "Gulf News FR"
          },
          {
            title: "La Bourse d'Abu Dhabi Atteint son Plus Haut Niveau de l'Année",
            description: "L'indice principal monte de 3,2% porté par les performances des banques et de l'énergie",
            url: "https://example.com/news/5",
            publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
            source: "Gulf News FR"
          },
          {
            title: "Aramco Saoudite Annonce 15 Milliards $ d'Investissements dans l'Énergie Renouvelable",
            description: "Les investissements portent sur l'hydrogène vert, l'énergie solaire et les technologies de stockage",
            url: "https://example.com/news/6",
            publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
            source: "Arabia Business FR"
          },
          {
            title: "La Banque Centrale Saoudienne Maintient les Taux d'Intérêt à 5,5%",
            description: "Décision prise dans un contexte d'indicateurs d'inflation stables et de croissance économique améliorée",
            url: "https://example.com/news/7",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            source: "Reuters France"
          }
        ]
      };

      const newsData = mockNews[lang as keyof typeof mockNews] || mockNews.ar;
      
      // Cache the result
      newsCache.set(cacheKey, { data: newsData, timestamp: Date.now() });
      
      res.json(newsData);
    } catch (error: any) {
      console.error("News API error:", error);
      res.status(500).json({ message: "خطأ في جلب الأخبار" });
    }
  });

  // Data processing endpoints
  app.get("/api/data-summary", async (req, res) => {
    try {
      const dataProcessor = new DataProcessor();
      const summary = await dataProcessor.getAllDataSummary();
      res.json(summary);
    } catch (error: any) {
      console.error("Data summary error:", error);
      res.status(500).json({ message: "خطأ في جلب ملخص البيانات" });
    }
  });

  app.get("/api/data/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const dataProcessor = new DataProcessor();
      const data = await dataProcessor.loadData(type);
      res.json(data);
    } catch (error: any) {
      console.error("Data load error:", error);
      res.status(500).json({ message: "خطأ في جلب البيانات" });
    }
  });

  app.post("/api/process-excel", async (req, res) => {
    try {
      const { filePath, dataType } = req.body;
      
      if (!filePath || !dataType) {
        return res.status(400).json({ message: "مسار الملف ونوع البيانات مطلوبان" });
      }

      const dataProcessor = new DataProcessor();
      await dataProcessor.processExcelFile(filePath, dataType);

      res.json({
        success: true,
        message: `تم معالجة ملف ${dataType} بنجاح`
      });
    } catch (error: any) {
      console.error("Excel processing error:", error);
      res.status(500).json({ message: "خطأ في معالجة ملف Excel" });
    }
  });

  // Health check endpoint for deployment monitoring  
  app.get("/api/health", (req, res) => {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: "2.0.0",
      features: {
        marketData: true,
        goldPrices: true,
        currencyConversion: true,
        financialNews: true,
        multilingual: true
      }
    };
    res.json(healthCheck);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// This function is deprecated - using SmartInvestmentEngine instead
