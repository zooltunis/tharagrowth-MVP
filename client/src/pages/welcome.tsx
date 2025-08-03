import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { TrendingUp, Shield, Coins, Brain, AlertTriangle, Sparkles, BarChart3, Globe } from "lucide-react";
import logoPath from "@assets/TharaGrowth Logo - Emblem Style with Calligraphy Twist_20250803_194834_0000_1754247313539.png";

export default function WelcomePage() {
  const [currentLang, setCurrentLang] = useState("ar");

  const content = {
    ar: {
      title: "TharaGrowth",
      subtitle: "منصة الاستثمار الذكي لجيل الشباب العربي",
      description: "احصل على توصيات استثمارية مخصصة باستخدام الذكاء الاصطناعي وبيانات السوق الحية",
      features: [
        { title: "تحليل ذكي", desc: "توصيات استثمارية مخصصة باستخدام الذكاء الاصطناعي", icon: Brain },
        { title: "أمان موثوق", desc: "حماية بياناتك وخصوصيتك أولويتنا القصوى", icon: Shield },
        { title: "استثمار متنوع", desc: "خيارات استثمارية متعددة من الذهب والعقارات والأسهم", icon: Coins }
      ],
      cta: {
        primary: "ابدأ التحليل الآن",
        secondary: "عرض السوق المباشر",
        education: "التعليم الاستثماري"
      },
      footer: "مجاني تماماً • لا يتطلب تسجيل دخول",
      disclaimer: {
        title: "إخلاء مسؤولية قانونية",
        text: "هذه المنصة لا تقدم خدمات استشارية مالية أو تنفيذ عمليات. تقدم فقط رؤى استثمارية قائمة على الذكاء الاصطناعي لأغراض تعليمية. استشر مستشاراً مالياً مؤهلاً قبل اتخاذ أي قرارات استثمارية."
      }
    },
    en: {
      title: "TharaGrowth",
      subtitle: "Smart Investment Platform for Young Arab Generation",
      description: "Get personalized investment recommendations using AI and live market data",
      features: [
        { title: "Smart Analysis", desc: "Personalized investment recommendations using artificial intelligence", icon: Brain },
        { title: "Trusted Security", desc: "Your data protection and privacy are our top priority", icon: Shield },
        { title: "Diversified Investment", desc: "Multiple investment options from gold, real estate, and stocks", icon: Coins }
      ],
      cta: {
        primary: "Start Analysis Now",
        secondary: "View Live Market",
        education: "Investment Education"
      },
      footer: "Completely Free • No Registration Required",
      disclaimer: {
        title: "Legal Disclaimer",
        text: "This platform does not provide financial advisory services or execute transactions. It only provides AI-based investment insights for educational purposes. Consult a qualified financial advisor before making any investment decisions."
      }
    },
    fr: {
      title: "TharaGrowth",
      subtitle: "Plateforme d'Investissement Intelligent pour la Jeune Génération Arabe",
      description: "Obtenez des recommandations d'investissement personnalisées en utilisant l'IA et les données de marché en direct",
      features: [
        { title: "Analyse Intelligente", desc: "Recommandations d'investissement personnalisées utilisant l'intelligence artificielle", icon: Brain },
        { title: "Sécurité Fiable", desc: "La protection de vos données et votre confidentialité sont notre priorité absolue", icon: Shield },
        { title: "Investissement Diversifié", desc: "Options d'investissement multiples : or, immobilier et actions", icon: Coins }
      ],
      cta: {
        primary: "Commencer l'Analyse",
        secondary: "Voir le Marché en Direct",
        education: "Éducation à l'Investissement"
      },
      footer: "Entièrement Gratuit • Aucune Inscription Requise",
      disclaimer: {
        title: "Avertissement Légal",
        text: "Cette plateforme ne fournit pas de services de conseil financier ni n'exécute de transactions. Elle fournit uniquement des insights d'investissement basés sur l'IA à des fins éducatives. Consultez un conseiller financier qualifié avant de prendre des décisions d'investissement."
      }
    }
  };

  const currentContent = content[currentLang as keyof typeof content];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50" dir={currentLang === "ar" ? "rtl" : "ltr"}>
      <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />
      
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="logo-container w-24 h-24 mb-6">
              <img 
                src={logoPath} 
                alt="TharaGrowth Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          <Badge variant="secondary" className="mb-6 bg-gradient-gold text-gold-foreground">
            <Sparkles className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {currentLang === "en" ? "AI-Powered Investment Advisor" : 
             currentLang === "fr" ? "Conseiller en Investissement IA" : 
             "مستشار الاستثمار المدعوم بالذكاء الاصطناعي"}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            {currentContent.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light mb-4 max-w-3xl mx-auto">
            {currentContent.subtitle}
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            {currentContent.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/data-collection">
              <Button size="lg" className="btn-finance min-w-48">
                <BarChart3 className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
                {currentContent.cta.primary}
              </Button>
            </Link>
            
            <Link href="/market-dashboard">
              <Button variant="outline" size="lg" className="min-w-48">
                <TrendingUp className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
                {currentContent.cta.secondary}
              </Button>
            </Link>
            
            <Link href="/education">
              <Button variant="outline" size="lg" className="min-w-48">
                <Globe className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
                {currentContent.cta.education}
              </Button>
            </Link>
          </div>
          
          <p className="text-muted-foreground text-sm">{currentContent.footer}</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {currentContent.features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="finance-card text-center group hover:scale-105 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-finance rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-white" size={28} />
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-finance rounded-2xl p-8 mb-16 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-white/80">
                {currentLang === "en" ? "Analysis Completed" : 
                 currentLang === "fr" ? "Analyses Complétées" : 
                 "تحليل مكتمل"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-white/80">
                {currentLang === "en" ? "Investment Types" : 
                 currentLang === "fr" ? "Types d'Investissement" : 
                 "نوع استثماري"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">3</div>
              <div className="text-white/80">
                {currentLang === "en" ? "Languages Supported" : 
                 currentLang === "fr" ? "Langues Supportées" : 
                 "لغات مدعومة"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/80">
                {currentLang === "en" ? "Market Data" : 
                 currentLang === "fr" ? "Données de Marché" : 
                 "بيانات السوق"}
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-warning mb-3 text-lg">{currentContent.disclaimer.title}</p>
                <p className="text-warning-foreground leading-relaxed">
                  {currentContent.disclaimer.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
