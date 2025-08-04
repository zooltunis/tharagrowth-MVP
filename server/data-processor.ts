import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  sector: string;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  currency: string;
  exchange: string;
}

interface RealEstateData {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  minInvestment: number;
  expectedReturn: number;
  paymentPlan: string;
  developer: string;
  currency: string;
}

interface GoldData {
  type: string;
  purity: string;
  pricePerGram: number;
  minPurchase: number;
  currency: string;
  supplier: string;
}

interface BondData {
  id: string;
  name: string;
  type: string;
  faceValue: number;
  couponRate: number;
  maturity: string;
  rating: string;
  minInvestment: number;
  currency: string;
}

interface CrowdfundingData {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  minInvestment: number;
  expectedReturn: number;
  duration: string;
  riskLevel: string;
  currency: string;
}

export class DataProcessor {
  private dataPath = path.join(process.cwd(), 'data');

  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  async processExcelFile(filePath: string, dataType: string): Promise<void> {
    try {
      console.log(`Processing Excel file: ${filePath} for data type: ${dataType}`);
      
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Found ${jsonData.length} rows in Excel file`);

      switch (dataType.toLowerCase()) {
        case 'stocks':
          await this.processStocksData(jsonData);
          break;
        case 'real-estate':
        case 'realestate':
          await this.processRealEstateData(jsonData);
          break;
        case 'gold':
          await this.processGoldData(jsonData);
          break;
        case 'bonds':
          await this.processBondsData(jsonData);
          break;
        case 'crowdfunding':
          await this.processCrowdfundingData(jsonData);
          break;
        default:
          console.log('Unknown data type, attempting to auto-detect...');
          await this.autoDetectAndProcess(jsonData);
      }

      console.log(`Successfully processed ${dataType} data`);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  }

  private async processStocksData(data: any[]): Promise<void> {
    const stocks: StockData[] = data.map(row => ({
      symbol: row.Symbol || row.symbol || row.الرمز || '',
      name: row.Name || row.name || row.الاسم || '',
      price: parseFloat(row.Price || row.price || row.السعر || '0'),
      sector: row.Sector || row.sector || row.القطاع || '',
      marketCap: parseFloat(row.MarketCap || row.marketCap || row.القيمة_السوقية || '0'),
      peRatio: parseFloat(row.PERatio || row.peRatio || row.نسبة_السعر_للربح || '0'),
      dividendYield: parseFloat(row.DividendYield || row.dividendYield || row.عائد_الأرباح || '0'),
      currency: row.Currency || row.currency || row.العملة || 'SAR',
      exchange: row.Exchange || row.exchange || row.البورصة || 'TADAWUL'
    })).filter(stock => stock.symbol && stock.price > 0);

    await this.saveToFile('stocks-data.json', stocks);
    console.log(`Processed ${stocks.length} stock records`);
  }

  private async processRealEstateData(data: any[]): Promise<void> {
    const realEstate: RealEstateData[] = data.map(row => ({
      id: row.ID || row.id || row.المعرف || Math.random().toString(36).substr(2, 9),
      name: row.Name || row.name || row.الاسم || '',
      location: row.Location || row.location || row.الموقع || '',
      type: row.Type || row.type || row.النوع || '',
      price: parseFloat(row.Price || row.price || row.السعر || '0'),
      minInvestment: parseFloat(row.MinInvestment || row.minInvestment || row.الحد_الأدنى || '0'),
      expectedReturn: parseFloat(row.ExpectedReturn || row.expectedReturn || row.العائد_المتوقع || '0'),
      paymentPlan: row.PaymentPlan || row.paymentPlan || row.خطة_الدفع || '',
      developer: row.Developer || row.developer || row.المطور || '',
      currency: row.Currency || row.currency || row.العملة || 'SAR'
    })).filter(item => item.name && item.price > 0);

    await this.saveToFile('real-estate-projects.json', realEstate);
    console.log(`Processed ${realEstate.length} real estate records`);
  }

  private async processGoldData(data: any[]): Promise<void> {
    const gold: GoldData[] = data.map(row => ({
      type: row.Type || row.type || row.النوع || '',
      purity: row.Purity || row.purity || row.النقاء || '',
      pricePerGram: parseFloat(row.PricePerGram || row.pricePerGram || row.سعر_الجرام || '0'),
      minPurchase: parseFloat(row.MinPurchase || row.minPurchase || row.الحد_الأدنى || '0'),
      currency: row.Currency || row.currency || row.العملة || 'SAR',
      supplier: row.Supplier || row.supplier || row.المورد || ''
    })).filter(item => item.type && item.pricePerGram > 0);

    await this.saveToFile('gold-prices.json', gold);
    console.log(`Processed ${gold.length} gold records`);
  }

  private async processBondsData(data: any[]): Promise<void> {
    const bonds: BondData[] = data.map(row => ({
      id: row.ID || row.id || row.المعرف || Math.random().toString(36).substr(2, 9),
      name: row.Name || row.name || row.الاسم || '',
      type: row.Type || row.type || row.النوع || '',
      faceValue: parseFloat(row.FaceValue || row.faceValue || row.القيمة_الاسمية || '0'),
      couponRate: parseFloat(row.CouponRate || row.couponRate || row.معدل_الكوبون || '0'),
      maturity: row.Maturity || row.maturity || row.تاريخ_الاستحقاق || '',
      rating: row.Rating || row.rating || row.التصنيف || '',
      minInvestment: parseFloat(row.MinInvestment || row.minInvestment || row.الحد_الأدنى || '0'),
      currency: row.Currency || row.currency || row.العملة || 'SAR'
    })).filter(item => item.name && item.faceValue > 0);

    await this.saveToFile('bonds-sukuk.json', bonds);
    console.log(`Processed ${bonds.length} bond records`);
  }

  private async processCrowdfundingData(data: any[]): Promise<void> {
    const crowdfunding: CrowdfundingData[] = data.map(row => ({
      id: row.ID || row.id || row.المعرف || Math.random().toString(36).substr(2, 9),
      name: row.Name || row.name || row.الاسم || '',
      category: row.Category || row.category || row.الفئة || '',
      targetAmount: parseFloat(row.TargetAmount || row.targetAmount || row.المبلغ_المستهدف || '0'),
      currentAmount: parseFloat(row.CurrentAmount || row.currentAmount || row.المبلغ_الحالي || '0'),
      minInvestment: parseFloat(row.MinInvestment || row.minInvestment || row.الحد_الأدنى || '0'),
      expectedReturn: parseFloat(row.ExpectedReturn || row.expectedReturn || row.العائد_المتوقع || '0'),
      duration: row.Duration || row.duration || row.المدة || '',
      riskLevel: row.RiskLevel || row.riskLevel || row.مستوى_المخاطر || '',
      currency: row.Currency || row.currency || row.العملة || 'SAR'
    })).filter(item => item.name && item.targetAmount > 0);

    await this.saveToFile('crowdfunding-projects.json', crowdfunding);
    console.log(`Processed ${crowdfunding.length} crowdfunding records`);
  }

  private async autoDetectAndProcess(data: any[]): Promise<void> {
    if (data.length === 0) return;

    const firstRow = data[0];
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());

    if (keys.some(k => k.includes('symbol') || k.includes('stock') || k.includes('الرمز'))) {
      await this.processStocksData(data);
    } else if (keys.some(k => k.includes('property') || k.includes('real') || k.includes('عقار'))) {
      await this.processRealEstateData(data);
    } else if (keys.some(k => k.includes('gold') || k.includes('ذهب'))) {
      await this.processGoldData(data);
    } else if (keys.some(k => k.includes('bond') || k.includes('sukuk') || k.includes('سند'))) {
      await this.processBondsData(data);
    } else if (keys.some(k => k.includes('crowd') || k.includes('تمويل'))) {
      await this.processCrowdfundingData(data);
    } else {
      console.log('Could not auto-detect data type, treating as general data');
      await this.saveToFile('general-data.json', data);
    }
  }

  private async saveToFile(filename: string, data: any[]): Promise<void> {
    const filePath = path.join(this.dataPath, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved ${data.length} records to ${filename}`);
  }

  async loadData(dataType: string): Promise<any[]> {
    const filename = `${dataType}.json`;
    const filePath = path.join(this.dataPath, filename);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    
    return [];
  }

  async getAllDataSummary(): Promise<{[key: string]: number}> {
    const summary: {[key: string]: number} = {};
    
    const dataFiles = ['stocks-data.json', 'real-estate-projects.json', 'gold-prices.json', 'bonds-sukuk.json', 'crowdfunding-projects.json'];
    
    for (const file of dataFiles) {
      const filePath = path.join(this.dataPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const dataType = file.replace('.json', '').replace('-', ' ');
        summary[dataType] = data.length;
      }
    }
    
    return summary;
  }

  // Data accessor methods for the recommendation engine
  async getStocksData(): Promise<any[]> {
    try {
      const data = fs.readFileSync('./data/stocks-data.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading stocks data:', error);
      return [];
    }
  }

  async getRealEstateData(): Promise<any[]> {
    try {
      const realEstateData = fs.readFileSync('./data/real-estate-projects.json', 'utf-8');
      const uaeData = fs.readFileSync('./data/uae-real-estate.json', 'utf-8');
      const realEstate = JSON.parse(realEstateData);
      const uae = JSON.parse(uaeData);
      return [...realEstate, ...uae];
    } catch (error) {
      console.error('Error loading real estate data:', error);
      return [];
    }
  }

  async getGoldData(): Promise<any[]> {
    try {
      const data = fs.readFileSync('./data/gold-prices.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading gold data:', error);
      return [];
    }
  }

  async getBondsData(): Promise<any[]> {
    try {
      const data = fs.readFileSync('./data/bonds-sukuk.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading bonds data:', error);
      return [];
    }
  }

  async getCrowdfundingData(): Promise<any[]> {
    try {
      const data = fs.readFileSync('./data/crowdfunding-projects.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading crowdfunding data:', error);
      return [];
    }
  }
}