import { investmentAnalyses, type InvestmentAnalysis, type InsertInvestmentAnalysis } from "@shared/schema";

export interface IStorage {
  createInvestmentAnalysis(analysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis>;
  getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, InvestmentAnalysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createInvestmentAnalysis(insertAnalysis: InsertInvestmentAnalysis): Promise<InvestmentAnalysis> {
    const id = this.currentId++;
    const analysis: InvestmentAnalysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getInvestmentAnalysis(id: number): Promise<InvestmentAnalysis | undefined> {
    return this.analyses.get(id);
  }
}

export const storage = new MemStorage();
