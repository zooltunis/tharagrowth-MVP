import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { userDataSchema, type UserData } from "@shared/schema";
import { analyzeInvestmentData } from "@/lib/openai";
import { ArrowRight, ArrowLeft, Brain, Loader2 } from "lucide-react";

const steps = [
  { id: 1, title: "معلومات شخصية", progress: 25 },
  { id: 2, title: "أهداف الاستثمار", progress: 50 },
  { id: 3, title: "مستوى تحمل المخاطر", progress: 75 },
  { id: 4, title: "تفضيلات الاستثمار", progress: 100 },
];

export default function DataCollectionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              الخطوة {currentStep} من 4
            </span>
            <span className="text-sm text-gray-500">{currentStepData.progress}%</span>
          </div>
          <Progress value={currentStepData.progress} className="h-2" />
        </div>

        {/* Form Container */}
        <Card className="shadow-lg border-gray-100 overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentStepData.title}</h2>
            
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
                      تحليل البيانات
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
