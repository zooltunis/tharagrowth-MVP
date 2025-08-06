import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userDataSchema } from "@shared/schema";
import { SmartInvestmentEngine } from "./smart-investment-engine";

// Smart Investment Engine using Gemini AI

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze investment data using AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const userData = userDataSchema.parse(req.body);
      
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
        islamicCompliance: userData.islamicCompliance
      };

      const aiAnalysis = await investmentEngine.generateSmartRecommendations(investmentProfile);
      console.log('✅ تم توليد التوصيات الذكية بنجاح');
      
      // Store the analysis  
      const analysis = await storage.createInvestmentAnalysis({
        ...userData,
        allowDiversification: userData.allowDiversification ? 'true' : 'false',
        islamicCompliance: userData.islamicCompliance ? 'true' : 'false',
        recommendations: aiAnalysis
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

  // Simple market data endpoint (using static data)
  app.get("/api/market-data", async (req, res) => {
    try {
      res.json({
        goldPrice: { pricePerGram: 246.68, currency: 'AED' },
        timestamp: new Date().toISOString()
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
            title: "صندوق الاستثمارات العامة يعلن عن استثمارات جديدة بقيمة 50 مليار ريال",
            description: "تركز الاستثمارات على التقنية المالية والطاقة المتجددة والذكاء الاصطناعي",
            url: "https://example.com/news/2",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
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
            title: "البنك المركزي السعودي يبقي أسعار الفائدة دون تغيير عند 5.5%",
            description: "قرار يأتي وسط استقرار مؤشرات التضخم وتحسن النمو الاقتصادي",
            url: "https://example.com/news/5",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
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
            title: "Public Investment Fund Announces New $13.3B Investment Initiative",
            description: "Investments focus on fintech, renewable energy, and artificial intelligence",
            url: "https://example.com/news/2",
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
            title: "Saudi Central Bank Keeps Interest Rates Unchanged at 5.5%",
            description: "Decision comes amid stable inflation indicators and improved economic growth",
            url: "https://example.com/news/5",
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
            title: "Le Fonds d'Investissement Public Annonce une Nouvelle Initiative de 50 Milliards SAR",
            description: "Les investissements se concentrent sur la fintech, l'énergie renouvelable et l'IA",
            url: "https://example.com/news/2",
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
            title: "La Banque Centrale Saoudienne Maintient les Taux d'Intérêt à 5,5%",
            description: "Décision prise dans un contexte d'indicateurs d'inflation stables et de croissance économique améliorée",
            url: "https://example.com/news/5",
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

async function generateInvestmentRecommendations(userData: any) {
  console.log('🧠 Starting recommendation generation with Gemini AI engine');
  console.log('📊 User Data:', {
    age: userData.age,
    income: userData.income,
    budget: userData.investmentBudget,
    risk: userData.riskTolerance,
    goals: userData.goals,
    preferences: userData.preferences,
    targetMarket: userData.targetMarket,
    islamicCompliance: userData.islamicCompliance,
    paymentFrequency: userData.paymentFrequency
  });
  
  console.log('🔑 Using Gemini API Key:', process.env.GEMINI_API_KEY ? 'Available' : 'Missing');
  
  try {
    const geminiEngine = new GeminiRecommendationEngine();
    const result = await geminiEngine.generateRecommendations(userData);
    console.log('✅ Gemini AI recommendations generated successfully');
    console.log('📈 Generated', result.recommendations.length, 'AI-powered recommendations');
    console.log('💰 Total allocated:', result.totalAllocated, userData.currency);
    return result;
  } catch (error) {
    console.error('❌ Error generating AI recommendations:', error);
    throw error; // Don't fallback, show the actual error
  }
}

// This function is deprecated - using SmartRecommendationEngine instead
