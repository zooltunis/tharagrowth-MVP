import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/ui/header";
import { useToast } from "@/hooks/use-toast";
import { userDataSchema, type UserData } from "@shared/schema";
import { ArrowRight, ArrowLeft, Brain, Loader2, User, Target, Shield, Settings, Home } from "lucide-react";
import { useLanguage, useTranslation, commonTranslations } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

export default function DataCollectionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<UserData | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  const content = {
    ar: {
      title: "تحليل استثماري ذكي",
      subtitle: "احصل على توصيات مخصصة في 4 خطوات بسيطة",
      steps: [
        { id: 1, title: "معلومات شخصية", progress: 25, icon: User },
        { id: 2, title: "أهداف الاستثمار", progress: 50, icon: Target },
        { id: 3, title: "مستوى تحمل المخاطر", progress: 75, icon: Shield },
        { id: 4, title: "تفضيلات الاستثمار", progress: 100, icon: Settings },
      ],
      buttons: {
        next: "التالي",
        prev: "السابق",
        analyze: "تحليل البيانات"
      }
    },
    en: {
      title: "Smart Investment Analysis",
      subtitle: "Get personalized recommendations in 4 simple steps",
      steps: [
        { id: 1, title: "Personal Information", progress: 25, icon: User },
        { id: 2, title: "Investment Goals", progress: 50, icon: Target },
        { id: 3, title: "Risk Tolerance", progress: 75, icon: Shield },
        { id: 4, title: "Investment Preferences", progress: 100, icon: Settings },
      ],
      buttons: {
        next: "Next",
        prev: "Previous",
        analyze: "Analyze Data"
      }
    },
    fr: {
      title: "Analyse d'Investissement Intelligente",
      subtitle: "Obtenez des recommandations personnalisées en 4 étapes simples",
      steps: [
        { id: 1, title: "Informations Personnelles", progress: 25, icon: User },
        { id: 2, title: "Objectifs d'Investissement", progress: 50, icon: Target },
        { id: 3, title: "Tolérance au Risque", progress: 75, icon: Shield },
        { id: 4, title: "Préférences d'Investissement", progress: 100, icon: Settings },
      ],
      buttons: {
        next: "Suivant",
        prev: "Précédent",
        analyze: "Analyser les Données"
      }
    }
  };

  const currentContent = content[currentLanguage as keyof typeof content] || content.ar;
  const steps = currentContent.steps;

  const form = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      age: "",
      income: "",
      investmentBudget: "50000",
      currency: "AED",
      goals: [],
      riskTolerance: "",
      preferences: [],
      targetMarket: "UAE",
      allowDiversification: false,
      islamicCompliance: false,
      paymentFrequency: "one-time",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: UserData) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language: currentLanguage }),
      });
      
      if (!response.ok) {
        throw new Error('فشل في تحليل البيانات');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم تحليل البيانات بنجاح",
        description: "سيتم توجيهك إلى صفحة النتائج",
      });
      setLocation(`/results/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحليل",
        description: error.message || "حدث خطأ أثناء تحليل البيانات",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: UserData) => {
    // Check if user is authenticated
    if (!user) {
      // Store form data and show login modal
      setPendingFormData(data);
      setShowLoginModal(true);
      return;
    }
    
    // User is authenticated, proceed with analysis
    analyzeMutation.mutate(data);
  };

  const handleLoginSuccess = () => {
    // If we have pending form data, submit it after successful login
    if (pendingFormData) {
      analyzeMutation.mutate(pendingFormData);
      setPendingFormData(null);
    }
    setShowLoginModal(false);
  };

  const currentStepData = steps.find(step => step.id === currentStep)!;
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="logo-container w-16 h-16">
              <Brain className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{currentContent.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{currentContent.subtitle}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                    isActive ? 'bg-gradient-finance text-white shadow-lg scale-110' :
                    isCompleted ? 'bg-success text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <IconComponent size={20} />
                  </div>
                  <span className={`text-sm font-medium text-center ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block w-full h-0.5 mt-6 ${
                      isCompleted ? 'bg-success' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {t({ 
                  ar: `الخطوة ${currentStep} من 4`,
                  en: `Step ${currentStep} of 4`,
                  fr: `Étape ${currentStep} sur 4`
                })}
              </span>
              <span className="text-sm text-muted-foreground">{currentStepData.progress}%</span>
            </div>
            <Progress value={currentStepData.progress} className="h-3" />
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <Card className="finance-card overflow-hidden">
            <CardHeader className="bg-gradient-finance text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <StepIcon className="h-6 w-6" />
                {currentStepData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t({ ar: "العمر", en: "Age", fr: "Âge" })}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t({ ar: "اختر عمرك", en: "Select your age", fr: "Choisissez votre âge" })} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="18-25">{t({ ar: "18-25 سنة", en: "18-25 years", fr: "18-25 ans" })}</SelectItem>
                                <SelectItem value="26-35">{t({ ar: "26-35 سنة", en: "26-35 years", fr: "26-35 ans" })}</SelectItem>
                                <SelectItem value="36-45">{t({ ar: "36-45 سنة", en: "36-45 years", fr: "36-45 ans" })}</SelectItem>
                                <SelectItem value="46-55">{t({ ar: "46-55 سنة", en: "46-55 years", fr: "46-55 ans" })}</SelectItem>
                                <SelectItem value="55+">{t({ ar: "أكثر من 55 سنة", en: "55+ years", fr: "55+ ans" })}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t({ ar: "الراتب الشهري", en: "Monthly Income", fr: "Revenu Mensuel" })}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t({ ar: "اختر راتبك الشهري", en: "Select your monthly income", fr: "Choisissez votre revenu mensuel" })} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-5000">{t({ ar: "أقل من 5,000 ريال", en: "Less than 5,000", fr: "Moins de 5,000" })}</SelectItem>
                                <SelectItem value="5000-15000">{t({ ar: "5,000 - 15,000 ريال", en: "5,000 - 15,000", fr: "5,000 - 15,000" })}</SelectItem>
                                <SelectItem value="15000-30000">{t({ ar: "15,000 - 30,000 ريال", en: "15,000 - 30,000", fr: "15,000 - 30,000" })}</SelectItem>
                                <SelectItem value="30000-50000">{t({ ar: "30,000 - 50,000 ريال", en: "30,000 - 50,000", fr: "30,000 - 50,000" })}</SelectItem>
                                <SelectItem value="50000+">{t({ ar: "أكثر من 50,000 ريال", en: "More than 50,000", fr: "Plus de 50,000" })}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="investmentBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t({ ar: "مبلغ الاستثمار المخطط له", en: "Planned Investment Amount", fr: "Montant d'Investissement Prévu" })}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder={t({ ar: "مثال: 50000", en: "Example: 50000", fr: "Exemple : 50000" })}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              💳 {t(commonTranslations.paymentFrequency)}
                              <span className="text-xs text-muted-foreground">🛈</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t({ ar: "اختر تكرار الدفع", en: "Select payment frequency", fr: "Choisissez la fréquence de paiement" })} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="one-time">💰 {t(commonTranslations.paymentOneTime)}</SelectItem>
                                <SelectItem value="monthly">📅 {t(commonTranslations.paymentMonthly)}</SelectItem>
                                <SelectItem value="annual">🗓️ {t(commonTranslations.paymentAnnual)}</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {t(commonTranslations.paymentFrequencyHelp)}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t({ ar: "العملة المفضلة", en: "Preferred Currency", fr: "Devise Préférée" })}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AED">🇦🇪 {t(commonTranslations.currencyAED)}</SelectItem>
                                <SelectItem value="SAR">🇸🇦 {t(commonTranslations.currencySAR)}</SelectItem>
                                <SelectItem value="USD">🇺🇸 {t(commonTranslations.currencyUSD)}</SelectItem>
                                <SelectItem value="EUR">🇪🇺 {t(commonTranslations.currencyEUR)}</SelectItem>
                                <SelectItem value="GBP">🇬🇧 {t(commonTranslations.currencyGBP)}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Investment Goals */}
                  {currentStep === 2 && (
                    <FormField
                      control={form.control}
                      name="goals"
                      render={() => (
                        <FormItem>
                          <FormLabel>{t({ ar: "ما هي أهدافك من الاستثمار؟ (اختر كل ما يناسبك)", en: "What are your investment goals? (Select all that apply)", fr: "Quels sont vos objectifs d'investissement ? (Sélectionnez tout ce qui s'applique)" })}</FormLabel>
                          <div className="grid md:grid-cols-2 gap-3">
                            {[
                              { 
                                id: "retirement", 
                                label: t({ ar: "التقاعد", en: "Retirement", fr: "Retraite" }),
                                desc: t({ ar: "ادخار للتقاعد والمستقبل", en: "Save for retirement and future", fr: "Épargner pour la retraite et l'avenir" })
                              },
                              { 
                                id: "education", 
                                label: t({ ar: "تعليم الأطفال", en: "Children's Education", fr: "Éducation des Enfants" }),
                                desc: t({ ar: "تكاليف التعليم الجامعي", en: "University education costs", fr: "Coûts de l'éducation universitaire" })
                              },
                              { 
                                id: "house", 
                                label: t({ ar: "شراء منزل", en: "Buy a House", fr: "Acheter une Maison" }),
                                desc: t({ ar: "دفعة أولى أو شراء عقار", en: "Down payment or property purchase", fr: "Acompte ou achat immobilier" })
                              },
                              { 
                                id: "travel", 
                                label: t({ ar: "السفر", en: "Travel", fr: "Voyage" }),
                                desc: t({ ar: "السفر والإجازات", en: "Travel and vacations", fr: "Voyages et vacances" })
                              },
                              { 
                                id: "emergency", 
                                label: t({ ar: "صندوق الطوارئ", en: "Emergency Fund", fr: "Fonds d'Urgence" }),
                                desc: t({ ar: "احتياطي للظروف الطارئة", en: "Reserve for emergencies", fr: "Réserve pour les urgences" })
                              },
                              { 
                                id: "investment", 
                                label: t({ ar: "زيادة الثروة", en: "Wealth Growth", fr: "Croissance de Richesse" }),
                                desc: t({ ar: "تنمية رأس المال", en: "Capital growth", fr: "Croissance du capital" })
                              },
                            ].map((goal) => (
                              <FormField
                                key={goal.id}
                                control={form.control}
                                name="goals"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={goal.id}
                                      className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary cursor-pointer"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(goal.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, goal.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== goal.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1">
                                        <FormLabel className="font-medium">
                                          {goal.label}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          {goal.desc}
                                        </p>
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Step 3: Risk Tolerance */}
                  {currentStep === 3 && (
                    <FormField
                      control={form.control}
                      name="riskTolerance"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t({ ar: "ما هو مستوى تحملك للمخاطر؟", en: "What is your risk tolerance level?", fr: "Quel est votre niveau de tolérance au risque ?" })}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              {[
                                { 
                                  value: "low", 
                                  label: t({ ar: "مخاطر منخفضة", en: "Low Risk", fr: "Risque Faible" }),
                                  desc: t({ ar: "أفضل الاستثمارات الآمنة حتى لو كان العائد أقل", en: "I prefer safe investments even if returns are lower", fr: "Je préfère les investissements sûrs même si les rendements sont plus faibles" }),
                                  color: "text-green-600" 
                                },
                                { 
                                  value: "medium", 
                                  label: t({ ar: "مخاطر متوسطة", en: "Medium Risk", fr: "Risque Moyen" }),
                                  desc: t({ ar: "يمكنني تحمل بعض التذبذب مقابل عوائد أفضل", en: "I can handle some volatility for better returns", fr: "Je peux gérer une certaine volatilité pour de meilleurs rendements" }),
                                  color: "text-yellow-600" 
                                },
                                { 
                                  value: "high", 
                                  label: t({ ar: "مخاطر عالية", en: "High Risk", fr: "Risque Élevé" }),
                                  desc: t({ ar: "أسعى للعوائد العالية وأتحمل التذبذب الكبير", en: "I seek high returns and can handle significant volatility", fr: "Je recherche des rendements élevés et peux gérer une volatilité importante" }),
                                  color: "text-red-600" 
                                },
                              ].map((risk) => (
                                <FormItem
                                  key={risk.value}
                                  className="flex items-start space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary cursor-pointer"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={risk.value} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className={`font-medium ${risk.color}`}>
                                      {risk.label}
                                    </FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                      {risk.desc}
                                    </p>
                                  </div>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Step 4: Investment Preferences & Market Settings */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      {/* Investment Types */}
                      <FormField
                        control={form.control}
                        name="preferences"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">{t({ ar: "أنواع الاستثمارات المفضلة", en: "Preferred Investment Types", fr: "Types d'Investissements Préférés" })}</FormLabel>
                            <div className="grid md:grid-cols-2 gap-3">
                              {[
                                { 
                                  id: "real-estate", 
                                  label: t({ ar: "العقارات", en: "Real Estate", fr: "Immobilier" }),
                                  icon: "🏠", 
                                  desc: t({ ar: "استثمارات عقارية وأراضي", en: "Property and land investments", fr: "Investissements immobiliers et fonciers" })
                                },
                                { 
                                  id: "gold", 
                                  label: t({ ar: "الذهب", en: "Gold", fr: "Or" }),
                                  icon: "🥇", 
                                  desc: t({ ar: "المعادن الثمينة والذهب", en: "Precious metals and gold", fr: "Métaux précieux et or" })
                                },
                                { 
                                  id: "stocks", 
                                  label: t({ ar: "الأسهم", en: "Stocks", fr: "Actions" }),
                                  icon: "📈", 
                                  desc: t({ ar: "أسهم الشركات المحلية والعالمية", en: "Local and international company shares", fr: "Actions d'entreprises locales et internationales" })
                                },
                                { 
                                  id: "crowdfunding", 
                                  label: t({ ar: "التمويل الجماعي", en: "Crowdfunding", fr: "Financement Participatif" }),
                                  icon: "👥", 
                                  desc: t({ ar: "مشاريع التمويل الجماعي", en: "Crowdfunding projects", fr: "Projets de financement participatif" })
                                },
                                { 
                                  id: "sukuk", 
                                  label: t({ ar: "الصكوك الإسلامية", en: "Islamic Sukuk", fr: "Sukuk Islamiques" }),
                                  icon: "📜", 
                                  desc: t({ ar: "صكوك متوافقة مع الشريعة", en: "Sharia-compliant bonds", fr: "Obligations conformes à la charia" })
                                },
                                { 
                                  id: "bonds", 
                                  label: t({ ar: "السندات", en: "Bonds", fr: "Obligations" }),
                                  icon: "📄", 
                                  desc: t({ ar: "سندات حكومية وشركات", en: "Government and corporate bonds", fr: "Obligations gouvernementales et d'entreprise" })
                                },
                                { 
                                  id: "savings", 
                                  label: t({ ar: "حسابات الادخار", en: "Savings Accounts", fr: "Comptes d'Épargne" }),
                                  icon: "🏦", 
                                  desc: t({ ar: "ودائع وشهادات ادخار", en: "Deposits and savings certificates", fr: "Dépôts et certificats d'épargne" })
                                },
                                { 
                                  id: "crypto", 
                                  label: t({ ar: "العملات الرقمية", en: "Cryptocurrencies", fr: "Cryptomonnaies" }),
                                  icon: "₿", 
                                  desc: t({ ar: "البيتكوين والعملات الرقمية", en: "Bitcoin and digital currencies", fr: "Bitcoin et monnaies numériques" })
                                },
                              ].map((pref) => (
                                <FormField
                                  key={pref.id}
                                  control={form.control}
                                  name="preferences"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={pref.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:border-primary cursor-pointer"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(pref.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, pref.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== pref.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <span className="text-xl">{pref.icon}</span>
                                        <div className="space-y-1">
                                          <FormLabel className="font-medium">
                                            {pref.label}
                                          </FormLabel>
                                          <p className="text-xs text-muted-foreground">
                                            {pref.desc}
                                          </p>
                                        </div>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      {/* Market Preferences Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">{t({ ar: "إعدادات السوق والتفضيلات", en: "Market Settings and Preferences", fr: "Paramètres de Marché et Préférences" })}</h3>
                        
                        {/* Target Market */}
                        <FormField
                          control={form.control}
                          name="targetMarket"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                🌍 {t(commonTranslations.targetMarket)}
                                <span className="text-xs text-muted-foreground">🛈</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر السوق المستهدف" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UAE">🇦🇪 {t(commonTranslations.marketUAE)}</SelectItem>
                                  <SelectItem value="Saudi Arabia">🇸🇦 {t(commonTranslations.marketSaudiArabia)}</SelectItem>
                                  <SelectItem value="Gulf Countries">🏛️ {t(commonTranslations.marketGulf)}</SelectItem>
                                  <SelectItem value="International">🌍 {t(commonTranslations.marketInternational)}</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                {t(commonTranslations.targetMarketHelp)}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Diversification Preference */}
                        <FormField
                          control={form.control}
                          name="allowDiversification"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  🔀 {t(commonTranslations.diversification)}
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  {t(commonTranslations.diversificationHelp)}
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Islamic Compliance */}
                        <FormField
                          control={form.control}
                          name="islamicCompliance"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  🕌 {t(commonTranslations.islamicCompliance)}
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  {t(commonTranslations.islamicComplianceHelp)}
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <div className="flex gap-3">
                      <Link href="/">
                        <Button 
                          type="button" 
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Home className="h-4 w-4" />
                          {t({ ar: "الرئيسية", en: "Home", fr: "Accueil" })}
                        </Button>
                      </Link>
                      {currentStep > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={prevStep}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          {currentContent.buttons.prev}
                        </Button>
                      )}
                    </div>
                    
                    {currentStep < 4 ? (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="btn-finance flex items-center gap-2 ml-auto"
                      >
                        {currentContent.buttons.next}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit"
                        disabled={analyzeMutation.isPending}
                        className="btn-finance flex items-center gap-2 ml-auto"
                      >
                        {analyzeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Brain className="h-4 w-4" />
                        {currentContent.buttons.analyze}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}