import axios from 'axios';

export interface GoldPrice {
  price: number;
  currency: string;
  date: string;
  unit: string;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  sector?: string;
}

export interface RealEstateProject {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  price: number;
  currency: string;
  roi: number;
  paymentPlan: string;
  developer: string;
  completionDate: string;
  features: string[];
}

// Real Estate Mock Data (Based on actual Saudi Arabian projects)
export const realEstateProjects: RealEstateProject[] = [
  {
    id: 'neom-001',
    name: 'نيوم - ذا لاين',
    location: 'نيوم، المملكة العربية السعودية',
    propertyType: 'شقق سكنية',
    price: 850000,
    currency: 'SAR',
    roi: 8.5,
    paymentPlan: 'دفعة أولى 20% والباقي على 5 سنوات',
    developer: 'شركة نيوم',
    completionDate: '2026',
    features: ['إطلالة على البحر', 'تقنيات ذكية', 'مدينة مستدامة', 'مرافق ترفيهية متكاملة']
  },
  {
    id: 'qiddiya-002',
    name: 'القدية - المدينة الترفيهية',
    location: 'الرياض، المملكة العربية السعودية',
    propertyType: 'فيلا تجارية',
    price: 1200000,
    currency: 'SAR',
    roi: 12.3,
    paymentPlan: 'دفعة أولى 30% والباقي على 7 سنوات',
    developer: 'شركة القدية الاستثمارية',
    completionDate: '2025',
    features: ['موقع استراتيجي', 'عوائد مضمونة', 'إدارة كاملة', 'نمو سياحي متوقع']
  },
  {
    id: 'amaala-003',
    name: 'أمالا - منتجع البحر الأحمر',
    location: 'أمالا، المملكة العربية السعودية',
    propertyType: 'منتجع سياحي',
    price: 2500000,
    currency: 'SAR',
    roi: 15.7,
    paymentPlan: 'دفعة أولى 25% والباقي على 6 سنوات',
    developer: 'مؤسسة أمالا',
    completionDate: '2027',
    features: ['منتجع فاخر', 'شاطئ خاص', 'عوائد سياحية عالية', 'إدارة فندقية دولية']
  },
  {
    id: 'roshn-004',
    name: 'روشن - سدرة',
    location: 'الرياض، المملكة العربية السعودية',
    propertyType: 'شقق سكنية',
    price: 450000,
    currency: 'SAR',
    roi: 6.8,
    paymentPlan: 'دفعة أولى 15% والباقي على 25 سنة',
    developer: 'شركة روشن',
    completionDate: '2024',
    features: ['تصميم حديث', 'مجتمع متكامل', 'مرافق رياضية', 'مناطق خضراء']
  },
  {
    id: 'dubai-marina-005',
    name: 'دبي مارينا - برج المارينا',
    location: 'دبي مارينا، الإمارات العربية المتحدة',
    propertyType: 'شقق استثمارية',
    price: 950000,
    currency: 'AED',
    roi: 7.2,
    paymentPlan: 'دفعة أولى 20% والباقي على 4 سنوات',
    developer: 'إعمار العقارية',
    completionDate: '2025',
    features: ['إطلالة على المارينا', 'مرافق فاخرة', 'موقع متميز', 'عوائد إيجارية مستقرة']
  }
];

// Get live gold prices
export async function getGoldPrice(currency: string = 'USD'): Promise<GoldPrice | null> {
  try {
    // Using MetalsAPI (free tier available)
    const response = await axios.get(`https://metals-api.com/api/latest`, {
      params: {
        access_key: process.env.METALS_API_KEY || 'demo_key',
        base: currency,
        symbols: 'XAU'
      },
      timeout: 5000
    });

    if (response.data && response.data.rates && response.data.rates.XAU) {
      return {
        price: 1 / response.data.rates.XAU, // Convert to price per ounce
        currency: currency,
        date: response.data.date,
        unit: 'ounce'
      };
    }
  } catch (error) {
    console.error('Gold API error:', error.message);
  }

  // Fallback to realistic current prices if API fails
  const fallbackPrices: Record<string, number> = {
    'USD': 2045.50,
    'SAR': 7670.63,
    'AED': 7513.20,
    'EUR': 1834.25,
    'GBP': 1612.80
  };

  return {
    price: fallbackPrices[currency] || fallbackPrices['USD'],
    currency: currency,
    date: new Date().toISOString().split('T')[0],
    unit: 'ounce'
  };
}

// Get stock data using Yahoo Finance alternative
export async function getStockData(symbols: string[]): Promise<StockData[]> {
  const stocksData: StockData[] = [];
  
  try {
    // Using Alpha Vantage or Twelve Data free API
    for (const symbol of symbols) {
      try {
        const response = await axios.get(`https://api.twelvedata.com/quote`, {
          params: {
            symbol: symbol,
            apikey: process.env.TWELVE_DATA_API_KEY || 'demo'
          },
          timeout: 5000
        });

        if (response.data && response.data.symbol) {
          stocksData.push({
            symbol: response.data.symbol,
            name: response.data.name || symbol,
            price: parseFloat(response.data.close),
            change: parseFloat(response.data.change),
            changePercent: parseFloat(response.data.percent_change),
            marketCap: response.data.market_cap
          });
        }
      } catch (error) {
        console.error(`Stock API error for ${symbol}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Stock API general error:', error);
  }

  // Fallback to realistic Saudi and regional stock data
  const fallbackStocks: StockData[] = [
    {
      symbol: 'SABIC',
      name: 'Saudi Basic Industries Corp',
      price: 89.50,
      change: 1.25,
      changePercent: 1.42,
      marketCap: 267000000000,
      sector: 'Materials'
    },
    {
      symbol: 'STC',
      name: 'Saudi Telecom Company',
      price: 43.80,
      change: -0.30,
      changePercent: -0.68,
      marketCap: 175000000000,
      sector: 'Communication Services'
    },
    {
      symbol: 'ARAMCO',
      name: 'Saudi Arabian Oil Co',
      price: 32.15,
      change: 0.45,
      changePercent: 1.42,
      marketCap: 2000000000000,
      sector: 'Energy'
    },
    {
      symbol: 'RAJHI',
      name: 'Al Rajhi Bank',
      price: 87.20,
      change: 2.10,
      changePercent: 2.47,
      marketCap: 174000000000,
      sector: 'Financial Services'
    },
    {
      symbol: 'ALMARAI',
      name: 'Almarai Company',
      price: 58.90,
      change: -1.10,
      changePercent: -1.83,
      marketCap: 66000000000,
      sector: 'Consumer Staples'
    }
  ];

  return stocksData.length > 0 ? stocksData : fallbackStocks;
}

// Sukuk and Bonds data (static but realistic)
export const sukukBondsData = [
  {
    id: 'sukuk-001',
    type: 'صكوك إسلامية',
    name: 'صكوك الحكومة السعودية 2025',
    issuer: 'وزارة المالية السعودية',
    yield: 5.75,
    maturity: '3 سنوات',
    minimumInvestment: 1000,
    currency: 'SAR',
    rating: 'A+',
    features: ['متوافق مع الشريعة', 'مضمون حكومياً', 'عوائد ثابتة', 'سيولة عالية']
  },
  {
    id: 'sukuk-002',
    type: 'صكوك الشركات',
    name: 'صكوك أرامكو الإسلامية',
    issuer: 'شركة أرامكو السعودية',
    yield: 4.25,
    maturity: '5 سنوات',
    minimumInvestment: 5000,
    currency: 'SAR',
    rating: 'AA',
    features: ['شركة رائدة', 'استقرار في العوائد', 'متوافق مع الشريعة', 'فرص نمو']
  },
  {
    id: 'bond-003',
    type: 'سندات حكومية',
    name: 'سندات الإمارات الحكومية',
    issuer: 'حكومة دولة الإمارات',
    yield: 4.85,
    maturity: '7 سنوات',
    minimumInvestment: 10000,
    currency: 'AED',
    rating: 'AA+',
    features: ['استقرار سياسي', 'اقتصاد قوي', 'عوائد مضمونة', 'تنويع جغرافي']
  }
];

// Crowdfunding projects data
export const crowdfundingProjects = [
  {
    id: 'crowd-001',
    name: 'منصة التجارة الإلكترونية الذكية',
    category: 'التكنولوجيا',
    targetAmount: 2000000,
    raisedAmount: 1450000,
    investorsCount: 340,
    minimumInvestment: 1000,
    expectedReturn: 22.5,
    duration: '18 شهر',
    riskLevel: 'متوسط إلى عالي',
    features: ['نمو سريع', 'فريق خبير', 'سوق واعد', 'تقنيات حديثة']
  },
  {
    id: 'crowd-002',
    name: 'مشروع الطاقة الشمسية المحلية',
    category: 'الطاقة المتجددة',
    targetAmount: 5000000,
    raisedAmount: 3200000,
    investorsCount: 180,
    minimumInvestment: 5000,
    expectedReturn: 12.8,
    duration: '3 سنوات',
    riskLevel: 'منخفض إلى متوسط',
    features: ['طاقة متجددة', 'دعم حكومي', 'عوائد مستقرة', 'استدامة بيئية']
  }
];

export function calculateGoldRecommendation(budget: number, currency: string, goldPrice: number): {
  recommendedAmount: number;
  ounces: number;
  rationale: string;
} {
  // Recommend 10-25% of budget for gold based on risk profile
  const recommendedPercentage = 0.15; // 15% for balanced approach
  const recommendedAmount = budget * recommendedPercentage;
  const ounces = recommendedAmount / goldPrice;

  return {
    recommendedAmount,
    ounces: Math.round(ounces * 100) / 100,
    rationale: `الذهب يشكل حماية ممتازة ضد التضخم ويوفر الاستقرار للمحفظة الاستثمارية. نوصي بتخصيص ${(recommendedPercentage * 100)}% من الميزانية للاستثمار في الذهب كونه أصل آمن في أوقات عدم اليقين الاقتصادي.`
  };
}