"""
Investment Database for TharaGrowth
Contains detailed investment opportunities across multiple asset classes
"""

from typing import Dict, List, Optional
import json
from datetime import datetime

class InvestmentDatabase:
    """Database of investment opportunities with multilingual support"""
    
    def __init__(self):
        self.investment_data = {
            'real_estate': [
                {
                    'id': 'dubai_marina_001',
                    'name': {
                        'en': 'Dubai Marina Luxury Residences',
                        'ar': 'مساكن دبي مارينا الفاخرة',
                        'fr': 'Résidences de Luxe Dubai Marina'
                    },
                    'type': 'residential',
                    'location': 'Dubai Marina, UAE',
                    'price_range': {
                        'min_usd': 300000,
                        'max_usd': 1200000,
                        'currency_native': 'AED',
                        'min_native': 1100000,
                        'max_native': 4400000
                    },
                    'expected_return': 7.2,
                    'risk_level': 'medium',
                    'investment_period': '3-5 years',
                    'minimum_investment_usd': 50000,
                    'features': {
                        'en': ['Marina View', 'Swimming Pool', 'Gym', '24/7 Security', 'Prime Location'],
                        'ar': ['إطلالة على المارينا', 'مسبح', 'نادي رياضي', 'أمن 24/7', 'موقع متميز'],
                        'fr': ['Vue sur la Marina', 'Piscine', 'Salle de Sport', 'Sécurité 24/7', 'Emplacement Premium']
                    },
                    'payment_plan': {
                        'en': '20% down payment, 80% over 4 years',
                        'ar': '20% دفعة مقدمة، 80% على 4 سنوات',
                        'fr': '20% d\'acompte, 80% sur 4 ans'
                    },
                    'developer': 'Emaar Properties',
                    'completion_status': 'under_construction',
                    'rental_yield': 6.5
                },
                {
                    'id': 'riyadh_north_002',
                    'name': {
                        'en': 'North Riyadh Compound',
                        'ar': 'مجمع شمال الرياض',
                        'fr': 'Complexe Nord Riyadh'
                    },
                    'type': 'compound',
                    'location': 'North Riyadh, Saudi Arabia',
                    'price_range': {
                        'min_usd': 180000,
                        'max_usd': 500000,
                        'currency_native': 'SAR',
                        'min_native': 675000,
                        'max_native': 1875000
                    },
                    'expected_return': 6.8,
                    'risk_level': 'low',
                    'investment_period': '2-4 years',
                    'minimum_investment_usd': 30000,
                    'features': {
                        'en': ['Family Compound', 'Schools Nearby', 'Shopping Center', 'Green Spaces'],
                        'ar': ['مجمع عائلي', 'مدارس قريبة', 'مركز تسوق', 'مساحات خضراء'],
                        'fr': ['Complexe Familial', 'Écoles à Proximité', 'Centre Commercial', 'Espaces Verts']
                    },
                    'payment_plan': {
                        'en': '15% down payment, 85% over 5 years',
                        'ar': '15% دفعة مقدمة، 85% على 5 سنوات',
                        'fr': '15% d\'acompte, 85% sur 5 ans'
                    },
                    'developer': 'Al Akaria',
                    'completion_status': 'ready',
                    'rental_yield': 7.2
                }
            ],
            'stocks': [
                {
                    'id': 'aramco_001',
                    'symbol': '2222.SR',
                    'name': {
                        'en': 'Saudi Aramco',
                        'ar': 'أرامكو السعودية',
                        'fr': 'Saudi Aramco'
                    },
                    'market': 'Tadawul',
                    'sector': 'energy',
                    'current_price_usd': 7.58,
                    'current_price_native': 28.45,
                    'currency': 'SAR',
                    'expected_return': 8.5,
                    'risk_level': 'medium',
                    'dividend_yield': 4.2,
                    'market_cap_billion': 2100,
                    'minimum_investment_usd': 150,
                    'description': {
                        'en': 'World\'s largest oil company with strong dividend yield',
                        'ar': 'أكبر شركة نفط في العالم مع عائد أرباح قوي',
                        'fr': 'Plus grande compagnie pétrolière mondiale avec fort rendement de dividende'
                    },
                    'analyst_rating': 'buy'
                },
                {
                    'id': 'emaar_001',
                    'symbol': 'EMAAR.DU',
                    'name': {
                        'en': 'Emaar Properties',
                        'ar': 'إعمار العقارية',
                        'fr': 'Emaar Properties'
                    },
                    'market': 'DFM',
                    'sector': 'real_estate',
                    'current_price_usd': 2.14,
                    'current_price_native': 7.85,
                    'currency': 'AED',
                    'expected_return': 9.2,
                    'risk_level': 'medium',
                    'dividend_yield': 3.8,
                    'market_cap_billion': 47,
                    'minimum_investment_usd': 100,
                    'description': {
                        'en': 'Leading real estate developer in MENA region',
                        'ar': 'مطور عقاري رائد في منطقة الشرق الأوسط وشمال أفريقيا',
                        'fr': 'Développeur immobilier leader dans la région MENA'
                    },
                    'analyst_rating': 'strong_buy'
                }
            ],
            'gold': [
                {
                    'id': 'gold_etf_001',
                    'name': {
                        'en': 'Gold Exchange Traded Fund',
                        'ar': 'صندوق الذهب المتداول',
                        'fr': 'Fonds Négocié en Bourse Or'
                    },
                    'type': 'ETF',
                    'symbol': 'GOLD.SR',
                    'current_price_per_gram_usd': 65.50,
                    'minimum_investment_usd': 500,
                    'expected_return': 6.2,
                    'risk_level': 'low',
                    'storage_method': 'digital',
                    'liquidity': 'high',
                    'description': {
                        'en': 'Track gold prices without physical storage requirements',
                        'ar': 'تتبع أسعار الذهب بدون متطلبات التخزين المادي',
                        'fr': 'Suivre les prix de l\'or sans exigences de stockage physique'
                    },
                    'features': {
                        'en': ['Easy Trading', 'No Storage Costs', 'High Liquidity', 'Low Fees'],
                        'ar': ['تداول سهل', 'لا توجد تكاليف تخزين', 'سيولة عالية', 'رسوم منخفضة'],
                        'fr': ['Trading Facile', 'Pas de Coûts de Stockage', 'Haute Liquidité', 'Frais Bas']
                    }
                },
                {
                    'id': 'physical_gold_001',
                    'name': {
                        'en': 'Physical Gold Bars',
                        'ar': 'سبائك الذهب المادية',
                        'fr': 'Lingots d\'Or Physique'
                    },
                    'type': 'physical',
                    'purity': '24K',
                    'current_price_per_gram_usd': 67.20,
                    'minimum_investment_usd': 1000,
                    'expected_return': 5.8,
                    'risk_level': 'low',
                    'storage_method': 'vault',
                    'liquidity': 'medium',
                    'description': {
                        'en': 'Physical gold ownership with secure vault storage',
                        'ar': 'ملكية الذهب الفعلي مع تخزين آمن في الخزائن',
                        'fr': 'Propriété d\'or physique avec stockage sécurisé en coffre'
                    },
                    'features': {
                        'en': ['Physical Ownership', 'Vault Storage', 'Insurance Included', 'Certificate'],
                        'ar': ['ملكية فعلية', 'تخزين في الخزائن', 'تأمين مشمول', 'شهادة'],
                        'fr': ['Propriété Physique', 'Stockage en Coffre', 'Assurance Incluse', 'Certificat']
                    }
                }
            ],
            'bonds': [
                {
                    'id': 'uae_bond_001',
                    'name': {
                        'en': 'UAE Government Bond 2029',
                        'ar': 'سندات الحكومة الإماراتية 2029',
                        'fr': 'Obligation Gouvernement EAU 2029'
                    },
                    'type': 'government',
                    'maturity': '5 years',
                    'coupon_rate': 4.2,
                    'minimum_investment_usd': 1000,
                    'expected_return': 4.2,
                    'risk_level': 'very_low',
                    'credit_rating': 'AA',
                    'currency': 'USD',
                    'payment_frequency': 'semi_annual',
                    'description': {
                        'en': 'High-grade government bond with stable returns',
                        'ar': 'سندات حكومية عالية الجودة مع عوائد مستقرة',
                        'fr': 'Obligation gouvernementale de haute qualité avec rendements stables'
                    }
                }
            ],
            'sukuk': [
                {
                    'id': 'islamic_sukuk_001',
                    'name': {
                        'en': 'Islamic Development Bank Sukuk',
                        'ar': 'صكوك البنك الإسلامي للتنمية',
                        'fr': 'Sukuk Banque Islamique de Développement'
                    },
                    'type': 'multilateral',
                    'maturity': '3 years',
                    'profit_rate': 4.8,
                    'minimum_investment_usd': 1000,
                    'expected_return': 4.8,
                    'risk_level': 'low',
                    'sharia_compliant': True,
                    'currency': 'USD',
                    'payment_frequency': 'quarterly',
                    'description': {
                        'en': 'Sharia-compliant investment instrument with predictable returns',
                        'ar': 'أداة استثمارية متوافقة مع الشريعة مع عوائد متوقعة',
                        'fr': 'Instrument d\'investissement conforme à la Charia avec rendements prévisibles'
                    }
                }
            ],
            'crowdfunding': [
                {
                    'id': 'tech_startup_001',
                    'name': {
                        'en': 'MENA Tech Startup Fund',
                        'ar': 'صندوق الشركات الناشئة التقنية في الشرق الأوسط',
                        'fr': 'Fonds Startups Tech MENA'
                    },
                    'type': 'equity_crowdfunding',
                    'sector': 'technology',
                    'minimum_investment_usd': 5000,
                    'expected_return': 15.0,
                    'risk_level': 'high',
                    'investment_period': '3-7 years',
                    'target_companies': 25,
                    'description': {
                        'en': 'Diversified portfolio of high-growth MENA tech startups',
                        'ar': 'محفظة متنوعة من الشركات الناشئة التقنية عالية النمو في الشرق الأوسط',
                        'fr': 'Portefeuille diversifié de startups tech MENA à forte croissance'
                    },
                    'features': {
                        'en': ['Professional Management', 'Diversified Portfolio', 'Regular Updates', 'Exit Strategy'],
                        'ar': ['إدارة مهنية', 'محفظة متنوعة', 'تحديثات منتظمة', 'استراتيجية الخروج'],
                        'fr': ['Gestion Professionnelle', 'Portefeuille Diversifié', 'Mises à Jour Régulières', 'Stratégie de Sortie']
                    }
                }
            ]
        }
    
    def get_recommendations_for_profile(self, profile: Dict, budget_usd: float, currency: str, language: str = 'en') -> List[Dict]:
        """Get specific investment recommendations based on user profile"""
        recommendations = []
        
        # Get allocation from profile or use defaults
        preferred_types = profile.get('preferred_investments', [])
        risk_tolerance = profile.get('risk_tolerance', 'medium')
        
        # Filter investments by budget and preferences
        for investment_type in preferred_types:
            if investment_type in self.investment_data:
                type_investments = self.investment_data[investment_type]
                
                for investment in type_investments:
                    min_investment = investment.get('minimum_investment_usd', 1000)
                    inv_risk = investment.get('risk_level', 'medium')
                    
                    # Check budget compatibility
                    if budget_usd >= min_investment:
                        # Check risk compatibility
                        if self._is_risk_compatible(risk_tolerance, inv_risk):
                            formatted_investment = self._format_investment(
                                investment, language, currency
                            )
                            recommendations.append(formatted_investment)
        
        # Sort by expected return and risk compatibility
        recommendations.sort(key=lambda x: (
            x.get('risk_compatibility_score', 0),
            x.get('expected_return', 0)
        ), reverse=True)
        
        # Return top recommendations (limit to 6-8 items)
        return recommendations[:8]
    
    def get_featured_real_estate(self, language: str = 'en') -> List[Dict]:
        """Get featured real estate projects for homepage"""
        featured = self.investment_data['real_estate'][:3]  # Top 3 projects
        return [self._format_investment(inv, language, 'USD') for inv in featured]
    
    def _is_risk_compatible(self, user_risk: str, investment_risk: str) -> bool:
        """Check if investment risk matches user risk tolerance"""
        risk_levels = {
            'very_low': 1,
            'low': 2,
            'medium': 3,
            'high': 4,
            'very_high': 5
        }
        
        user_level = risk_levels.get(user_risk, 3)
        inv_level = risk_levels.get(investment_risk, 3)
        
        # Allow investments within 1 level of user's risk tolerance
        return abs(user_level - inv_level) <= 1
    
    def _format_investment(self, investment: Dict, language: str, display_currency: str) -> Dict:
        """Format investment data for display in specified language and currency"""
        formatted = investment.copy()
        
        # Replace multilingual fields with language-specific content
        multilingual_fields = ['name', 'description', 'features', 'payment_plan']
        
        for field in multilingual_fields:
            if field in investment and isinstance(investment[field], dict):
                formatted[field] = investment[field].get(language, investment[field].get('en', ''))
        
        # Add risk compatibility score
        formatted['risk_compatibility_score'] = self._calculate_risk_score(investment)
        
        # Add currency conversion info if needed
        if display_currency != 'USD' and 'minimum_investment_usd' in investment:
            # Simple conversion (in production, use real exchange rates)
            conversion_rates = {'AED': 3.67, 'SAR': 3.75, 'EUR': 0.85, 'GBP': 0.73}
            rate = conversion_rates.get(display_currency, 1.0)
            
            formatted['minimum_investment_local'] = round(
                investment['minimum_investment_usd'] * rate, 2
            )
            formatted['display_currency'] = display_currency
        
        return formatted
    
    def _calculate_risk_score(self, investment: Dict) -> float:
        """Calculate risk compatibility score for sorting"""
        base_score = investment.get('expected_return', 5.0)
        
        # Bonus for lower risk
        risk_bonus = {
            'very_low': 1.0,
            'low': 0.8,
            'medium': 0.6,
            'high': 0.4,
            'very_high': 0.2
        }
        
        risk_level = investment.get('risk_level', 'medium')
        bonus = risk_bonus.get(risk_level, 0.6)
        
        return base_score + bonus
    
    def get_investment_by_id(self, investment_id: str, language: str = 'en') -> Optional[Dict]:
        """Get specific investment by ID"""
        for category, investments in self.investment_data.items():
            for investment in investments:
                if investment.get('id') == investment_id:
                    return self._format_investment(investment, language, 'USD')
        
        return None
    
    def get_investments_by_category(self, category: str, language: str = 'en') -> List[Dict]:
        """Get all investments in a specific category"""
        if category in self.investment_data:
            return [
                self._format_investment(inv, language, 'USD') 
                for inv in self.investment_data[category]
            ]
        return []