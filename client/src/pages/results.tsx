import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, RotateCcw, Download, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ResultsPage() {
  const { id } = useParams();
  const chartRef = useRef<HTMLCanvasElement>(null);

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["/api/analysis", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (analysis?.recommendations?.allocation && chartRef.current) {
      renderPieChart();
    }
  }, [analysis]);

  const renderPieChart = () => {
    if (!analysis?.recommendations?.allocation || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Import Chart.js dynamically
    import('chart.js/auto').then(({ Chart }) => {
      const data = analysis.recommendations.allocation;
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

  const { allocation, summary, expectedReturn, riskLevel } = analysis.recommendations;
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
      </div>
    </div>
  );
}
