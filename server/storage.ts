import { investmentAnalyses, type InvestmentAnalysis, type InsertInvestmentAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createInvestmentAnalysis(analysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis>;
  getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createInvestmentAnalysis(insertAnalysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis> {
    const [analysis] = await db
      .insert(investmentAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(investmentAnalyses)
      .where(eq(investmentAnalyses.id, id));
    return analysis || undefined;
  }
}

export const storage = new DatabaseStorage();
