import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userDataSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-fake-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze investment data using AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const userData = userDataSchema.parse(req.body);
      
      // Generate AI recommendations
      const recommendations = await generateInvestmentRecommendations(userData);
      
      // Store the analysis
      const analysis = await storage.createInvestmentAnalysis({
        ...userData,
        recommendations
      });
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(400).json({ 
        message: error.message || "فشل في تحليل البيانات"
      });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getInvestmentAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "التحليل غير موجود" });
      }
      
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateInvestmentRecommendations(userData: any) {
  const prompt = `
أنت خبير مالي متخصص في الاستثمار. قم بتحليل البيانات التالية وقدم توصيات استثمارية مخصصة:

بيانات المستخدم:
- العمر: ${userData.age}
- الدخل الشهري: ${userData.income}
- المبلغ المتاح للاستثمار: ${userData.investmentAmount}
- أهداف الاستثمار: ${userData.goals.join(', ')}
- مستوى تحمل المخاطر: ${userData.riskTolerance}
- تفضيلات الاستثمار: ${userData.preferences.join(', ')}

قم بإنشاء توصيات استثمارية تتضمن:
1. توزيع المحفظة بالنسب المئوية (يجب أن يكون المجموع 100%)
2. ملخص نصي مفصل باللغة العربية
3. العائد المتوقع السنوي
4. تقييم مستوى المخاطر

يرجى تقديم الرد بصيغة JSON مع الهيكل التالي:
{
  "allocation": {
    "العقارات": 35,
    "الأسهم": 25,
    "الذهب": 20,
    "السندات": 15,
    "حسابات الادخار": 5
  },
  "summary": "ملخص مفصل باللغة العربية...",
  "expectedReturn": "8.5",
  "riskLevel": "متوسط"
}

تأكد من أن:
- النسب المئوية في allocation تصل لمجموع 100%
- الملخص مفصل ومفيد باللغة العربية
- العائد المتوقع رقم عشري كنص
- مستوى المخاطر باللغة العربية (منخفض/متوسط/عالي)
`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "أنت خبير مالي متخصص في تقديم نصائح الاستثمار المخصصة. قدم توصيات مدروسة ومتوازنة تناسب الملف الاستثماري للمستخدم."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and normalize the allocation to ensure it sums to 100%
    if (result.allocation) {
      const total = Object.values(result.allocation).reduce((sum: number, val: any) => sum + Number(val), 0);
      Object.keys(result.allocation).forEach(key => {
        result.allocation[key] = Math.round((Number(result.allocation[key]) / total) * 100);
      });
    }
    
    return result;
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback to mock recommendations if API fails
    return generateMockRecommendations(userData);
  }
}

function generateMockRecommendations(userData: any) {
  const { riskTolerance } = userData;
  
  let allocation: Record<string, number> = {};
  
  switch (riskTolerance) {
    case 'low':
      allocation = {
        'حسابات الادخار': 40,
        'السندات': 30,
        'الذهب': 20,
        'العقارات': 10
      };
      break;
    case 'medium':
      allocation = {
        'العقارات': 35,
        'الأسهم': 25,
        'الذهب': 20,
        'السندات': 15,
        'حسابات الادخار': 5
      };
      break;
    case 'high':
      allocation = {
        'الأسهم': 45,
        'العقارات': 25,
        'العملات الرقمية': 15,
        'الذهب': 10,
        'السندات': 5
      };
      break;
    default:
      allocation = {
        'العقارات': 30,
        'الأسهم': 30,
        'الذهب': 25,
        'السندات': 15
      };
  }

  return {
    allocation,
    summary: `بناءً على ملفك الاستثماري، نوصي بالتوزيع المعروض أعلاه. هذا التوزيع يتناسب مع مستوى تحملك للمخاطر ويحقق التوازن بين العائد والأمان. نوصي بمراجعة هذا التوزيع كل 6 أشهر وإعادة التوازن عند الحاجة.`,
    expectedReturn: riskTolerance === 'low' ? '5.5' : riskTolerance === 'medium' ? '7.8' : '10.2',
    riskLevel: riskTolerance === 'low' ? 'منخفض' : riskTolerance === 'medium' ? 'متوسط' : 'عالي'
  };
}
