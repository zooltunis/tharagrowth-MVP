import { DetailedRecommendation } from '@shared/schema';

// Mock investment database - ready for future API integration
export const investmentDatabase = {
  'real-estate': [
    {
      id: 'dubai-tower-001',
      type: 'عقارات سكنية',
      category: 'real-estate' as const,
      title: 'مشروع دبي هايتس تاور',
      description: 'أبراج سكنية فاخرة في قلب دبي مع إطلالة على برج خليفة',
      price: 'يبدأ من 850,000 درهم',
      expectedReturn: '7.2% سنوياً',
      paymentPlan: '15% مقدم + أقساط على 4 سنوات',
      riskLevel: 'منخفض' as const,
      timeline: '2-3 سنوات',
      recommendation: 'شراء قوي' as const,
      location: 'دبي - وسط المدينة',
      minimumInvestment: '127,500 درهم',
      features: ['إطلالة على برج خليفة', 'مرافق رياضية', 'أمن 24/7', 'موقف سيارات']
    },
    {
      id: 'riyadh-compound-002',
      type: 'عقارات سكنية',
      category: 'real-estate' as const,
      title: 'مجمع الرياض الجديد',
      description: 'مجمع سكني متكامل في شمال الرياض بمساحات خضراء واسعة',
      price: 'يبدأ من 650,000 ريال',
      expectedReturn: '6.8% سنوياً',
      paymentPlan: '20% مقدم + أقساط على 5 سنوات',
      riskLevel: 'منخفض' as const,
      timeline: '2-4 سنوات',
      recommendation: 'شراء' as const,
      location: 'الرياض - الشمال',
      minimumInvestment: '130,000 ريال',
      features: ['مساحات خضراء', 'مدارس قريبة', 'مركز تجاري', 'نادي صحي']
    },
    {
      id: 'jeddah-commercial-003',
      type: 'عقارات تجارية',
      category: 'real-estate' as const,
      title: 'مركز جدة التجاري',
      description: 'مجمع تجاري في موقع استراتيجي على كورنيش جدة',
      price: 'يبدأ من 1,200,000 ريال',
      expectedReturn: '8.5% سنوياً',
      paymentPlan: '25% مقدم + أقساط على 3 سنوات',
      riskLevel: 'متوسط' as const,
      timeline: '1-2 سنة',
      recommendation: 'شراء متوسط' as const,
      location: 'جدة - الكورنيش',
      minimumInvestment: '300,000 ريال',
      features: ['موقع استراتيجي', 'إطلالة بحرية', 'مساحات تجارية متنوعة', 'مواقف واسعة']
    }
  ],
  
  'stocks': [
    {
      id: 'emaar-stock-001',
      type: 'أسهم عقارية',
      category: 'stocks' as const,
      title: 'سهم إعمار العقارية (EMAAR)',
      description: 'شركة عقارية رائدة في دولة الإمارات مع محفظة مشاريع قوية',
      price: '7.85 درهم للسهم',
      currentPrice: '7.85 درهم',
      targetPrice: '9.20 درهم',
      expectedReturn: '12.3% خلال 12 شهر',
      riskLevel: 'متوسط' as const,
      timeline: '6-12 شهر',
      recommendation: 'شراء قوي' as const,
      minimumInvestment: '1,000 درهم (127 سهم)',
      features: ['توزيعات أرباح منتظمة', 'نمو مستمر', 'قطاع العقارات', 'سيولة عالية']
    },
    {
      id: 'aramco-stock-002',
      type: 'أسهم طاقة',
      category: 'stocks' as const,
      title: 'سهم أرامكو السعودية (2222)',
      description: 'أكبر شركة نفط في العالم مع توزيعات أرباح مجزية',
      price: '28.45 ريال للسهم',
      currentPrice: '28.45 ريال',
      targetPrice: '32.00 ريال',
      expectedReturn: '15.8% خلال 18 شهر',
      riskLevel: 'منخفض' as const,
      timeline: '12-18 شهر',
      recommendation: 'شراء' as const,
      minimumInvestment: '2,845 ريال (100 سهم)',
      features: ['توزيعات أرباح ربع سنوية', 'استقرار الأرباح', 'قطاع الطاقة', 'شركة حكومية']
    },
    {
      id: 'sabic-stock-003',
      type: 'أسهم صناعية',
      category: 'stocks' as const,
      title: 'سهم سابك (2010)',
      description: 'شركة صناعات كيماوية رائدة في المنطقة',
      price: '89.20 ريال للسهم',
      currentPrice: '89.20 ريال',
      targetPrice: '98.50 ريال',
      expectedReturn: '11.5% خلال 12 شهر',
      riskLevel: 'متوسط' as const,
      timeline: '9-15 شهر',
      recommendation: 'شراء متوسط' as const,
      minimumInvestment: '8,920 ريال (100 سهم)',
      features: ['صناعات كيماوية', 'توسع عالمي', 'تقنيات متطورة', 'نمو مستدام']
    }
  ],

  'gold': [
    {
      id: 'gold-bars-001',
      type: 'سبائك ذهب',
      category: 'gold' as const,
      title: 'سبائك الذهب الخالص 24 قيراط',
      description: 'سبائك ذهب خالص من مصفاة الإمارات المعتمدة دولياً',
      price: '220 ريال للجرام',
      expectedReturn: '5.8% سنوياً',
      riskLevel: 'منخفض' as const,
      timeline: 'طويل المدى (3-5 سنوات)',
      recommendation: 'شراء' as const,
      minimumInvestment: '11,000 ريال (50 جرام)',
      features: ['حماية من التضخم', 'أصول ملموسة', 'سيولة عالية', 'تخزين آمن']
    },
    {
      id: 'gold-etf-002',
      type: 'صناديق الذهب المتداولة',
      category: 'gold' as const,
      title: 'صندوق الذهب المتداول (GOLD ETF)',
      description: 'صندوق استثماري يتتبع أسعار الذهب بدون الحاجة للتخزين المادي',
      price: '85.50 ريال للوحدة',
      expectedReturn: '6.2% سنوياً',
      riskLevel: 'منخفض' as const,
      timeline: 'متوسط المدى (1-3 سنوات)',
      recommendation: 'شراء قوي' as const,
      minimumInvestment: '855 ريال (10 وحدات)',
      features: ['سهولة التداول', 'لا حاجة للتخزين', 'رسوم منخفضة', 'سيولة فورية']
    }
  ],

  'bonds': [
    {
      id: 'government-bonds-001',
      type: 'سندات حكومية',
      category: 'bonds' as const,
      title: 'سندات الخزانة السعودية',
      description: 'سندات حكومية مضمونة من وزارة المالية السعودية',
      price: '1,000 ريال للسند',
      expectedReturn: '4.8% سنوياً',
      riskLevel: 'منخفض' as const,
      timeline: '2-5 سنوات',
      recommendation: 'شراء' as const,
      minimumInvestment: '10,000 ريال (10 سندات)',
      features: ['ضمان حكومي', 'عوائد ثابتة', 'مخاطر منخفضة', 'إعفاء ضريبي']
    },
    {
      id: 'corporate-bonds-002',
      type: 'سندات شركات',
      category: 'bonds' as const,
      title: 'سندات شركة اتصالات الإمارات',
      description: 'سندات شركات من اتصالات الإمارات بتصنيف ائتماني عالي',
      price: '1,000 درهم للسند',
      expectedReturn: '6.1% سنوياً',
      riskLevel: 'منخفض' as const,
      timeline: '3-7 سنوات',
      recommendation: 'شراء متوسط' as const,
      minimumInvestment: '10,000 درهم (10 سندات)',
      features: ['تصنيف ائتماني عالي', 'عوائد أعلى من الحكومية', 'شركة رائدة', 'توزيعات منتظمة']
    }
  ],

  'crypto': [
    {
      id: 'bitcoin-001',
      type: 'عملة رقمية',
      category: 'crypto' as const,
      title: 'بيتكوين (BTC)',
      description: 'أكبر عملة رقمية في العالم من حيث القيمة السوقية',
      price: '165,000 ريال للبيتكوين الواحد',
      currentPrice: '165,000 ريال',
      expectedReturn: '25.5% خلال 24 شهر',
      riskLevel: 'عالي' as const,
      timeline: '12-36 شهر',
      recommendation: 'شراء متوسط' as const,
      minimumInvestment: '1,650 ريال (1% من بيتكوين)',
      features: ['أعلى عملة رقمية', 'سيولة عالية', 'تقلبات عالية', 'نمو طويل المدى']
    },
    {
      id: 'ethereum-002',
      type: 'عملة رقمية',
      category: 'crypto' as const,
      title: 'إيثيريوم (ETH)',
      description: 'منصة العقود الذكية الرائدة مع إمكانيات نمو قوية',
      price: '9,850 ريال للإيثيريوم',
      currentPrice: '9,850 ريال',
      expectedReturn: '35.2% خلال 18 شهر',
      riskLevel: 'عالي' as const,
      timeline: '6-24 شهر',
      recommendation: 'شراء' as const,
      minimumInvestment: '985 ريال (0.1 إيثيريوم)',
      features: ['عقود ذكية', 'نظام DeFi', 'نمو التطبيقات', 'تحسينات تقنية']
    }
  ],

  'savings': [
    {
      id: 'bank-deposit-001',
      type: 'ودائع بنكية',
      category: 'savings' as const,
      title: 'وديعة بنك الراجحي الثابتة',
      description: 'وديعة ثابتة مضمونة من بنك الراجحي بعوائد منافسة',
      price: 'حد أدنى 50,000 ريال',
      expectedReturn: '3.5% سنوياً',
      riskLevel: 'منخفض' as const,
      timeline: '1-3 سنوات',
      recommendation: 'شراء' as const,
      minimumInvestment: '50,000 ريال',
      features: ['ضمان كامل', 'عوائد ثابتة', 'سيولة مرنة', 'تأمين الودائع']
    },
    {
      id: 'money-market-002',
      type: 'صناديق النقد',
      category: 'savings' as const,
      title: 'صندوق سوق النقد الإماراتي',
      description: 'صندوق استثماري قصير المدى في أدوات النقد الآمنة',
      price: '100 درهم للوحدة',
      expectedReturn: '4.2% سنوياً',
      riskLevel: 'منخفض' as const,
      timeline: '3-12 شهر',
      recommendation: 'شراء قوي' as const,
      minimumInvestment: '5,000 درهم (50 وحدة)',
      features: ['مخاطر منخفضة', 'سيولة يومية', 'عوائد منتظمة', 'إدارة احترافية']
    }
  ]
};

export function getRecommendationsByCategory(category: string): DetailedRecommendation[] {
  return investmentDatabase[category as keyof typeof investmentDatabase] || [];
}

export function getRecommendationById(id: string): DetailedRecommendation | undefined {
  for (const category of Object.values(investmentDatabase)) {
    const recommendation = category.find(item => item.id === id);
    if (recommendation) return recommendation;
  }
  return undefined;
}

export function getAllRecommendations(): DetailedRecommendation[] {
  return Object.values(investmentDatabase).flat();
}