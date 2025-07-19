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
  }>().notNull(),
});

export const insertInvestmentAnalysisSchema = createInsertSchema(investmentAnalyses).omit({
  id: true,
});

export const userDataSchema = z.object({
  age: z.string().min(1, "يرجى اختيار العمر"),
  income: z.string().min(1, "يرجى اختيار الدخل الشهري"),
  investmentAmount: z.string().min(1, "يرجى اختيار المبلغ المتاح للاستثمار"),
  goals: z.array(z.string()).min(1, "يرجى اختيار هدف واحد على الأقل"),
  riskTolerance: z.string().min(1, "يرجى اختيار مستوى تحمل المخاطر"),
  preferences: z.array(z.string()).min(1, "يرجى اختيار نوع واحد من الاستثمار على الأقل"),
});

export type InsertInvestmentAnalysis = z.infer<typeof insertInvestmentAnalysisSchema>;
export type InvestmentAnalysis = typeof investmentAnalyses.$inferSelect;
export type UserData = z.infer<typeof userDataSchema>;
