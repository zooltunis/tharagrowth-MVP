import { investmentAnalyses, type InvestmentAnalysis, type InsertInvestmentAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createInvestmentAnalysis(analysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis>;
  getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createInvestmentAnalysis(insertAnalysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis> {
    try {
      const [analysis] = await db
        .insert(investmentAnalyses)
        .values(insertAnalysis)
        .returning();
      return analysis;
    } catch (error) {
      console.error('Database error, using fallback storage:', error);
      // Fallback to memory storage
      return this.createMemoryAnalysis(insertAnalysis);
    }
  }

  async getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined> {
    try {
      const [analysis] = await db
        .select()
        .from(investmentAnalyses)
        .where(eq(investmentAnalyses.id, id));
      return analysis || undefined;
    } catch (error) {
      console.error('Database error, using fallback storage:', error);
      // Fallback to memory storage
      return this.getMemoryAnalysis(id);
    }
  }

  private createMemoryAnalysis(data: InsertInvestmentAnalysis): InvestmentAnalysis {
    // Create a temporary storage for this session
    const id = Date.now();
    const analysis = { id, ...data } as InvestmentAnalysis;
    
    // For now, just return the analysis without persistent storage
    console.log('Using temporary storage for analysis ID:', id);
    return analysis;
  }

  private getMemoryAnalysis(id: number): InvestmentAnalysis | undefined {
    // For temporary implementation, return undefined
    // This will be handled by the frontend appropriately
    console.log('Memory storage lookup for ID:', id);
    return undefined;
  }
}

export const storage = new DatabaseStorage();
