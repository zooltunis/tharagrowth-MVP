import { useState } from "react";
import { useLocation } from "wouter";
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
import { ArrowRight, ArrowLeft, Brain, Loader2, User, Target, Shield, Settings } from "lucide-react";
import { useLanguage, useTranslation, commonTranslations } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";

export default function DataCollectionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

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
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: UserData) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    analyzeMutation.mutate(data);
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
                            <FormLabel>العمر</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر عمرك" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="18-25">18-25 سنة</SelectItem>
                                <SelectItem value="26-35">26-35 سنة</SelectItem>
                                <SelectItem value="36-45">36-45 سنة</SelectItem>
                                <SelectItem value="46-55">46-55 سنة</SelectItem>
                                <SelectItem value="55+">أكثر من 55 سنة</SelectItem>
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
                            <FormLabel>الراتب الشهري</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر راتبك الشهري" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-5000">أقل من 5,000 ريال</SelectItem>
                                <SelectItem value="5000-15000">5,000 - 15,000 ريال</SelectItem>
                                <SelectItem value="15000-30000">15,000 - 30,000 ريال</SelectItem>
                                <SelectItem value="30000-50000">30,000 - 50,000 ريال</SelectItem>
                                <SelectItem value="50000+">أكثر من 50,000 ريال</SelectItem>
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
                            <FormLabel>مبلغ الاستثمار المخطط له</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="مثال: 50000"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العملة</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AED">{t(commonTranslations.currencyAED)}</SelectItem>
                                <SelectItem value="SAR">{t(commonTranslations.currencySAR)}</SelectItem>
                                <SelectItem value="USD">{t(commonTranslations.currencyUSD)}</SelectItem>
                                <SelectItem value="EUR">{t(commonTranslations.currencyEUR)}</SelectItem>
                                <SelectItem value="GBP">{t(commonTranslations.currencyGBP)}</SelectItem>
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
                          <FormLabel>ما هي أهدافك من الاستثمار؟ (اختر كل ما يناسبك)</FormLabel>
                          <div className="grid md:grid-cols-2 gap-3">
                            {[
                              { id: "retirement", label: "التقاعد", desc: "ادخار للتقاعد والمستقبل" },
                              { id: "education", label: "تعليم الأطفال", desc: "تكاليف التعليم الجامعي" },
                              { id: "house", label: "شراء منزل", desc: "دفعة أولى أو شراء عقار" },
                              { id: "travel", label: "السفر", desc: "السفر والإجازات" },
                              { id: "emergency", label: "صندوق الطوارئ", desc: "احتياطي للظروف الطارئة" },
                              { id: "investment", label: "زيادة الثروة", desc: "تنمية رأس المال" },
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
                          <FormLabel>ما هو مستوى تحملك للمخاطر؟</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-4"
                            >
                              {[
                                { value: "low", label: "مخاطر منخفضة", desc: "أفضل الاستثمارات الآمنة حتى لو كان العائد أقل", color: "text-green-600" },
                                { value: "medium", label: "مخاطر متوسطة", desc: "يمكنني تحمل بعض التذبذب مقابل عوائد أفضل", color: "text-yellow-600" },
                                { value: "high", label: "مخاطر عالية", desc: "أسعى للعوائد العالية وأتحمل التذبذب الكبير", color: "text-red-600" },
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
                            <FormLabel className="text-lg font-semibold">أنواع الاستثمارات المفضلة</FormLabel>
                            <div className="grid md:grid-cols-2 gap-3">
                              {[
                                { id: "real-estate", label: "العقارات", icon: "🏠", desc: "استثمارات عقارية وأراضي" },
                                { id: "gold", label: "الذهب", icon: "🥇", desc: "المعادن الثمينة والذهب" },
                                { id: "stocks", label: "الأسهم", icon: "📈", desc: "أسهم الشركات المحلية والعالمية" },
                                { id: "crowdfunding", label: "التمويل الجماعي", icon: "👥", desc: "مشاريع التمويل الجماعي" },
                                { id: "sukuk", label: "الصكوك الإسلامية", icon: "📜", desc: "صكوك متوافقة مع الشريعة" },
                                { id: "bonds", label: "السندات", icon: "📄", desc: "سندات حكومية وشركات" },
                                { id: "savings", label: "حسابات الادخار", icon: "🏦", desc: "ودائع وشهادات ادخار" },
                                { id: "crypto", label: "العملات الرقمية", icon: "₿", desc: "البيتكوين والعملات الرقمية" },
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
                        <h3 className="text-lg font-semibold text-foreground">إعدادات السوق والتفضيلات</h3>
                        
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
    </div>
  );
}