"""
Investment Recommendation Engine for TharaGrowth
Smart investment profiling and recommendation generation
"""

from typing import Dict, List, Tuple
import json
from datetime import datetime

class InvestmentProfiler:
    """Creates investment profiles based on user inputs"""
    
    def __init__(self):
        self.profile_templates = {
            'conservative': {
                'risk_tolerance': 'low',
                'allocation_strategy': 'safety_first',
                'expected_return': (3, 6),
                'time_horizon': 'medium_to_long',
                'liquidity_needs': 'high'
            },
            'balanced': {
                'risk_tolerance': 'medium',
                'allocation_strategy': 'balanced_growth',
                'expected_return': (5, 10),
                'time_horizon': 'medium_to_long',
                'liquidity_needs': 'medium'
            },
            'aggressive': {
                'risk_tolerance': 'high',
                'allocation_strategy': 'growth_focused',
                'expected_return': (8, 15),
                'time_horizon': 'long',
                'liquidity_needs': 'low'
            }
        }
    
    def create_profile(self, user_data: Dict) -> Dict:
        """Create investment profile based on user data"""
        # Determine primary profile type
        risk_appetite = user_data['risk_appetite']
        base_profile = self.profile_templates[self._map_risk_to_profile(risk_appetite)]
        
        # Customize based on investment goal
        goal_adjustments = self._get_goal_adjustments(user_data['goal'])
        
        # Create final profile
        profile = {
            'type': self._determine_profile_type(user_data),
            'risk_tolerance': risk_appetite,
            'investment_goal': user_data['goal'],
            'budget_usd': user_data['budget_usd'],
            'currency': user_data['currency'],
            'preferred_investments': user_data['investment_types'],
            'allocation_strategy': base_profile['allocation_strategy'],
            'expected_return_range': base_profile['expected_return'],
            'time_horizon': goal_adjustments.get('time_horizon', base_profile['time_horizon']),
            'liquidity_preference': goal_adjustments.get('liquidity', base_profile['liquidity_needs']),
            'created_at': datetime.now().isoformat()
        }
        
        return profile
    
    def _map_risk_to_profile(self, risk_appetite: str) -> str:
        """Map risk appetite to profile template"""
        mapping = {
            'low': 'conservative',
            'medium': 'balanced',
            'high': 'aggressive'
        }
        return mapping.get(risk_appetite, 'balanced')
    
    def _determine_profile_type(self, user_data: Dict) -> str:
        """Determine detailed profile type based on multiple factors"""
        risk = user_data['risk_appetite']
        goal = user_data['goal']
        budget = user_data['budget_usd']
        
        # Budget influence
        if budget < 10000:
            budget_factor = 'starter'
        elif budget < 100000:
            budget_factor = 'intermediate'
        else:
            budget_factor = 'advanced'
        
        return f"{risk}_{goal}_{budget_factor}"
    
    def _get_goal_adjustments(self, goal: str) -> Dict:
        """Get adjustments based on investment goal"""
        adjustments = {
            'retirement': {
                'time_horizon': 'long',
                'liquidity': 'low',
                'growth_emphasis': 0.7,
                'safety_emphasis': 0.3
            },
            'passive_income': {
                'time_horizon': 'medium',
                'liquidity': 'medium',
                'income_emphasis': 0.8,
                'growth_emphasis': 0.2
            },
            'capital_growth': {
                'time_horizon': 'long',
                'liquidity': 'low',
                'growth_emphasis': 0.9,
                'safety_emphasis': 0.1
            },
            'children_education': {
                'time_horizon': 'medium',
                'liquidity': 'medium',
                'growth_emphasis': 0.6,
                'safety_emphasis': 0.4
            },
            'wealth_preservation': {
                'time_horizon': 'long',
                'liquidity': 'high',
                'safety_emphasis': 0.8,
                'growth_emphasis': 0.2
            },
            'emergency_fund': {
                'time_horizon': 'short',
                'liquidity': 'high',
                'safety_emphasis': 0.9,
                'growth_emphasis': 0.1
            }
        }
        
        return adjustments.get(goal, adjustments['capital_growth'])

class RecommendationEngine:
    """Generates investment recommendations based on user profile"""
    
    def __init__(self):
        self.allocation_strategies = {
            'conservative': {
                'bonds': 50,
                'sukuk': 20,
                'real_estate': 15,
                'gold': 10,
                'stocks': 5
            },
            'balanced': {
                'stocks': 40,
                'real_estate': 25,
                'bonds': 15,
                'sukuk': 10,
                'gold': 10
            },
            'aggressive': {
                'stocks': 60,
                'real_estate': 20,
                'crowdfunding': 10,
                'gold': 7,
                'bonds': 3
            }
        }
        
        self.multilingual_content = {
            'en': {
                'conservative_rationale': "This conservative approach prioritizes capital preservation and steady income generation. Bonds and Sukuk provide stable returns with lower risk, while real estate and gold offer inflation protection.",
                'balanced_rationale': "This balanced strategy combines growth potential with risk management. Stocks drive long-term growth while real estate and bonds provide stability and regular income.",
                'aggressive_rationale': "This growth-focused strategy maximizes long-term wealth building potential. Higher stock allocation and alternative investments like crowdfunding offer substantial growth opportunities.",
                'tips': {
                    'conservative': "Focus on income-generating assets and maintain emergency liquidity",
                    'balanced': "Regularly rebalance your portfolio and diversify across asset classes",
                    'aggressive': "Monitor market trends closely and be prepared for volatility"
                }
            },
            'ar': {
                'conservative_rationale': "يركز هذا النهج المحافظ على الحفاظ على رأس المال وتوليد دخل ثابت. توفر السندات والصكوك عوائد مستقرة مع مخاطر أقل، بينما توفر العقارات والذهب حماية من التضخم.",
                'balanced_rationale': "تجمع هذه الاستراتيجية المتوازنة بين إمكانية النمو وإدارة المخاطر. تحرك الأسهم النمو طويل المدى بينما توفر العقارات والسندات الاستقرار والدخل المنتظم.",
                'aggressive_rationale': "تركز هذه الاستراتيجية على النمو لتعظيم إمكانات بناء الثروة طويل المدى. التخصيص الأعلى للأسهم والاستثمارات البديلة مثل التمويل الجماعي توفر فرص نمو كبيرة.",
                'tips': {
                    'conservative': "ركز على الأصول المدرة للدخل واحتفظ بسيولة طوارئ",
                    'balanced': "أعد توازن محفظتك بانتظام ونوع عبر فئات الأصول",
                    'aggressive': "راقب اتجاهات السوق عن كثب وكن مستعداً للتقلبات"
                }
            },
            'fr': {
                'conservative_rationale': "Cette approche conservatrice privilégie la préservation du capital et la génération de revenus stables. Les obligations et Sukuk offrent des rendements stables avec moins de risques, tandis que l'immobilier et l'or protègent contre l'inflation.",
                'balanced_rationale': "Cette stratégie équilibrée combine potentiel de croissance et gestion des risques. Les actions favorisent la croissance à long terme tandis que l'immobilier et les obligations apportent stabilité et revenus réguliers.",
                'aggressive_rationale': "Cette stratégie axée sur la croissance maximise le potentiel de création de richesse à long terme. L'allocation plus élevée en actions et les investissements alternatifs comme le financement participatif offrent d'importantes opportunités de croissance.",
                'tips': {
                    'conservative': "Concentrez-vous sur les actifs générateurs de revenus et maintenez une liquidité d'urgence",
                    'balanced': "Rééquilibrez régulièrement votre portefeuille et diversifiez entre les classes d'actifs",
                    'aggressive': "Surveillez attentivement les tendances du marché et préparez-vous à la volatilité"
                }
            }
        }
    
    def generate_recommendations(self, profile: Dict, user_data: Dict, language: str = 'en') -> Dict:
        """Generate comprehensive investment recommendations"""
        # Determine allocation strategy
        risk_level = profile['risk_tolerance']
        strategy_key = self._map_risk_to_strategy(risk_level)
        
        # Get base allocation
        base_allocation = self.allocation_strategies[strategy_key].copy()
        
        # Adjust allocation based on user preferences
        adjusted_allocation = self._adjust_for_preferences(
            base_allocation, 
            user_data['investment_types']
        )
        
        # Adjust for investment goal
        final_allocation = self._adjust_for_goal(
            adjusted_allocation,
            user_data['goal']
        )
        
        # Calculate expected returns
        expected_return = self._calculate_expected_return(final_allocation, risk_level)
        
        # Generate rationale and tips
        content = self.multilingual_content.get(language, self.multilingual_content['en'])
        rationale = content[f'{strategy_key}_rationale']
        tips = content['tips'][strategy_key]
        
        return {
            'allocation': final_allocation,
            'strategy': strategy_key,
            'expected_annual_return': expected_return,
            'rationale': rationale,
            'personalized_tips': tips,
            'risk_level': risk_level,
            'time_horizon': profile['time_horizon'],
            'review_frequency': self._get_review_frequency(strategy_key),
            'generated_at': datetime.now().isoformat()
        }
    
    def _map_risk_to_strategy(self, risk_tolerance: str) -> str:
        """Map risk tolerance to allocation strategy"""
        mapping = {
            'low': 'conservative',
            'medium': 'balanced', 
            'high': 'aggressive'
        }
        return mapping.get(risk_tolerance, 'balanced')
    
    def _adjust_for_preferences(self, allocation: Dict, preferences: List[str]) -> Dict:
        """Adjust allocation based on user investment type preferences"""
        if not preferences:
            return allocation
        
        # Create preference mapping
        preference_map = {
            'real_estate': 'real_estate',
            'gold': 'gold',
            'stocks': 'stocks',
            'crowdfunding': 'crowdfunding',
            'sukuk': 'sukuk',
            'bonds': 'bonds'
        }
        
        # Boost preferred categories
        boost_factor = 1.2
        total_boost = 0
        
        for pref in preferences:
            mapped_pref = preference_map.get(pref)
            if mapped_pref in allocation:
                original_value = allocation[mapped_pref]
                boost = original_value * (boost_factor - 1)
                allocation[mapped_pref] += boost
                total_boost += boost
        
        # Reduce non-preferred categories proportionally
        if total_boost > 0:
            non_preferred = [k for k in allocation.keys() 
                           if k not in [preference_map.get(p) for p in preferences]]
            
            for category in non_preferred:
                reduction = (allocation[category] / 100) * total_boost
                allocation[category] = max(0, allocation[category] - reduction)
        
        # Normalize to 100%
        total = sum(allocation.values())
        if total > 0:
            for key in allocation:
                allocation[key] = round((allocation[key] / total) * 100, 1)
        
        return allocation
    
    def _adjust_for_goal(self, allocation: Dict, goal: str) -> Dict:
        """Fine-tune allocation based on investment goal"""
        adjustments = {
            'passive_income': {
                'real_estate': 1.3,
                'sukuk': 1.2,
                'bonds': 1.2,
                'stocks': 0.8
            },
            'retirement': {
                'stocks': 1.2,
                'real_estate': 1.1,
                'bonds': 1.1,
                'crowdfunding': 0.7
            },
            'children_education': {
                'bonds': 1.3,
                'sukuk': 1.2,
                'real_estate': 1.1,
                'stocks': 0.9
            },
            'wealth_preservation': {
                'gold': 1.4,
                'bonds': 1.3,
                'sukuk': 1.2,
                'stocks': 0.7,
                'crowdfunding': 0.5
            },
            'emergency_fund': {
                'bonds': 1.5,
                'sukuk': 1.3,
                'gold': 1.2,
                'stocks': 0.3,
                'real_estate': 0.5
            }
        }
        
        goal_adjustments = adjustments.get(goal, {})
        
        # Apply adjustments
        for category, factor in goal_adjustments.items():
            if category in allocation:
                allocation[category] *= factor
        
        # Normalize to 100%
        total = sum(allocation.values())
        if total > 0:
            for key in allocation:
                allocation[key] = round((allocation[key] / total) * 100, 1)
        
        return allocation
    
    def _calculate_expected_return(self, allocation: Dict, risk_level: str) -> float:
        """Calculate expected annual return based on allocation"""
        # Historical average returns by asset class (conservative estimates)
        asset_returns = {
            'stocks': 9.0,
            'real_estate': 7.5,
            'crowdfunding': 12.0,
            'gold': 5.5,
            'bonds': 4.0,
            'sukuk': 4.5
        }
        
        # Risk adjustment factors
        risk_factors = {
            'low': 0.8,      # More conservative estimates
            'medium': 0.9,   # Moderate estimates
            'high': 1.0      # Full potential estimates
        }
        
        weighted_return = 0
        for asset, percentage in allocation.items():
            if asset in asset_returns:
                weighted_return += (asset_returns[asset] * percentage / 100)
        
        # Apply risk factor
        risk_factor = risk_factors.get(risk_level, 0.9)
        return round(weighted_return * risk_factor, 1)
    
    def _get_review_frequency(self, strategy: str) -> str:
        """Get recommended portfolio review frequency"""
        frequencies = {
            'conservative': 'Every 12 months',
            'balanced': 'Every 6 months',
            'aggressive': 'Every 3 months'
        }
        return frequencies.get(strategy, 'Every 6 months')