import { pgTable, text, serial, integer, jsonb, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

// Users table for Firebase authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Firebase UID
  email: varchar("email").unique(),
  name: varchar("name"),
  photoURL: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const investmentAnalyses = pgTable("investment_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Link to authenticated user
  age: text("age").notNull(),
  income: text("income").notNull(),
  investmentBudget: text("investment_amount").notNull(),
  currency: text("currency").notNull().default("AED"),
  goals: jsonb("goals").$type<string[]>().notNull(),
  riskTolerance: text("risk_tolerance").notNull(),
  preferences: jsonb("preferences").$type<string[]>().notNull(),
  targetMarket: text("target_market").notNull(),
  allowDiversification: text("allow_diversification").notNull(),
  islamicCompliance: text("islamic_compliance").notNull(),
  paymentFrequency: text("payment_frequency").notNull(),
  language: text("language").default("ar"),
  recommendations: jsonb("recommendations").$type<{
    id: string;
    userData: {
      age: string;
      income: string;
      investmentBudget: string;
      currency: "AED";
      goals: string[];
      riskTolerance: string;
      preferences: string[];
      targetMarket: string;
      allowDiversification: boolean;
      islamicCompliance: boolean;
      paymentFrequency: string;
      language: string;
    };
    strategy: string;
    riskProfile: string;
    recommendations: DetailedRecommendation[];
    totalAllocated: number;
    remainingAmount: number;
    analysis: string;
    generatedAt: string;
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
  // Real estate payment fields
  downPayment?: number;
  monthlyInstallment?: number;
  yearlyInstallment?: number;
  financingPeriod?: number;
  paymentMethod?: string;
  developer?: string;
};

export const insertInvestmentAnalysisSchema = createInsertSchema(investmentAnalyses).omit({
  id: true,
});

export const userDataSchema = z.object({
  age: z.string().min(1, "يرجى اختيار العمر"),
  language: z.string().default("ar"),
  income: z.string().min(1, "يرجى اختيار الدخل الشهري"),
  investmentBudget: z.string().min(1, "يرجى إدخال مبلغ الاستثمار"),
  currency: z.literal("AED").default("AED"),

  goals: z.array(z.string()).min(1, "يرجى اختيار هدف واحد على الأقل"),
  riskTolerance: z.string().min(1, "يرجى اختيار مستوى تحمل المخاطر"),
  preferences: z.array(z.string()).min(1, "يرجى اختيار نوع واحد من الاستثمار على الأقل"),

  // New Gulf market-specific fields
  targetMarket: z.enum(["UAE", "Saudi Arabia", "Gulf Countries", "International"], {
    required_error: "يرجى اختيار السوق المستهدف"
  }),
  allowDiversification: z.boolean().default(false),
  islamicCompliance: z.boolean().default(false),
  paymentFrequency: z.enum(["One-time payment", "Monthly", "Yearly"], {
    required_error: "يرجى اختيار تكرار الدفع"
  }),
  
  // Firebase UID (optional - null for anonymous users)
  userId: z.string().nullable().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InsertInvestmentAnalysis = z.infer<typeof insertInvestmentAnalysisSchema>;
export type InvestmentAnalysis = typeof investmentAnalyses.$inferSelect;
export type UserData = z.infer<typeof userDataSchema>;
