import { useState } from "react";
import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { useToast } from "@/hooks/use-toast";
import { userDataSchema, type UserData } from "@shared/schema";
import { analyzeInvestmentData } from "@/lib/openai";
import { ArrowRight, ArrowLeft, Brain, Loader2, AlertTriangle, User, Target, Shield, Settings } from "lucide-react";

export default function DataCollectionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLang, setCurrentLang] = useState("ar");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      fields: {
        age: "العمر",
        income: "الراتب الشهري",
        investmentBudget: "مبلغ الاستثمار",
        currency: "العملة",
        goals: "أهداف الاستثمار",
        riskTolerance: "مستوى تحمل المخاطر",
        preferences: "تفضيلات الاستثمار"
      },
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
      fields: {
        age: "Age",
        income: "Monthly Income",
        investmentBudget: "Investment Amount",
        currency: "Currency",
        goals: "Investment Goals",
        riskTolerance: "Risk Tolerance",
        preferences: "Investment Preferences"
      },
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
      fields: {
        age: "Âge",
        income: "Revenu Mensuel",
        investmentBudget: "Montant d'Investissement",
        currency: "Devise",
        goals: "Objectifs d'Investissement",
        riskTolerance: "Tolérance au Risque",
        preferences: "Préférences d'Investissement"
      },
      buttons: {
        next: "Suivant",
        prev: "Précédent",
        analyze: "Analyser les Données"
      }
    }
  };

  const currentContent = content[currentLang as keyof typeof content];
  const steps = currentContent.steps;

  const form = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      age: "",
      income: "",
      investmentBudget: 50000,
      currency: "SAR",

      goals: [],
      riskTolerance: "",
      preferences: [],
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeInvestmentData,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50" dir={currentLang === "ar" ? "rtl" : "ltr"}>
      <Header currentLang={currentLang} onLanguageChange={setCurrentLang} />
      
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
                {currentLang === "en" ? `Step ${currentStep} of 4` :
                 currentLang === "fr" ? `Étape ${currentStep} sur 4` :
                 `الخطوة ${currentStep} من 4`}
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
                {React.createElement(currentStepData.icon, { className: "h-6 w-6" })}
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
                          <FormLabel>الدخل الشهري (ريال سعودي)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر دخلك الشهري" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="<5000">أقل من 5,000 ريال</SelectItem>
                              <SelectItem value="5000-10000">5,000 - 10,000 ريال</SelectItem>
                              <SelectItem value="10000-20000">10,000 - 20,000 ريال</SelectItem>
                              <SelectItem value="20000-50000">20,000 - 50,000 ريال</SelectItem>
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
                          <FormLabel>الميزانية المتاحة للاستثمار</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="أدخل المبلغ"
                              min={100}
                              max={10000000}
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="text-left"
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
                                <SelectValue placeholder="اختر العملة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                              <SelectItem value="EUR">يورو (EUR)</SelectItem>
                              <SelectItem value="GBP">جنيه إسترليني (GBP)</SelectItem>
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
                        <FormLabel>ما هو هدفك الرئيسي من الاستثمار؟ (يمكنك اختيار أكثر من هدف)</FormLabel>
                        <div className="space-y-3">
                          {[
                            { id: "retirement", label: "التقاعد", desc: "التحضير للتقاعد والاستقلال المالي" },
                            { id: "passive-income", label: "الدخل السلبي", desc: "توليد دخل شهري منتظم" },
                            { id: "capital-growth", label: "نمو رأس المال", desc: "زيادة قيمة الاستثمار على المدى الطويل" },
                            { id: "children-savings", label: "الادخار للأطفال", desc: "بناء مستقبل آمن للأطفال والتعليم" },
                            { id: "wealth-preservation", label: "حفظ الثروة", desc: "حماية الأموال من التضخم" },
                            { id: "emergency-fund", label: "صندوق الطوارئ", desc: "إنشاء احتياطي مالي للظروف الطارئة" },
                          ].map((goal) => (
                            <FormField
                              key={goal.id}
                              control={form.control}
                              name="goals"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={goal.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer"
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
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="font-medium">
                                        {goal.label}
                                      </FormLabel>
                                      <p className="text-sm text-gray-500">
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
                        <FormLabel>ما مدى استعدادك لتحمل المخاطر في استثماراتك؟</FormLabel>
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
                                className="flex items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer"
                              >
                                <FormControl>
                                  <RadioGroupItem value={risk.value} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className={`font-medium ${risk.color}`}>
                                    {risk.label}
                                  </FormLabel>
                                  <p className="text-sm text-gray-500">
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

                {/* Step 4: Investment Preferences */}
                {currentStep === 4 && (
                  <FormField
                    control={form.control}
                    name="preferences"
                    render={() => (
                      <FormItem>
                        <FormLabel>أي أنواع الاستثمار تثير اهتمامك؟ (اختر كل ما يناسبك)</FormLabel>
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
                                    className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer"
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
                                      <p className="text-xs text-gray-500">
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
                )}

                {/* Navigation Buttons */}
                <div className="border-t border-gray-100 pt-6 flex justify-between">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowRight className="ml-2 h-4 w-4" />
                      السابق
                    </Button>
                  )}
                  
                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      التالي
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="ml-auto bg-green-600 hover:bg-green-700"
                      disabled={analyzeMutation.isPending}
                    >
                      {analyzeMutation.isPending ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="ml-2 h-4 w-4" />
                      )}
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
}
