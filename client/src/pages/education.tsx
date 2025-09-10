import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { BookOpen, TrendingUp, Shield, Globe, AlertTriangle, ExternalLink, Home } from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

const educationalContent = {
  ar: {
    title: "التعليم الاستثماري",
    disclaimer: "هذه المنصة لا تقدم خدمات استشارية مالية أو تنفيذ عمليات. تقدم فقط رؤى استثمارية قائمة على الذكاء الاصطناعي لأغراض تعليمية.",
    sections: {
      basics: {
        title: "أساسيات الاستثمار",
        content: [
          {
            title: "ما هو الاستثمار؟",
            description: "الاستثمار هو توظيف الأموال في أصول مختلفة بهدف تحقيق عوائد مالية على المدى الطويل.",
            points: [
              "بناء الثروة عبر الزمن",
              "مواجهة التضخم وحماية القوة الشرائية",
              "تحقيق الأهداف المالية طويلة المدى",
              "توليد دخل إضافي من الاستثمارات"
            ]
          },
          {
            title: "أنواع الاستثمارات",
            description: "تتنوع خيارات الاستثمار لتناسب مختلف المستثمرين وأهدافهم:",
            points: [
              "الأسهم: ملكية في الشركات مع إمكانية نمو رأس المال",
              "السندات: إقراض للحكومات أو الشركات مقابل فوائد ثابتة",
              "العقارات: استثمار في الممتلكات للإيجار أو الارتفاع في القيمة",
              "الذهب: استثمار آمن لحماية الثروة من التضخم",
              "الصكوك: استثمارات إسلامية متوافقة مع الشريعة"
            ]
          }
        ]
      },
      risk: {
        title: "إدارة المخاطر",
        content: [
          {
            title: "فهم المخاطر الاستثمارية",
            description: "كل استثمار يحمل مخاطر، والمفتاح هو فهمها وإدارتها بحكمة:",
            points: [
              "مخاطر السوق: تقلبات أسعار الأصول حسب ظروف السوق",
              "مخاطر التضخم: انخفاض القوة الشرائية للأموال",
              "مخاطر السيولة: صعوبة تحويل الاستثمار إلى نقد",
              "مخاطر الائتمان: احتمالية عدم سداد القروض أو السندات"
            ]
          },
          {
            title: "التنويع كاستراتيجية",
            description: "توزيع الاستثمارات على أصول متنوعة يقلل المخاطر الإجمالية:",
            points: [
              "لا تضع كل البيض في سلة واحدة",
              "استثمر في قطاعات وأسواق مختلفة",
              "امزج بين الاستثمارات عالية ومنخفضة المخاطر",
              "راجع وأعد توزيع محفظتك دورياً"
            ]
          }
        ]
      },
      planning: {
        title: "التخطيط المالي",
        content: [
          {
            title: "وضع الأهداف الاستثمارية",
            description: "تحديد أهداف واضحة ومحددة زمنياً أساس النجاح الاستثماري:",
            points: [
              "أهداف قصيرة المدى (1-3 سنوات): الطوارئ والمشاريع",
              "أهداف متوسطة المدى (3-10 سنوات): شراء منزل أو تعليم الأطفال",
              "أهداف طويلة المدى (10+ سنوات): التقاعد والاستقلال المالي",
              "مراجعة وتعديل الأهداف حسب تغير الظروف"
            ]
          },
          {
            title: "بناء صندوق الطوارئ",
            description: "احتياطي مالي يغطي 3-6 أشهر من المصروفات الأساسية:",
            points: [
              "يجب أن يكون سائلاً ومتاحاً فوراً",
              "يُحفظ في حسابات ادخار عالية العائد",
              "لا يُستخدم إلا في الطوارئ الحقيقية",
              "يُعاد بناؤه فوراً بعد الاستخدام"
            ]
          }
        ]
      }
    },
    news: {
      title: "آخر الأخبار المالية",
      loading: "جاري تحميل الأخبار...",
      error: "خطأ في تحميل الأخبار",
      readMore: "اقرأ المزيد"
    }
  },
  en: {
    title: "Investment Education",
    disclaimer: "This platform does not offer financial advisory or execution services. It only offers AI-based investment insight for educational purposes.",
    sections: {
      basics: {
        title: "Investment Basics",
        content: [
          {
            title: "What is Investment?",
            description: "Investment is the allocation of money into different assets with the goal of generating financial returns over the long term.",
            points: [
              "Building wealth over time",
              "Fighting inflation and protecting purchasing power",
              "Achieving long-term financial goals",
              "Generating additional income from investments"
            ]
          },
          {
            title: "Types of Investments",
            description: "Investment options vary to suit different investors and their goals:",
            points: [
              "Stocks: Ownership in companies with capital growth potential",
              "Bonds: Lending to governments or companies for fixed interest",
              "Real Estate: Property investment for rental income or appreciation",
              "Gold: Safe investment to protect wealth from inflation",
              "Sukuk: Sharia-compliant Islamic investments"
            ]
          }
        ]
      },
      risk: {
        title: "Risk Management",
        content: [
          {
            title: "Understanding Investment Risks",
            description: "Every investment carries risks, the key is understanding and managing them wisely:",
            points: [
              "Market Risk: Asset price fluctuations based on market conditions",
              "Inflation Risk: Decrease in money's purchasing power",
              "Liquidity Risk: Difficulty converting investment to cash",
              "Credit Risk: Possibility of loan or bond defaults"
            ]
          },
          {
            title: "Diversification as Strategy",
            description: "Spreading investments across diverse assets reduces overall risk:",
            points: [
              "Don't put all eggs in one basket",
              "Invest across different sectors and markets",
              "Mix high and low-risk investments",
              "Review and rebalance your portfolio regularly"
            ]
          }
        ]
      },
      planning: {
        title: "Financial Planning",
        content: [
          {
            title: "Setting Investment Goals",
            description: "Defining clear, time-bound objectives is the foundation of investment success:",
            points: [
              "Short-term goals (1-3 years): Emergencies and projects",
              "Medium-term goals (3-10 years): Home purchase or children's education",
              "Long-term goals (10+ years): Retirement and financial independence",
              "Review and adjust goals as circumstances change"
            ]
          },
          {
            title: "Building Emergency Fund",
            description: "Financial reserve covering 3-6 months of essential expenses:",
            points: [
              "Must be liquid and immediately accessible",
              "Keep in high-yield savings accounts",
              "Use only for real emergencies",
              "Rebuild immediately after use"
            ]
          }
        ]
      }
    },
    news: {
      title: "Latest Financial News",
      loading: "Loading news...",
      error: "Error loading news",
      readMore: "Read More"
    }
  },
  fr: {
    title: "Éducation à l'Investissement",
    disclaimer: "Cette plateforme n'offre pas de services de conseil financier ou d'exécution. Elle ne fournit que des perspectives d'investissement basées sur l'IA à des fins éducatives.",
    sections: {
      basics: {
        title: "Bases de l'Investissement",
        content: [
          {
            title: "Qu'est-ce que l'Investissement?",
            description: "L'investissement consiste à allouer de l'argent dans différents actifs dans le but de générer des rendements financiers à long terme.",
            points: [
              "Construire la richesse au fil du temps",
              "Lutter contre l'inflation et protéger le pouvoir d'achat",
              "Atteindre les objectifs financiers à long terme",
              "Générer des revenus supplémentaires des investissements"
            ]
          },
          {
            title: "Types d'Investissements",
            description: "Les options d'investissement varient pour convenir à différents investisseurs et leurs objectifs:",
            points: [
              "Actions: Propriété d'entreprises avec potentiel de croissance du capital",
              "Obligations: Prêt aux gouvernements ou entreprises pour intérêts fixes",
              "Immobilier: Investissement immobilier pour revenus locatifs ou appréciation",
              "Or: Investissement sûr pour protéger la richesse de l'inflation",
              "Sukuk: Investissements islamiques conformes à la Charia"
            ]
          }
        ]
      },
      risk: {
        title: "Gestion des Risques",
        content: [
          {
            title: "Comprendre les Risques d'Investissement",
            description: "Chaque investissement comporte des risques, la clé est de les comprendre et les gérer sagement:",
            points: [
              "Risque de marché: Fluctuations des prix des actifs selon les conditions du marché",
              "Risque d'inflation: Diminution du pouvoir d'achat de l'argent",
              "Risque de liquidité: Difficulté à convertir l'investissement en espèces",
              "Risque de crédit: Possibilité de défauts de prêts ou d'obligations"
            ]
          },
          {
            title: "Diversification comme Stratégie",
            description: "Répartir les investissements sur des actifs divers réduit le risque global:",
            points: [
              "Ne mettez pas tous vos œufs dans le même panier",
              "Investissez dans différents secteurs et marchés",
              "Mélangez investissements à risque élevé et faible",
              "Révisez et rééquilibrez votre portefeuille régulièrement"
            ]
          }
        ]
      },
      planning: {
        title: "Planification Financière",
        content: [
          {
            title: "Définir les Objectifs d'Investissement",
            description: "Définir des objectifs clairs et limités dans le temps est la base du succès d'investissement:",
            points: [
              "Objectifs à court terme (1-3 ans): Urgences et projets",
              "Objectifs à moyen terme (3-10 ans): Achat de maison ou éducation des enfants",
              "Objectifs à long terme (10+ ans): Retraite et indépendance financière",
              "Réviser et ajuster les objectifs selon les changements de circonstances"
            ]
          },
          {
            title: "Constituer un Fonds d'Urgence",
            description: "Réserve financière couvrant 3-6 mois de dépenses essentielles:",
            points: [
              "Doit être liquide et immédiatement accessible",
              "Conserver dans des comptes d'épargne à haut rendement",
              "Utiliser seulement pour de vraies urgences",
              "Reconstituer immédiatement après utilisation"
            ]
          }
        ]
      }
    },
    news: {
      title: "Dernières Nouvelles Financières",
      loading: "Chargement des nouvelles...",
      error: "Erreur de chargement des nouvelles",
      readMore: "Lire Plus"
    }
  }
};

export default function EducationPage() {
  const { currentLanguage, isRTL } = useLanguage();
  const content = educationalContent[currentLanguage];

  const { data: newsArticles, isLoading: newsLoading, error: newsError } = useQuery<NewsArticle[]>({
    queryKey: ['/api/financial-news', currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/financial-news?lang=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
            <p className="text-gray-600 mt-2">
              {currentLanguage === 'ar' ? 'تعلم أساسيات الاستثمار والتخطيط المالي' :
               currentLanguage === 'fr' ? 'Apprenez les bases de l\'investissement et de la planification financière' :
               'Learn investment basics and financial planning'}
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {currentLanguage === 'ar' ? 'الرئيسية' :
               currentLanguage === 'fr' ? 'Accueil' :
               'Home'}
            </Button>
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 font-medium">
            {content.disclaimer}
          </AlertDescription>
        </Alert>

        {/* Educational Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basics" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {content.sections.basics.title}
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {content.sections.risk.title}
                </TabsTrigger>
                <TabsTrigger value="planning" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {content.sections.planning.title}
                </TabsTrigger>
              </TabsList>

              {Object.entries(content.sections).map(([key, section]) => (
                <TabsContent key={key} value={key} className="space-y-6">
                  {section.content.map((topic, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-xl">{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{topic.description}</p>
                        <ul className="space-y-2">
                          {topic.points.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* News Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {content.news.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {newsLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">{content.news.loading}</p>
                  </div>
                )}

                {newsError && (
                  <div className="text-center py-8">
                    <p className="text-red-600">{content.news.error}</p>
                  </div>
                )}

                {newsArticles && newsArticles.length > 0 && (
                  <div className="space-y-4">
                    {newsArticles.slice(0, 5).map((article, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-semibold text-sm mb-2 leading-tight">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {article.source}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs p-1 h-auto"
                            onClick={() => window.open(article.url, '_blank')}
                          >
                            {content.news.readMore}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(article.publishedAt).toLocaleDateString(
                            currentLanguage === 'ar' ? 'ar-SA' : 
                            currentLanguage === 'fr' ? 'fr-FR' : 'en-US'
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {newsArticles && newsArticles.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">لا توجد أخبار متاحة حالياً</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">نصائح سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">ابدأ مبكراً</p>
                    <p className="text-xs text-blue-700">قوة التراكب المضاعف تعمل لصالحك مع الوقت</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">استثمر بانتظام</p>
                    <p className="text-xs text-green-700">الاستثمار الشهري الثابت يقلل المخاطر</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">تعلم باستمرار</p>
                    <p className="text-xs text-yellow-700">المعرفة أفضل استثمار يمكنك القيام به</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="text-center py-6">
            <p className="text-sm text-gray-600 mb-2">
              <strong>إخلاء مسؤولية:</strong> هذا المحتوى لأغراض تعليمية فقط ولا يُعتبر نصيحة استثمارية.
              استشر مستشاراً مالياً مؤهلاً قبل اتخاذ أي قرارات استثمارية.
            </p>
            <p className="text-xs text-gray-500">
              تحديث المحتوى: {new Date().toLocaleDateString('ar-SA')} | 
              مصادر البيانات: APIs معتمدة ومحدثة
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}