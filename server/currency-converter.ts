/**
 * Currency Conversion Utility for AED-focused Investment Platform
 * Converts all foreign currencies to AED (United Arab Emirates Dirham)
 */

interface ExchangeRates {
  [key: string]: number;
}

export class CurrencyConverter {
  private static instance: CurrencyConverter;
  private rates: ExchangeRates;
  private lastUpdated: Date;
  private readonly cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor() {
    // Base conversion rates to AED (as of recent market data)
    // In production, these would be fetched from a live API
    this.rates = {
      'USD': 3.67,    // 1 USD = 3.67 AED
      'EUR': 4.00,    // 1 EUR = 4.00 AED  
      'GBP': 4.63,    // 1 GBP = 4.63 AED
      'SAR': 0.98,    // 1 SAR = 0.98 AED
      'AED': 1.00,    // 1 AED = 1 AED (base currency)
    };
    this.lastUpdated = new Date();
  }

  public static getInstance(): CurrencyConverter {
    if (!CurrencyConverter.instance) {
      CurrencyConverter.instance = new CurrencyConverter();
    }
    return CurrencyConverter.instance;
  }

  /**
   * Convert any currency amount to AED
   */
  public convertToAED(amount: number, fromCurrency: string): number {
    if (!amount || amount <= 0) return 0;
    
    const currency = fromCurrency.toUpperCase();
    
    // If already AED, return as is
    if (currency === 'AED') {
      return Math.round(amount * 100) / 100; // Round to 2 decimal places
    }

    // Get conversion rate
    const rate = this.rates[currency];
    if (!rate) {
      console.warn(`No conversion rate found for ${currency}, defaulting to 1:1 with AED`);
      return Math.round(amount * 100) / 100;
    }

    const convertedAmount = amount * rate;
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert market data prices to AED
   */
  public convertMarketDataToAED(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.convertMarketDataToAED(item));
    }

    const converted = { ...data };

    // Convert price fields to AED
    if (converted.price && converted.currency && converted.currency !== 'AED') {
      converted.price = this.convertToAED(converted.price, converted.currency);
      converted.originalCurrency = converted.currency;
      converted.currency = 'AED';
    }

    // Convert minimum investment to AED
    if (converted.minInvestment && converted.currency && converted.currency !== 'AED') {
      converted.minInvestment = this.convertToAED(converted.minInvestment, converted.currency);
    }

    // Convert other price-related fields
    if (converted.pricePerGram && converted.currency && converted.currency !== 'AED') {
      converted.pricePerGram = this.convertToAED(converted.pricePerGram, converted.currency);
    }

    return converted;
  }

  /**
   * Get supported currencies (all convert to AED)
   */
  public getSupportedCurrencies(): string[] {
    return Object.keys(this.rates);
  }

  /**
   * Get conversion rate for a specific currency to AED
   */
  public getConversionRate(fromCurrency: string): number {
    const currency = fromCurrency.toUpperCase();
    return this.rates[currency] || 1.0;
  }

  /**
   * Format amount in AED with proper formatting
   */
  public formatAED(amount: number): string {
    return `${amount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`;
  }

  /**
   * Update exchange rates (for future API integration)
   */
  public updateRates(newRates: ExchangeRates): void {
    this.rates = { ...this.rates, ...newRates };
    this.lastUpdated = new Date();
  }

  /**
   * Check if rates need refresh
   */
  public needsRefresh(): boolean {
    return Date.now() - this.lastUpdated.getTime() > this.cacheExpiry;
  }
}

export default CurrencyConverter;