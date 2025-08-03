import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Coins, Brain } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <TrendingUp className="text-white text-3xl" size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            TharaGrowth
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            تطبيق ذكي لتوصيات الاستثمار المخصصة
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="text-primary text-xl" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">تحليل ذكي</h3>
              <p className="text-gray-600 text-sm">توصيات استثمارية مخصصة باستخدام الذكاء الاصطناعي</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-500 text-xl" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">إدارة المخاطر</h3>
              <p className="text-gray-600 text-sm">توزيع الاستثمار حسب مستوى تحملك للمخاطر</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Coins className="text-yellow-500 text-xl" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">تنويع الاستثمار</h3>
              <p className="text-gray-600 text-sm">عقارات، أسهم، ذهب وخيارات استثمارية متنوعة</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/collect-data">
              <Button size="lg" className="text-lg px-8 py-4 h-auto">
                ابدأ رحلة الاستثمار
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                السوق المباشر
              </Button>
            </Link>
          </div>
          <p className="text-gray-500 text-sm">مجاني تماماً • لا يتطلب تسجيل دخول</p>
        </div>
      </div>
    </div>
  );
}
