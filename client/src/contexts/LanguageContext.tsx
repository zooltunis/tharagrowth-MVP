import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en' | 'fr';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Try to get language from localStorage, default to Arabic
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('investwise-language');
      if (saved && ['ar', 'en', 'fr'].includes(saved)) {
        return saved as Language;
      }
    }
    return 'ar';
  });

  const isRTL = currentLanguage === 'ar';

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('investwise-language', lang);
      // Update document direction and language
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    // Set initial document attributes
    if (typeof window !== 'undefined') {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [currentLanguage, isRTL]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation hook
export function useTranslation() {
  const { currentLanguage } = useLanguage();

  const t = (translations: { ar: string; en: string; fr: string }) => {
    return translations[currentLanguage] || translations.ar;
  };

  return { t, currentLanguage };
}

// Common translations
export const commonTranslations = {
  // Navigation
  home: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' },
  analysis: { ar: 'التحليل', en: 'Analysis', fr: 'Analyse' },
  market: { ar: 'السوق', en: 'Market', fr: 'Marché' },
  education: { ar: 'التعليم', en: 'Education', fr: 'Éducation' },
  
  // Actions
  next: { ar: 'التالي', en: 'Next', fr: 'Suivant' },
  previous: { ar: 'السابق', en: 'Previous', fr: 'Précédent' },
  submit: { ar: 'إرسال', en: 'Submit', fr: 'Soumettre' },
  cancel: { ar: 'إلغاء', en: 'Cancel', fr: 'Annuler' },
  save: { ar: 'حفظ', en: 'Save', fr: 'Sauvegarder' },
  edit: { ar: 'تعديل', en: 'Edit', fr: 'Modifier' },
  delete: { ar: 'حذف', en: 'Delete', fr: 'Supprimer' },
  buy: { ar: 'شراء', en: 'Buy', fr: 'Acheter' },
  
  // Status
  loading: { ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...' },
  error: { ar: 'خطأ', en: 'Error', fr: 'Erreur' },
  success: { ar: 'نجح', en: 'Success', fr: 'Succès' },
  
  // Investment
  investment: { ar: 'الاستثمار', en: 'Investment', fr: 'Investissement' },
  portfolio: { ar: 'المحفظة', en: 'Portfolio', fr: 'Portefeuille' },
  recommendations: { ar: 'التوصيات', en: 'Recommendations', fr: 'Recommandations' },
  riskLevel: { ar: 'مستوى المخاطر', en: 'Risk Level', fr: 'Niveau de Risque' },
  expectedReturn: { ar: 'العائد المتوقع', en: 'Expected Return', fr: 'Rendement Attendu' },
  
  // Risk levels
  lowRisk: { ar: 'منخفض', en: 'Low', fr: 'Faible' },
  mediumRisk: { ar: 'متوسط', en: 'Medium', fr: 'Moyen' },
  highRisk: { ar: 'عالي', en: 'High', fr: 'Élevé' },
  
  // Investment types
  stocks: { ar: 'الأسهم', en: 'Stocks', fr: 'Actions' },
  realEstate: { ar: 'العقارات', en: 'Real Estate', fr: 'Immobilier' },
  gold: { ar: 'الذهب', en: 'Gold', fr: 'Or' },
  bonds: { ar: 'السندات', en: 'Bonds', fr: 'Obligations' },
  savings: { ar: 'الادخار', en: 'Savings', fr: 'Épargne' },
  crowdfunding: { ar: 'التمويل الجماعي', en: 'Crowdfunding', fr: 'Financement Participatif' },
  
  // Age groups
  age18_25: { ar: '18-25 سنة', en: '18-25 years', fr: '18-25 ans' },
  age26_35: { ar: '26-35 سنة', en: '26-35 years', fr: '26-35 ans' },
  age36_45: { ar: '36-45 سنة', en: '36-45 years', fr: '36-45 ans' },
  age46_55: { ar: '46-55 سنة', en: '46-55 years', fr: '46-55 ans' },
  age55Plus: { ar: 'أكثر من 55 سنة', en: '55+ years', fr: '55+ ans' },
  
  // Income ranges
  income0_5k: { ar: 'أقل من 5,000 ريال', en: 'Less than 5,000 SAR', fr: 'Moins de 5 000 SAR' },
  income5k_15k: { ar: '5,000 - 15,000 ريال', en: '5,000 - 15,000 SAR', fr: '5 000 - 15 000 SAR' },
  income15k_30k: { ar: '15,000 - 30,000 ريال', en: '15,000 - 30,000 SAR', fr: '15 000 - 30 000 SAR' },
  income30k_50k: { ar: '30,000 - 50,000 ريال', en: '30,000 - 50,000 SAR', fr: '30 000 - 50 000 SAR' },
  income50kPlus: { ar: 'أكثر من 50,000 ريال', en: '50,000+ SAR', fr: '50 000+ SAR' },
  
  // Goals
  goalInvestment: { ar: 'نمو رأس المال', en: 'Capital Growth', fr: 'Croissance du Capital' },
  goalRetirement: { ar: 'التقاعد', en: 'Retirement', fr: 'Retraite' },
  goalEmergency: { ar: 'صندوق الطوارئ', en: 'Emergency Fund', fr: 'Fonds d\'Urgence' },
  goalIncome: { ar: 'توليد الدخل', en: 'Income Generation', fr: 'Génération de Revenus' },
  goalEducation: { ar: 'التعليم', en: 'Education', fr: 'Éducation' },
  goalTravel: { ar: 'السفر', en: 'Travel', fr: 'Voyage' },
  goalBusiness: { ar: 'بدء مشروع', en: 'Start Business', fr: 'Créer une Entreprise' }
};