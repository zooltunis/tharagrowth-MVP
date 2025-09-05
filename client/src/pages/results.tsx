import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/ui/header";
import { useLanguage, useTranslation, commonTranslations } from "@/contexts/LanguageContext";
import { Check, RotateCcw, Download, Loader2, AlertCircle, MapPin, Clock, TrendingUp, Shield, DollarSign, AlertTriangle, Home } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ResultsPage() {
  const { id } = useParams();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { currentLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: [`/api/analysis/${id}`],
    enabled: !!id,
  }) as { data: any, isLoading: boolean, error: any };

  // Debug logging
  useEffect(() => {
    console.log('🔍 Results Page Debug:', {
      id,
      analysis,
      isLoading,
      error,
      hasRecommendations: !!analysis?.recommendations,
      recommendationsStructure: analysis?.recommendations ? Object.keys(analysis.recommendations) : null
    });
  }, [id, analysis, isLoading, error]);

  useEffect(() => {
    if (analysis?.recommendations?.recommendations && chartRef.current) {
      renderPieChart();
    }
  }, [analysis]);

  const renderPieChart = () => {
    if (!analysis?.recommendations?.recommendations || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create allocation data from recommendations
    const recommendations = analysis.recommendations.recommendations;
    if (!recommendations || recommendations.length === 0) return;

    // Calculate allocation from recommendations
    const allocation: Record<string, number> = {};
    const totalAmount = analysis.recommendations.totalAllocated || 0;
    
    if (totalAmount > 0) {
      recommendations.forEach((rec: any) => {
        const category = rec.category || 'other';
        allocation[category] = (allocation[category] || 0) + (rec.amount || 0);
      });

      // Convert to percentages
      Object.keys(allocation).forEach(key => {
        allocation[key] = (allocation[key] / totalAmount) * 100;
      });
    }

    // Import Chart.js dynamically
    import('chart.js/auto').then(({ Chart }) => {
      const colors = [
        '#1E40AF', '#059669', '#DC2626', '#F59E0B', 
        '#8B5CF6', '#06B6D4', '#10B981', '#F97316'
      ];

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(allocation),
          datasets: [{
            data: Object.values(allocation),
            backgroundColor: colors.slice(0, Object.keys(allocation).length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  family: 'Inter'
                }
              }
            }
          }
        }
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">{t({ ar: "جاري تحميل التوصيات...", en: "Loading recommendations...", fr: "Chargement des recommandations..." })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t({ ar: "خطأ في تحميل البيانات", en: "Error Loading Data", fr: "Erreur de Chargement des Données" })}</h3>
          <p className="text-gray-600 mb-4">{t({ ar: "حدث خطأ أثناء تحميل التوصيات الاستثمارية", en: "An error occurred while loading investment recommendations", fr: "Une erreur s'est produite lors du chargement des recommandations d'investissement" })}</p>
          <Link href="/">
            <Button>{t({ ar: "العودة للرئيسية", en: "Back to Home", fr: "Retour à l'accueil" })}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis?.recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t({ ar: "لا توجد توصيات", en: "No Recommendations", fr: "Aucune Recommandation" })}</h3>
          <p className="text-gray-600 mb-4">{t({ ar: "لم يتم العثور على توصيات لهذا التحليل", en: "No recommendations found for this analysis", fr: "Aucune recommandation trouvée pour cette analyse" })}</p>
          <Link href="/">
            <Button>{t({ ar: "العودة للرئيسية", en: "Back to Home", fr: "Retour à l'accueil" })}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from the new smart investment system structure
  const recommendations = analysis.recommendations.recommendations || [];
  const totalAllocated = analysis.recommendations.totalAllocated || 0;
  const remainingAmount = parseFloat(analysis.investmentBudget.replace(/,/g, '')) - totalAllocated;
  const summary = analysis.recommendations.analysis || t({ ar: "لا يوجد ملخص متاح", en: "No summary available", fr: "Aucun résumé disponible" });
  const strategy = analysis.recommendations.strategy || t({ ar: "غير محدد", en: "Not specified", fr: "Non spécifié" });
  const riskLevel = analysis.recommendations.riskAssessment || t({ ar: "غير محدد", en: "Not specified", fr: "Non spécifié" });
  
  // Calculate allocation from new recommendations structure
  const allocation: Record<string, number> = {};
  if (recommendations.length > 0 && totalAllocated > 0) {
    recommendations.forEach((rec: any) => {
      const category = rec.category || 'other';
      allocation[category] = (allocation[category] || 0) + (rec.amount || 0);
    });
    
    // Convert to percentages
    Object.keys(allocation).forEach(key => {
      allocation[key] = (allocation[key] / totalAllocated) * 100;
    });
  }
  
  // Calculate expected return from new recommendations structure
  let expectedReturn = "8-12";
  if (recommendations.length > 0) {
    const avgReturn = recommendations.reduce((sum: number, rec: any) => {
      const returnValue = parseFloat(String(rec.expectedReturn || 8));
      return sum + returnValue;
    }, 0) / recommendations.length;
    expectedReturn = avgReturn.toFixed(1);
  }

  const colors = [
    '#1E40AF', '#059669', '#DC2626', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#10B981', '#F97316'
  ];

  const translateType = (type: string) => {
    const translations: { [key: string]: { ar: string, en: string, fr: string } } = {
      'stocks': { ar: 'الأسهم', en: 'Stocks', fr: 'Actions' },
      'Stocks': { ar: 'الأسهم', en: 'Stocks', fr: 'Actions' },
      'أسهم': { ar: 'الأسهم', en: 'Stocks', fr: 'Actions' },
      'Equities': { ar: 'الأسهم', en: 'Stocks', fr: 'Actions' },
      'real-estate': { ar: 'العقارات', en: 'Real Estate', fr: 'Immobilier' },
      'gold': { ar: 'الذهب', en: 'Gold', fr: 'Or' },
      'bonds': { ar: 'السندات', en: 'Bonds', fr: 'Obligations' },
      'Fixed Income': { ar: 'الدخل الثابت', en: 'Fixed Income', fr: 'Revenu Fixe' },
      'صكوك': { ar: 'الصكوك', en: 'Sukuk', fr: 'Sukuk' },
      'savings': { ar: 'الادخار', en: 'Savings', fr: 'Épargne' },
      'crypto': { ar: 'العملات المشفرة', en: 'Cryptocurrencies', fr: 'Cryptomonnaies' },
      'crowdfunding': { ar: 'التمويل الجماعي', en: 'Crowdfunding', fr: 'Financement Participatif' },
      'sukuk': { ar: 'الصكوك', en: 'Sukuk', fr: 'Sukuk' }
    };
    return translations[type] ? t(translations[type]) : type;
  };

  const translateRiskLevel = (level: string) => {
    const translations: { [key: string]: { ar: string, en: string, fr: string } } = {
      'منخفض': { ar: 'منخفض', en: 'Low', fr: 'Faible' },
      'Low': { ar: 'منخفض', en: 'Low', fr: 'Faible' },
      'Faible': { ar: 'منخفض', en: 'Low', fr: 'Faible' },
      'متوسط': { ar: 'متوسط', en: 'Medium', fr: 'Moyen' },
      'Medium': { ar: 'متوسط', en: 'Medium', fr: 'Moyen' },
      'Moyen': { ar: 'متوسط', en: 'Medium', fr: 'Moyen' },
      'عالي': { ar: 'عالي', en: 'High', fr: 'Élevé' },
      'High': { ar: 'عالي', en: 'High', fr: 'Élevé' },
      'Élevé': { ar: 'عالي', en: 'High', fr: 'Élevé' }
    };
    return translations[level] ? t(translations[level]) : level;
  };

  const translateAssetName = (assetName: string) => {
    const translations: { [key: string]: { ar: string, en: string, fr: string } } = {
      // شركات الأسهم
      'Emaar Properties': { ar: 'شركة إعمار العقارية', en: 'Emaar Properties', fr: 'Emaar Properties' },
      'First Abu Dhabi Bank': { ar: 'بنك أبو ظبي الأول', en: 'First Abu Dhabi Bank', fr: 'Première Banque d\'Abu Dhabi' },
      'Emirates NBD': { ar: 'بنك الإمارات دبي الوطني', en: 'Emirates NBD', fr: 'Emirates NBD' },
      'ADNOC Distribution': { ar: 'أدنوك للتوزيع', en: 'ADNOC Distribution', fr: 'ADNOC Distribution' },
      'Dubai Islamic Bank': { ar: 'بنك دبي الإسلامي', en: 'Dubai Islamic Bank', fr: 'Banque Islamique de Dubaï' },
      'Aldar Properties': { ar: 'شركة الدار العقارية', en: 'Aldar Properties', fr: 'Aldar Properties' },
      'Etisalat UAE': { ar: 'اتصالات الإمارات', en: 'Etisalat UAE', fr: 'Etisalat EAU' },
      'Saudi Aramco': { ar: 'أرامكو السعودية', en: 'Saudi Aramco', fr: 'Saudi Aramco' },
      'Al Rajhi Bank': { ar: 'مصرف الراجحي', en: 'Al Rajhi Bank', fr: 'Banque Al Rajhi' },
      'Saudi Basic Industries': { ar: 'الصناعات الأساسية السعودية', en: 'Saudi Basic Industries', fr: 'Industries de Base Saoudiennes' },
      
      // أسماء عربية موجودة
      'إعمار العقارية': { ar: 'إعمار العقارية', en: 'Emaar Properties', fr: 'Emaar Properties' },
      'شركة إعمار العقارية': { ar: 'شركة إعمار العقارية', en: 'Emaar Properties', fr: 'Emaar Properties' },
      'اتصالات الإمارات': { ar: 'اتصالات الإمارات', en: 'Etisalat UAE', fr: 'Etisalat EAU' },
      'بنك أبو ظبي الأول': { ar: 'بنك أبو ظبي الأول', en: 'First Abu Dhabi Bank', fr: 'Première Banque d\'Abu Dhabi' },
      
      // استثمارات أخرى
      'Gold Bars': { ar: 'سبائك الذهب', en: 'Gold Bars', fr: 'Lingots d\'Or' },
      'Gold Coins': { ar: 'عملات الذهب', en: 'Gold Coins', fr: 'Pièces d\'Or' },
      'UAE Government Bonds': { ar: 'سندات الحكومة الإماراتية', en: 'UAE Government Bonds', fr: 'Obligations Gouvernementales des EAU' },
      'Saudi Government Sukuk': { ar: 'صكوك الحكومة السعودية', en: 'Saudi Government Sukuk', fr: 'Sukuk Gouvernementaux Saoudiens' },
      
      // مشاريع التمويل الجماعي والناشئة
      'Tech Startup - AI Solutions': { ar: 'شركة ناشئة تقنية - حلول الذكاء الاصطناعي', en: 'Tech Startup - AI Solutions', fr: 'Startup Technologique - Solutions IA' },
      'Real Estate Development - Luxury Villas': { ar: 'تطوير عقاري - فيلات فاخرة', en: 'Real Estate Development - Luxury Villas', fr: 'Développement Immobilier - Villas de Luxe' },
      'Fintech Innovation - Mobile Wallet': { ar: 'ابتكار التكنولوجيا المالية - محفظة الهاتف المحمول', en: 'Fintech Innovation - Mobile Wallet', fr: 'Innovation Fintech - Portefeuille Mobile' }
    };
    return translations[assetName] ? t(translations[assetName]) : assetName;
  };

  const formatCurrency = (amount: number) => {
    const currency = analysis?.currency || 'AED';
    const locale = currentLanguage === 'ar' ? 'ar-AE' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <Check className="text-white text-2xl" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t({ ar: "توصياتك الاستثمارية", en: "Your Investment Recommendations", fr: "Vos Recommandations d'Investissement" })}</h1>
          <p className="text-gray-600">{t({ ar: "تم إنشاء محفظة استثمارية مخصصة حسب ملفك الشخصي", en: "A customized investment portfolio created based on your profile", fr: "Un portefeuille d'investissement personnalisé créé selon votre profil" })}</p>
        </div>

        {/* Investment Summary */}
        <Card className="shadow-lg border-gray-100 mb-8">
          <CardHeader>
            <CardTitle>{t({ ar: "ملخص المحفظة الاستثمارية", en: "Investment Portfolio Summary", fr: "Résumé du Portefeuille d'Investissement" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <DollarSign className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-bold text-blue-900">{t({ ar: "إجمالي الاستثمار", en: "Total Investment", fr: "Investissement Total" })}</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAllocated)}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-bold text-green-900">{t({ ar: "العائد المتوقع", en: "Expected Return", fr: "Rendement Attendu" })}</h4>
                <p className="text-2xl font-bold text-green-600">{expectedReturn}%</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Shield className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-bold text-purple-900">{t({ ar: "مستوى المخاطر", en: "Risk Level", fr: "Niveau de Risque" })}</h4>
                <p className="text-xl font-bold text-purple-600">{riskLevel}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Clock className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                <h4 className="font-bold text-orange-900">{t({ ar: "الاستراتيجية", en: "Strategy", fr: "Stratégie" })}</h4>
                <p className="text-xl font-bold text-orange-600">{strategy}</p>
              </div>
            </div>

            {/* Portfolio Chart and Allocation */}
            {Object.keys(allocation).length > 0 && (
              <div className="grid lg:grid-cols-2 gap-8 mb-6">
                {/* Pie Chart */}
                <div>
                  <h4 className="font-bold text-lg mb-4">{t({ ar: "توزيع المحفظة", en: "Portfolio Allocation", fr: "Répartition du Portefeuille" })}</h4>
                  <div className="relative h-64">
                    <canvas ref={chartRef} className="max-w-full"></canvas>
                  </div>
                </div>

                {/* Allocation Details */}
                <div>
                  <h4 className="font-bold text-lg mb-4">{t({ ar: "تفاصيل التوزيع", en: "Allocation Details", fr: "Détails de la Répartition" })}</h4>
                  <div className="space-y-3">
                    {Object.entries(allocation).map(([type, percentage], index) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full ml-3" 
                            style={{ backgroundColor: colors[index] }}
                          ></div>
                          <span className="font-medium">{translateType(type)}</span>
                        </div>
                        <span className="text-lg font-bold">{percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg">
                {summary}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t({ ar: "التوصيات التفصيلية", en: "Detailed Recommendations", fr: "Recommandations Détaillées" })}</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {recommendations.map((recommendation: any, index: number) => (
                <Card key={index} className="shadow-lg border-gray-100 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <CardTitle className="text-lg">{translateAssetName(recommendation.asset || recommendation.title)}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{translateType(recommendation.category || recommendation.type)}</p>
                      </div>
                      <Badge 
                        variant={
                          recommendation.riskLevel === 'منخفض' || recommendation.riskLevel === 'Low' || recommendation.riskLevel === 'Faible' ? 'default' :
                          recommendation.riskLevel === 'متوسط' || recommendation.riskLevel === 'Medium' || recommendation.riskLevel === 'Moyen' ? 'secondary' : 'destructive'
                        }
                        className="shrink-0"
                      >
                        {translateRiskLevel(recommendation.riskLevel)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{recommendation.reason}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">{t({ ar: "المبلغ:", en: "Amount:", fr: "Montant:" })}</span>
                        <p className="font-bold">{formatCurrency(recommendation.amount || 0)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">{t({ ar: "الكمية:", en: "Quantity:", fr: "Quantité:" })}</span>
                        <p className="font-bold">{recommendation.quantity}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">{t({ ar: "العائد المتوقع:", en: "Expected Return:", fr: "Rendement Attendu:" })}</span>
                        <p className="font-bold text-green-600">{recommendation.expectedReturn}{recommendation.expectedReturn?.toString().includes('%') ? '' : '%'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">{t({ ar: "العملة:", en: "Currency:", fr: "Devise:" })}</span>
                        <p className="font-bold">{analysis?.currency || 'AED'}</p>
                      </div>
                    </div>

                    {recommendation.paymentPlan && (
                      <div>
                        <span className="font-medium text-gray-500">{t({ ar: "خطة الدفع:", en: "Payment Plan:", fr: "Plan de Paiement:" })}</span>
                        <p className="text-sm">{recommendation.paymentPlan}</p>
                      </div>
                    )}

                    {recommendation.features && recommendation.features.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-500 mb-2 block">{t({ ar: "المميزات:", en: "Features:", fr: "Caractéristiques:" })}</span>
                        <ul className="text-sm space-y-1">
                          {recommendation.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 ml-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Recommendations Message */}
        {(!recommendations || recommendations.length === 0) && (
          <Card className="shadow-lg border-yellow-200 bg-yellow-50">
            <CardContent className="text-center py-12">
              <AlertTriangle className="mx-auto h-16 w-16 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold text-yellow-900 mb-2">{t({ ar: "لا توجد توصيات متاحة", en: "No Recommendations Available", fr: "Aucune Recommandation Disponible" })}</h3>
              <p className="text-yellow-700 mb-6">
                {t({ 
                  ar: "لم نتمكن من العثور على استثمارات مناسبة ضمن المعايير المحددة. قد تحتاج إلى تعديل مبلغ الاستثمار أو تفضيلات الاستثمار.",
                  en: "We could not find suitable investments within the specified criteria. You may need to adjust the investment amount or investment preferences.",
                  fr: "Nous n'avons pas pu trouver d'investissements appropriés selon les critères spécifiés. Vous devrez peut-être ajuster le montant d'investissement ou les préférences d'investissement."
                })}
              </p>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>{t({ ar: "المبلغ المتاح:", en: "Available Amount:", fr: "Montant Disponible:" })} {formatCurrency(totalAllocated)}</p>
                <p>{t({ ar: "المبلغ المتبقي:", en: "Remaining Amount:", fr: "Montant Restant:" })} {formatCurrency(remainingAmount)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/data-collection">
            <Button variant="outline" className="w-full sm:w-auto">
              <RotateCcw className="ml-2 h-4 w-4" />
              {t({ ar: "إجراء تحليل جديد", en: "New Analysis", fr: "Nouvelle Analyse" })}
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="ml-2 h-4 w-4" />
              {t({ ar: "العودة للرئيسية", en: "Back to Home", fr: "Retour à l'accueil" })}
            </Button>
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 ml-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-900 mb-2">{t({ ar: "إخلاء مسؤولية قانونية", en: "Legal Disclaimer", fr: "Avertissement Légal" })}</h4>
              <p className="text-red-800 text-sm leading-relaxed">
                {t({ 
                  ar: "هذه التوصيات مخصصة لأغراض تعليمية فقط وليست استشارة مالية مهنية. يجب عليك استشارة مستشار مالي مؤهل قبل اتخاذ أي قرارات استثمارية. قد تفقد بعض أو كل أموالك المستثمرة. الأداء السابق لا يضمن النتائج المستقبلية.",
                  en: "These recommendations are for educational purposes only and are not professional financial advice. You should consult a qualified financial advisor before making any investment decisions. You may lose some or all of your invested money. Past performance does not guarantee future results.",
                  fr: "Ces recommandations sont à des fins éducatives uniquement et ne constituent pas des conseils financiers professionnels. Vous devriez consulter un conseiller financier qualifié avant de prendre toute décision d'investissement. Vous pourriez perdre une partie ou la totalité de votre argent investi. Les performances passées ne garantissent pas les résultats futurs."
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}