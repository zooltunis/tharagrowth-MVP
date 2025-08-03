import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, RotateCcw, Download, Loader2, AlertCircle, MapPin, Clock, TrendingUp, Shield, DollarSign, AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ResultsPage() {
  const { id } = useParams();
  const chartRef = useRef<HTMLCanvasElement>(null);

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["/api/analysis", id],
    enabled: !!id,
  }) as { data: any, isLoading: boolean, error: any };

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
        const category = rec.type;
        allocation[category] = (allocation[category] || 0) + rec.amount;
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
          <p className="text-gray-600">جاري تحميل التوصيات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل التوصيات الاستثمارية</p>
          <Link href="/">
            <Button>العودة للرئيسية</Button>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد توصيات</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على توصيات لهذا التحليل</p>
          <Link href="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from the new structure
  const recommendations = analysis.recommendations.recommendations || [];
  const totalAllocated = analysis.recommendations.totalAllocated || 0;
  const remainingAmount = analysis.recommendations.remainingAmount || 0;
  const summary = analysis.recommendations.analysis || "لا يوجد ملخص متاح";
  const strategy = analysis.recommendations.strategy || "غير محدد";
  const riskLevel = analysis.recommendations.riskProfile || "غير محدد";
  
  // Calculate allocation from recommendations for display
  const allocation: Record<string, number> = {};
  if (recommendations.length > 0 && totalAllocated > 0) {
    recommendations.forEach((rec: any) => {
      const category = rec.type;
      allocation[category] = (allocation[category] || 0) + rec.amount;
    });
    
    // Convert to percentages
    Object.keys(allocation).forEach(key => {
      allocation[key] = (allocation[key] / totalAllocated) * 100;
    });
  }
  
  // Calculate expected return from recommendations
  let expectedReturn = "8-12";
  if (recommendations.length > 0) {
    const avgReturn = recommendations.reduce((sum: number, rec: any) => sum + (rec.expectedReturn || 8), 0) / recommendations.length;
    expectedReturn = avgReturn.toFixed(1);
  }

  const colors = [
    '#1E40AF', '#059669', '#DC2626', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#10B981', '#F97316'
  ];

  const translateType = (type: string) => {
    const translations: { [key: string]: string } = {
      'stocks': 'الأسهم',
      'real-estate': 'العقارات',
      'gold': 'الذهب',
      'bonds': 'السندات',
      'savings': 'الادخار',
      'crypto': 'العملات المشفرة',
      'crowdfunding': 'التمويل الجماعي'
    };
    return translations[type] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">توصياتك الاستثمارية</h1>
          <p className="text-gray-600">تم إنشاء محفظة استثمارية مخصصة حسب ملفك الشخصي</p>
        </div>

        {/* Investment Summary */}
        <Card className="shadow-lg border-gray-100 mb-8">
          <CardHeader>
            <CardTitle>ملخص المحفظة الاستثمارية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <DollarSign className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-bold text-blue-900">إجمالي الاستثمار</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAllocated)}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-bold text-green-900">العائد المتوقع</h4>
                <p className="text-2xl font-bold text-green-600">{expectedReturn}%</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Shield className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-bold text-purple-900">مستوى المخاطر</h4>
                <p className="text-xl font-bold text-purple-600">{riskLevel}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Clock className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                <h4 className="font-bold text-orange-900">الاستراتيجية</h4>
                <p className="text-xl font-bold text-orange-600">{strategy}</p>
              </div>
            </div>

            {/* Portfolio Chart and Allocation */}
            {Object.keys(allocation).length > 0 && (
              <div className="grid lg:grid-cols-2 gap-8 mb-6">
                {/* Pie Chart */}
                <div>
                  <h4 className="font-bold text-lg mb-4">توزيع المحفظة</h4>
                  <div className="relative h-64">
                    <canvas ref={chartRef} className="max-w-full"></canvas>
                  </div>
                </div>

                {/* Allocation Details */}
                <div>
                  <h4 className="font-bold text-lg mb-4">تفاصيل التوزيع</h4>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">التوصيات التفصيلية</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {recommendations.map((recommendation: any, index: number) => (
                <Card key={index} className="shadow-lg border-gray-100 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <CardTitle className="text-lg">{recommendation.name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{translateType(recommendation.type)}</p>
                      </div>
                      <Badge 
                        variant={
                          recommendation.riskLevel === 'منخفض' ? 'default' :
                          recommendation.riskLevel === 'متوسط' ? 'secondary' : 'destructive'
                        }
                        className="shrink-0"
                      >
                        {recommendation.riskLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{recommendation.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">المبلغ:</span>
                        <p className="font-bold">{formatCurrency(recommendation.amount)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">الكمية:</span>
                        <p className="font-bold">{recommendation.quantity}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">العائد المتوقع:</span>
                        <p className="font-bold text-green-600">{recommendation.expectedReturn}%</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">العملة:</span>
                        <p className="font-bold">{recommendation.currency}</p>
                      </div>
                    </div>

                    {recommendation.paymentPlan && (
                      <div>
                        <span className="font-medium text-gray-500">خطة الدفع:</span>
                        <p className="text-sm">{recommendation.paymentPlan}</p>
                      </div>
                    )}

                    {recommendation.features && recommendation.features.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-500 mb-2 block">المميزات:</span>
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
              <h3 className="text-xl font-bold text-yellow-900 mb-2">لا توجد توصيات متاحة</h3>
              <p className="text-yellow-700 mb-6">
                لم نتمكن من العثور على استثمارات مناسبة ضمن المعايير المحددة. 
                قد تحتاج إلى تعديل مبلغ الاستثمار أو تفضيلات الاستثمار.
              </p>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>المبلغ المتاح: {formatCurrency(totalAllocated)}</p>
                <p>المبلغ المتبقي: {formatCurrency(remainingAmount)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/data-collection">
            <Button variant="outline" className="w-full sm:w-auto">
              <RotateCcw className="ml-2 h-4 w-4" />
              إجراء تحليل جديد
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto">
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 ml-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-900 mb-2">إخلاء مسؤولية قانونية</h4>
              <p className="text-red-800 text-sm leading-relaxed">
                هذه التوصيات مخصصة لأغراض تعليمية فقط وليست استشارة مالية مهنية. 
                يجب عليك استشارة مستشار مالي مؤهل قبل اتخاذ أي قرارات استثمارية. 
                قد تفقد بعض أو كل أموالك المستثمرة. الأداء السابق لا يضمن النتائج المستقبلية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}