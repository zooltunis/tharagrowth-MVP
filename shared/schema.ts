import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const investmentAnalyses = pgTable("investment_analyses", {
  id: serial("id").primaryKey(),
  age: text("age").notNull(),
  income: text("income").notNull(),
  investmentAmount: text("investment_amount").notNull(),
  goals: jsonb("goals").$type<string[]>().notNull(),
  riskTolerance: text("risk_tolerance").notNull(),
  preferences: jsonb("preferences").$type<string[]>().notNull(),
  recommendations: jsonb("recommendations").$type<{
    allocation: Record<string, number>;
    summary: string;
    expectedReturn: string;
    riskLevel: string;
    detailedRecommendations: DetailedRecommendation[];
  }>().notNull(),
});

export type DetailedRecommendation = {
  id: string;
  type: string;
  category: 'real-estate' | 'stocks' | 'gold' | 'bonds' | 'crypto' | 'savings';
  title: string;
  description: string;
  price: string;
  expectedReturn: string;
  paymentPlan?: string;
  riskLevel: 'منخفض' | 'متوسط' | 'عالي';
  timeline: string;
  recommendation: 'شراء قوي' | 'شراء' | 'شراء متوسط' | 'انتظار' | 'تجنب';
  location?: string;
  currentPrice?: string;
  targetPrice?: string;
  minimumInvestment: string;
  features?: string[];
};

export const insertInvestmentAnalysisSchema = createInsertSchema(investmentAnalyses).omit({
  id: true,
});

export const userDataSchema = z.object({
  age: z.string().min(1, "يرجى اختيار العمر"),
  income: z.string().min(1, "يرجى اختيار الدخل الشهري"),
  investmentBudget: z.number().min(100, "الحد الأدنى للاستثمار 100").max(10000000, "الحد الأقصى 10 مليون"),
  currency: z.enum(["AED", "SAR", "USD", "EUR", "GBP"], {
    required_error: "يرجى اختيار العملة"
  }),

  goals: z.array(z.string()).min(1, "يرجى اختيار هدف واحد على الأقل"),
  riskTolerance: z.string().min(1, "يرجى اختيار مستوى تحمل المخاطر"),
  preferences: z.array(z.string()).min(1, "يرجى اختيار نوع واحد من الاستثمار على الأقل"),
});

export type InsertInvestmentAnalysis = z.infer<typeof insertInvestmentAnalysisSchema>;
export type InvestmentAnalysis = typeof investmentAnalyses.$inferSelect;
export type UserData = z.infer<typeof userDataSchema>;
