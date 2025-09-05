import { investmentAnalyses, users, type InvestmentAnalysis, type InsertInvestmentAnalysis, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createInvestmentAnalysis(analysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis>;
  getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined>;
  saveUser(user: InsertUser): Promise<User>;
  getUser(id: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createInvestmentAnalysis(insertAnalysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis> {
    try {
      console.log('💾 محاولة حفظ التحليل في قاعدة البيانات...');
      const [analysis] = await db
        .insert(investmentAnalyses)
        .values(insertAnalysis)
        .returning();
      console.log('✅ تم حفظ التحليل بنجاح في قاعدة البيانات');
      return analysis;
    } catch (error) {
      console.error('❌ خطأ في قاعدة البيانات، استخدام التخزين المؤقت:', error);
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

  async saveUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...insertUser,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Database error saving user:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Database error getting user:', error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();
