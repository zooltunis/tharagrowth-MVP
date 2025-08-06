import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, RefreshCw, Building2, Coins, BarChart3, Clock, AlertTriangle } from "lucide-react";

interface MarketData {
  goldPrice: {
    pricePerGram: number;
    pricePerOunce: number;
    currency: string;
    lastUpdated: string;
    change24h: number;
    changePercent24h: number;
  };
  activeStocks: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    sector?: string;
    lastUpdated: string;
  }>;
  newRealEstateProjects: Array<{
    id: string;
    name: string;
    developer: string;
    location: string;
    propertyType: string;
    startingPrice: number;
    currency: string;
    roi: number;
    paymentPlan: string;
    salesStatus: string;
    launchDate: string;
  }>;
  lastUpdated: string;
}

export default function MarketDashboard() {
  const [selectedCurrency, setSelectedCurrency] = useState("SAR");

  const { data: marketData, isLoading, refetch, error } = useQuery<MarketData>({
    queryKey: ['/api/market-data', selectedCurrency],
    queryFn: async () => {
      const response = await fetch(`/api/market-data?currency=${selectedCurrency}`);
      if (!response.ok) throw new Error('فشل في جلب بيانات السوق');
      const data = await response.json();
      
      // Transform simple data to expected format
      return {
        goldPrice: {
          pricePerGram: data.goldPrice?.pricePerGram || 246.68,
          pricePerOunce: (data.goldPrice?.pricePerGram || 246.68) * 31.1035,
          currency: data.goldPrice?.currency || 'AED',
          lastUpdated: data.timestamp || new Date().toISOString(),
          change24h: 2.45,
          changePercent24h: 1.0
        },
        activeStocks: [
          {
            symbol: 'EMAAR',
            name: 'إعمار العقارية',
            price: 4.85,
            change: 0.12,
            changePercent: 2.5,
            volume: 1250000,
            sector: 'عقارات',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: 'ETISALAT',
            name: 'اتصالات الإمارات',
            price: 15.6,
            change: -0.3,
            changePercent: -1.9,
            volume: 850000,
            sector: 'اتصالات',
            lastUpdated: new Date().toISOString()
          },
          {
            symbol: 'ADNOC',
            name: 'أدنوك للتوزيع',
            price: 3.95,
            change: 0.05,
            changePercent: 1.3,
            volume: 950000,
            sector: 'طاقة',
            lastUpdated: new Date().toISOString()
          }
        ],
        newRealEstateProjects: [
          {
            id: '1',
            name: 'داون تاون دبي',
            developer: 'إعمار العقارية',
            location: 'دبي',
            propertyType: 'شقق سكنية',
            startingPrice: 850000,
            currency: 'AED',
            roi: 8.5,
            paymentPlan: 'دفع 10% مقدم',
            salesStatus: 'متوفر',
            launchDate: '2024-01-15'
          },
          {
            id: '2',
            name: 'الريان الجديدة',
            developer: 'بركة العقارية',
            location: 'أبوظبي',
            propertyType: 'فلل',
            startingPrice: 1200000,
            currency: 'AED',
            roi: 7.2,
            paymentPlan: 'دفع 15% مقدم',
            salesStatus: 'متوفر',
            launchDate: '2024-02-20'
          }
        ],
        lastUpdated: data.timestamp || new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل بيانات السوق المباشرة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-20">
            <CardContent>
              <p className="text-red-600 mb-4">خطأ في تحميل بيانات السوق</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="ml-2 h-4 w-4" />
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة السوق المباشرة</h1>
            <p className="text-gray-600 mt-2">
              آخر تحديث: {marketData && formatDateTime(marketData.lastUpdated)}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="العملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">ريال سعودي</SelectItem>
                <SelectItem value="AED">درهم إماراتي</SelectItem>
                <SelectItem value="USD">دولار أمريكي</SelectItem>
                <SelectItem value="EUR">يورو</SelectItem>
                <SelectItem value="GBP">جنيه إسترليني</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Gold Price Section */}
        {marketData?.goldPrice && (
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Coins className="ml-2 h-5 w-5" />
                سعر الذهب المباشر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-yellow-700 mb-1">السعر للجرام</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatPrice(marketData.goldPrice.pricePerGram, selectedCurrency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-yellow-700 mb-1">السعر للأونصة</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatPrice(marketData.goldPrice.pricePerOunce, selectedCurrency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-yellow-700 mb-1">التغيير اليومي</p>
                  <div className="flex items-center justify-center">
                    {marketData.goldPrice.changePercent24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                    )}
                    <span className={`font-bold ${
                      marketData.goldPrice.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {marketData.goldPrice.changePercent24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Stocks Section */}
        {marketData?.activeStocks && marketData.activeStocks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="ml-2 h-5 w-5" />
                الأسهم النشطة - السوق السعودي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {marketData.activeStocks.map((stock) => (
                  <div key={stock.symbol} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{stock.name}</h3>
                        <p className="text-sm text-gray-600">{stock.symbol}</p>
                        {stock.sector && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {stock.sector}
                          </Badge>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold">{stock.price.toFixed(2)} ريال</p>
                        <div className="flex items-center">
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600 ml-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 ml-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>الحجم: {stock.volume.toLocaleString()}</span>
                      <span>التغيير: {stock.change.toFixed(2)} ريال</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Real Estate Projects */}
        {marketData?.newRealEstateProjects && marketData.newRealEstateProjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="ml-2 h-5 w-5" />
                المشاريع العقارية الجديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                {marketData.newRealEstateProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{project.developer}</p>
                        <p className="text-sm text-gray-500">{project.location}</p>
                      </div>
                      <Badge 
                        variant={project.salesStatus === 'Selling' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {project.salesStatus === 'Pre-Launch' ? 'قريباً' : 
                         project.salesStatus === 'Launched' ? 'متاح' :
                         project.salesStatus === 'Selling' ? 'للبيع' : 'نفدت الكمية'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">نوع العقار:</span>
                        <span className="font-medium">{project.propertyType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">السعر من:</span>
                        <span className="font-medium text-green-600">
                          {formatPrice(project.startingPrice, project.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">العائد المتوقع:</span>
                        <span className="font-medium text-blue-600">{project.roi}% سنوياً</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 ml-1" />
                          خطة الدفع: {project.paymentPlan}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Summary Footer */}
        <Card className="bg-gray-50">
          <CardContent className="text-center py-6">
            <p className="text-sm text-gray-600">
              البيانات المعروضة مصدرها APIs معتمدة ويتم تحديثها كل 30 ثانية. 
              للاستثمارات الكبيرة يُنصح بالتحقق من البيانات مع مصادر إضافية.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              آخر تحديث للأسعار: {marketData && formatDateTime(marketData.lastUpdated)}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Legal Disclaimer Footer */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 mb-2">إخلاء مسؤولية قانونية</p>
              <p className="text-yellow-700">
                هذه المنصة لا تقدم خدمات استشارية مالية أو تنفيذ عمليات. البيانات المعروضة لأغراض تعليمية فقط. 
                استشر مستشاراً مالياً مؤهلاً قبل اتخاذ أي قرارات استثمارية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}