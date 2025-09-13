import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, RotateCcw, Download, Loader2, AlertCircle, MapPin, Clock, TrendingUp, Shield, DollarSign, AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { auth, db } from './lib/firebase';

export default function ResultsPage() {
  const { id } = useParams();
  const chartRef = useRef<HTMLCanvasElement>(null);

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["/api/analysis", id],
    enabled: !!id,
  }) as { data: any, isLoading: boolean, error: any };

  useEffect(() => {
    if (analysis?.recommendations && chartRef.current) {
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
    
    recommendations.forEach((rec: any) => {
      const category = rec.type;
      allocation[category] = (allocation[category] || 0) + rec.amount;
    });

    // Convert to percentages
    Object.keys(allocation).forEach(key => {
      allocation[key] = totalAmount > 0 ? (allocation[key] / totalAmount) * 100 : 0;
    });

    // Import Chart.js dynamically
    import('chart.js/auto').then(({ Chart }) => {
      const data = allocation;
      const colors = [
        '#1E40AF', '#059669', '#DC2626', '#F59E0B', 
        '#8B5CF6', '#06B6D4', '#10B981', '#F97316'
      ];

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: colors.slice(0, Object.keys(data).length),
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 animate-pulse">
            <Loader2 className="text-white text-3xl animate-spin" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">جاري تحليل بياناتك...</h2>
          <p className="text-gray-600">يرجى الانتظار بينما نقوم بإنشاء توصيات استثمارية مخصصة لك</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">خطأ في تحميل التحليل</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              لم نتمكن من العثور على التحليل المطلوب
            </p>
            <Link href="/">
              <Button className="mt-4 w-full">العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { allocation, summary, expectedReturn, riskLevel, detailedRecommendations } = analysis.recommendations;
  const colors = [
    '#1E40AF', '#059669', '#DC2626', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#10B981', '#F97316'
  ];

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

        {/* Results Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="shadow-lg border-gray-100">
            <CardHeader>
              <CardTitle>توزيع المحفظة الاستثمارية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-80">
                <canvas ref={chartRef} className="max-w-full"></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Details */}
          <Card className="shadow-lg border-gray-100">
            <CardHeader>
              <CardTitle>تفاصيل التوزيع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(allocation).map(([type, percentage], index) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full ml-3" 
                        style={{ backgroundColor: colors[index] }}
                      ></div>
                      <span className="font-medium">{type}</span>
                    </div>
                    <span className="text-lg font-bold">{percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Summary */}
        <Card className="shadow-lg border-gray-100 mb-8">
          <CardHeader>
            <CardTitle>ملخص التوصيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-lg text-blue-900 mb-2">العائد المتوقع السنوي</h4>
              <p className="text-3xl font-bold text-blue-600">{expectedReturn}%</p>
              <p className="text-blue-700 text-sm mt-2">هذا تقدير تقريبي وقد يختلف العائد الفعلي</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-lg text-gray-900 mb-2">مستوى المخاطر</h4>
              <p className="text-xl font-semibold text-gray-700">{riskLevel}</p>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {summary}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Recommendations Section */}
        {detailedRecommendations && detailedRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">التوصيات التفصيلية</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {detailedRecommendations.map((recommendation: any, index: number) => (
                <Card key={recommendation.id} className="shadow-lg border-gray-100 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{recommendation.type}</p>
                      </div>
                      <Badge 
                        variant={
                          recommendation.recommendation === 'شراء قوي' ? 'default' :
                          recommendation.recommendation === 'شراء' ? 'secondary' : 'outline'
                        }
                        className="shrink-0"
                      >
                        {recommendation.recommendation}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{recommendation.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 text-green-500 ml-2" />
                        <div>
                          <p className="font-medium">السعر</p>
                          <p className="text-gray-600">{recommendation.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-500 ml-2" />
                        <div>
                          <p className="font-medium">العائد المتوقع</p>
                          <p className="text-gray-600">{recommendation.expectedReturn}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Shield className="h-4 w-4 text-orange-500 ml-2" />
                        <div>
                          <p className="font-medium">مستوى المخاطر</p>
                          <p className="text-gray-600">{recommendation.riskLevel}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-purple-500 ml-2" />
                        <div>
                          <p className="font-medium">المدة المتوقعة</p>
                          <p className="text-gray-600">{recommendation.timeline}</p>
                        </div>
                      </div>
                    </div>
                    
                    {recommendation.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-red-500 ml-2" />
                        <div>
                          <p className="font-medium">الموقع</p>
                          <p className="text-gray-600">{recommendation.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {recommendation.paymentPlan && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">خطة الدفع</p>
                        <p className="text-sm text-blue-700">{recommendation.paymentPlan}</p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">الحد الأدنى للاستثمار</p>
                      <p className="text-sm text-gray-700">{recommendation.minimumInvestment}</p>
                    </div>
                    
                    {recommendation.features && recommendation.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">المميزات الرئيسية</p>
                        <div className="flex flex-wrap gap-1">
                          {recommendation.features.map((feature: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {recommendation.currentPrice && recommendation.targetPrice && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium text-green-900">السعر الحالي</p>
                            <p className="text-green-700">{recommendation.currentPrice}</p>
                          </div>
                          <div>
                            <p className="font-medium text-green-900">السعر المستهدف</p>
                            <p className="text-green-700">{recommendation.targetPrice}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Link href="/">
            <Button variant="outline">
              <RotateCcw className="ml-2 h-4 w-4" />
              إعادة التحليل
            </Button>
          </Link>
          <Button 
            onClick={() => {
              // TODO: Implement PDF report generation
              alert('سيتم إضافة ميزة تحميل التقرير قريباً');
            }}
          >
            <Download className="ml-2 h-4 w-4" />
            تحميل التقرير
          </Button>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 mb-2">إخلاء مسؤولية قانونية</p>
              <p className="text-yellow-700">
                هذه المنصة لا تقدم خدمات استشارية مالية أو تنفيذ عمليات. تقدم فقط رؤى استثمارية قائمة على الذكاء الاصطناعي لأغراض تعليمية. 
                استشر مستشاراً مالياً مؤهلاً قبل اتخاذ أي قرارات استثمارية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
