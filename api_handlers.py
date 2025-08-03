"""
API Handlers for TharaGrowth Investment Advisory Platform
Handles external API integrations for market data, exchange rates, and news
"""

import requests
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExchangeRateAPI:
    """Exchange rate handler using free APIs"""
    
    def __init__(self):
        self.base_url = "https://api.exchangerate-api.com/v4/latest"
        self.fallback_url = "https://api.fxapi.com/v1/latest"
        self.cache = {}
        self.cache_duration = timedelta(hours=1)
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> float:
        """Get exchange rate between two currencies"""
        if from_currency == to_currency:
            return 1.0
        
        cache_key = f"{from_currency}_{to_currency}"
        
        # Check cache first
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['rate']
        
        try:
            # Primary API
            response = requests.get(f"{self.base_url}/{from_currency}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if to_currency in data['rates']:
                    rate = data['rates'][to_currency]
                    self._cache_rate(cache_key, rate)
                    return rate
        except Exception as e:
            logger.warning(f"Primary exchange API failed: {e}")
        
        # Fallback rates (static but functional)
        fallback_rates = {
            'USD_AED': 3.67,
            'USD_SAR': 3.75,
            'USD_EUR': 0.85,
            'USD_GBP': 0.73,
            'AED_SAR': 1.02,
            'AED_USD': 0.27,
            'SAR_USD': 0.27,
            'EUR_USD': 1.18,
            'GBP_USD': 1.37
        }
        
        # Try direct lookup
        if cache_key in fallback_rates:
            rate = fallback_rates[cache_key]
            self._cache_rate(cache_key, rate)
            return rate
        
        # Try reverse lookup
        reverse_key = f"{to_currency}_{from_currency}"
        if reverse_key in fallback_rates:
            rate = 1.0 / fallback_rates[reverse_key]
            self._cache_rate(cache_key, rate)
            return rate
        
        logger.warning(f"Could not get exchange rate for {from_currency} to {to_currency}")
        return 1.0
    
    def convert_currency(self, amount: float, from_currency: str, to_currency: str) -> Dict:
        """Convert amount from one currency to another"""
        rate = self.get_exchange_rate(from_currency, to_currency)
        converted_amount = amount * rate
        
        return {
            'original_amount': amount,
            'original_currency': from_currency,
            'converted_amount': round(converted_amount, 2),
            'converted_currency': to_currency,
            'exchange_rate': rate,
            'timestamp': datetime.now().isoformat()
        }
    
    def convert_to_usd(self, amount: float, currency: str) -> float:
        """Convert any currency to USD for standardization"""
        if currency == 'USD':
            return amount
        
        rate = self.get_exchange_rate(currency, 'USD')
        return round(amount * rate, 2)
    
    def get_major_rates(self) -> Dict:
        """Get major currency exchange rates vs USD"""
        currencies = ['AED', 'SAR', 'EUR', 'GBP']
        rates = {}
        
        for currency in currencies:
            rates[currency] = self.get_exchange_rate('USD', currency)
        
        return rates
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        cached_time = self.cache[cache_key]['timestamp']
        return datetime.now() - cached_time < self.cache_duration
    
    def _cache_rate(self, cache_key: str, rate: float):
        """Cache exchange rate with timestamp"""
        self.cache[cache_key] = {
            'rate': rate,
            'timestamp': datetime.now()
        }

class MarketDataAPI:
    """Market data handler for stocks and gold prices"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = timedelta(minutes=15)
    
    def get_gold_price(self) -> Dict:
        """Get current gold price per gram"""
        cache_key = 'gold_price'
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        
        try:
            # Try multiple gold price APIs
            apis = [
                "https://api.metals.live/v1/spot/gold",
                "https://api.goldapi.io/api/XAU/USD"
            ]
            
            for api_url in apis:
                try:
                    response = requests.get(api_url, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        # Parse response based on API structure
                        price_per_oz = self._extract_gold_price(data)
                        if price_per_oz:
                            price_per_gram = round(price_per_oz / 31.1035, 2)  # Convert oz to gram
                            
                            result = {
                                'price_per_gram_usd': price_per_gram,
                                'price_per_gram_aed': round(price_per_gram * 3.67, 2),
                                'price_per_gram_sar': round(price_per_gram * 3.75, 2),
                                'timestamp': datetime.now().isoformat(),
                                'currency': 'USD_base'
                            }
                            
                            self._cache_data(cache_key, result)
                            return result
                except Exception as e:
                    logger.warning(f"Gold API {api_url} failed: {e}")
                    continue
        
        except Exception as e:
            logger.warning(f"All gold price APIs failed: {e}")
        
        # Fallback gold price data
        fallback_price = {
            'price_per_gram_usd': 65.50,
            'price_per_gram_aed': 240.35,
            'price_per_gram_sar': 245.63,
            'timestamp': datetime.now().isoformat(),
            'currency': 'USD_base',
            'note': 'Fallback pricing - live data unavailable'
        }
        
        self._cache_data(cache_key, fallback_price)
        return fallback_price
    
    def get_active_stocks(self) -> List[Dict]:
        """Get active stock data for major regional stocks"""
        cache_key = 'active_stocks'
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        
        # Mock data representing real regional stocks
        # In production, this would connect to regional stock APIs
        stocks_data = [
            {
                'symbol': 'EMAAR',
                'name': 'Emaar Properties',
                'market': 'DFM',
                'price': 7.85,
                'currency': 'AED',
                'change': '+0.15',
                'change_percent': '+1.95%',
                'volume': '2.1M'
            },
            {
                'symbol': '2222',
                'name': 'Saudi Aramco',
                'market': 'Tadawul',
                'price': 28.45,
                'currency': 'SAR',
                'change': '+0.35',
                'change_percent': '+1.25%',
                'volume': '5.2M'
            },
            {
                'symbol': '2010',
                'name': 'SABIC',
                'market': 'Tadawul',
                'price': 89.20,
                'currency': 'SAR',
                'change': '-1.80',
                'change_percent': '-1.98%',
                'volume': '1.8M'
            },
            {
                'symbol': 'ADCB',
                'name': 'Abu Dhabi Commercial Bank',
                'market': 'ADX',
                'price': 9.12,
                'currency': 'AED',
                'change': '+0.08',
                'change_percent': '+0.89%',
                'volume': '3.4M'
            }
        ]
        
        # Add timestamp
        for stock in stocks_data:
            stock['timestamp'] = datetime.now().isoformat()
        
        self._cache_data(cache_key, stocks_data)
        return stocks_data
    
    def _extract_gold_price(self, api_response: Dict) -> Optional[float]:
        """Extract gold price from various API response formats"""
        # Handle different API response structures
        if 'price' in api_response:
            return float(api_response['price'])
        elif 'spot' in api_response:
            return float(api_response['spot'])
        elif 'data' in api_response and 'price' in api_response['data']:
            return float(api_response['data']['price'])
        elif isinstance(api_response, (int, float)):
            return float(api_response)
        
        return None
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        cached_time = self.cache[cache_key]['timestamp']
        return datetime.now() - cached_time < self.cache_duration
    
    def _cache_data(self, cache_key: str, data):
        """Cache data with timestamp"""
        self.cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }

class NewsAPI:
    """News API handler for financial news in multiple languages"""
    
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        self.cache = {}
        self.cache_duration = timedelta(hours=2)
    
    def get_financial_news(self, language: str = 'en') -> List[Dict]:
        """Get latest financial news in specified language"""
        cache_key = f'financial_news_{language}'
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        
        # Mock financial news data (multi-language)
        news_data = {
            'en': [
                {
                    'title': 'Global Markets Show Strong Recovery',
                    'summary': 'Major indices gained ground as investors showed renewed confidence...',
                    'source': 'Financial Times',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'markets'
                },
                {
                    'title': 'Gold Prices Reach New Monthly High',
                    'summary': 'Precious metals continue their upward trend amid economic uncertainty...',
                    'source': 'Bloomberg',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'commodities'
                },
                {
                    'title': 'Real Estate Investment Opportunities in GCC',
                    'summary': 'Gulf Cooperation Council countries present attractive real estate prospects...',
                    'source': 'Gulf Business',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'real_estate'
                }
            ],
            'ar': [
                {
                    'title': 'الأسواق العالمية تشهد تعافياً قوياً',
                    'summary': 'حققت المؤشرات الرئيسية مكاسب كبيرة وسط تجدد ثقة المستثمرين...',
                    'source': 'الاقتصادية',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'markets'
                },
                {
                    'title': 'أسعار الذهب تصل لأعلى مستوى شهري',
                    'summary': 'تواصل المعادن النفيسة اتجاهها الصاعد وسط عدم اليقين الاقتصادي...',
                    'source': 'العربية',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'commodities'
                },
                {
                    'title': 'فرص استثمارية في العقارات بدول الخليج',
                    'summary': 'تقدم دول مجلس التعاون الخليجي فرصاً جذابة في القطاع العقاري...',
                    'source': 'الخليج التجاري',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'real_estate'
                }
            ],
            'fr': [
                {
                    'title': 'Les Marchés Mondiaux Montrent une Forte Reprise',
                    'summary': 'Les principaux indices ont gagné du terrain alors que les investisseurs retrouvent confiance...',
                    'source': 'Les Échos',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'markets'
                },
                {
                    'title': 'Les Prix de l\'Or Atteignent un Nouveau Sommet Mensuel',
                    'summary': 'Les métaux précieux continuent leur tendance haussière dans un contexte d\'incertitude...',
                    'source': 'La Tribune',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'commodities'
                },
                {
                    'title': 'Opportunités d\'Investissement Immobilier dans le CCG',
                    'summary': 'Les pays du Conseil de Coopération du Golfe présentent des perspectives immobilières attrayantes...',
                    'source': 'Gulf Business FR',
                    'timestamp': datetime.now().isoformat(),
                    'category': 'real_estate'
                }
            ]
        }
        
        result = news_data.get(language, news_data['en'])
        self._cache_data(cache_key, result)
        return result
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        cached_time = self.cache[cache_key]['timestamp']
        return datetime.now() - cached_time < self.cache_duration
    
    def _cache_data(self, cache_key: str, data):
        """Cache data with timestamp"""
        self.cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }