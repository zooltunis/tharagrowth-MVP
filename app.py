#!/usr/bin/env python3
"""
TharaGrowth - AI Investment Advisory Application
Trilingual (EN/AR/FR) Flask-based investment recommendation platform
"""

from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from flask_wtf import FlaskForm
from wtforms import SelectField, IntegerField, SelectMultipleField, RadioField, SubmitField
from wtforms.validators import DataRequired, NumberRange
import os
from dotenv import load_dotenv
import requests
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here-change-in-production')
app.config['LANGUAGES'] = {
    'en': 'English',
    'ar': 'العربية',
    'fr': 'Français'
}

# Add template functions
@app.template_global()
def get_locale():
    # 1. URL parameter
    if request.args.get('lang'):
        session['language'] = request.args.get('lang')
    # 2. Session
    if 'language' in session and session['language'] in app.config['LANGUAGES']:
        return session['language']
    # 3. Browser language
    return request.accept_languages.best_match(app.config['LANGUAGES'].keys()) or 'en'

# Import modules after app initialization
try:
    from api_handlers import ExchangeRateAPI, MarketDataAPI, NewsAPI
    from recommendation_engine import InvestmentProfiler, RecommendationEngine
    from data.investment_data import InvestmentDatabase
    
    # Initialize services
    exchange_api = ExchangeRateAPI()
    market_api = MarketDataAPI()
    news_api = NewsAPI()
    profiler = InvestmentProfiler()
    recommendation_engine = RecommendationEngine()
    investment_db = InvestmentDatabase()
    
except ImportError as e:
    print(f"Module import error: {e}")
    # Initialize with None for now
    exchange_api = None
    market_api = None
    news_api = None
    profiler = None
    recommendation_engine = None
    investment_db = None

class InvestmentForm(FlaskForm):
    """Main investment advisory form with multi-language support"""
    
    investment_budget = IntegerField(
        'Investment Budget',
        validators=[DataRequired(), NumberRange(min=100, max=10000000)],
        default=50000
    )
    
    currency = SelectField(
        'Currency',
        choices=[
            ('AED', 'AED - UAE Dirham'),
            ('SAR', 'SAR - Saudi Riyal'),
            ('USD', 'USD - US Dollar'),
            ('EUR', 'EUR - Euro'),
            ('GBP', 'GBP - British Pound')
        ],
        default='AED'
    )
    
    investment_goal = SelectField(
        'Investment Goal',
        choices=[
            ('retirement', 'Retirement Planning'),
            ('passive_income', 'Passive Income'),
            ('capital_growth', 'Capital Growth'),
            ('children_education', 'Children Education'),
            ('wealth_preservation', 'Wealth Preservation'),
            ('emergency_fund', 'Emergency Fund')
        ],
        validators=[DataRequired()]
    )
    
    risk_appetite = RadioField(
        'Risk Appetite',
        choices=[
            ('low', 'Low Risk - Safety First'),
            ('medium', 'Medium Risk - Balanced'),
            ('high', 'High Risk - Growth Focused')
        ],
        validators=[DataRequired()],
        default='medium'
    )
    
    investment_types = SelectMultipleField(
        'Preferred Investment Types',
        choices=[
            ('real_estate', 'Real Estate'),
            ('gold', 'Gold & Precious Metals'),
            ('stocks', 'Stocks & Equities'),
            ('crowdfunding', 'Crowdfunding'),
            ('sukuk', 'Sukuk (Islamic Bonds)'),
            ('bonds', 'Government/Corporate Bonds')
        ],
        validators=[DataRequired()]
    )
    
    quick_start = RadioField(
        'Preferences',
        choices=[
            ('detailed', 'Detailed Analysis'),
            ('quick', 'Quick Start (Use Defaults)')
        ],
        default='detailed'
    )
    
    submit = SubmitField('Get Investment Recommendations')

@app.route('/')
def index():
    """Homepage with language selection and quick overview"""
    form = InvestmentForm()
    
    # Get live market data for display (with fallback if APIs not available)
    try:
        gold_price = market_api.get_gold_price() if market_api else None
        active_stocks = market_api.get_active_stocks() if market_api else []
        real_estate_projects = investment_db.get_featured_real_estate() if investment_db else []
    except Exception as e:
        print(f"API Error: {e}")
        gold_price = None
        active_stocks = []
        real_estate_projects = []
    
    return render_template('simple_index.html')

@app.route('/analyze', methods=['GET', 'POST'])
def analyze():
    """Investment analysis and recommendation generation"""
    form = InvestmentForm()
    
    if form.validate_on_submit():
        # Extract form data
        user_data = {
            'budget': form.investment_budget.data,
            'currency': form.currency.data,
            'goal': form.investment_goal.data,
            'risk_appetite': form.risk_appetite.data,
            'investment_types': form.investment_types.data,
            'quick_start': form.quick_start.data == 'quick'
        }
        
        # Apply quick start defaults if selected
        if user_data['quick_start']:
            user_data = apply_quick_start_defaults(user_data)
        
        # Convert budget to USD for standardization
        budget_usd = exchange_api.convert_to_usd(user_data['budget'], user_data['currency'])
        user_data['budget_usd'] = budget_usd
        
        # Generate investment profile
        investment_profile = profiler.create_profile(user_data)
        
        # Generate recommendations
        recommendations = recommendation_engine.generate_recommendations(
            investment_profile, 
            user_data,
            get_locale()
        )
        
        # Get specific investment opportunities
        specific_opportunities = investment_db.get_recommendations_for_profile(
            investment_profile,
            user_data['budget_usd'],
            user_data['currency'],
            get_locale()
        )
        
        # Store results in session for later retrieval
        session['last_analysis'] = {
            'user_data': user_data,
            'profile': investment_profile,
            'recommendations': recommendations,
            'opportunities': specific_opportunities,
            'timestamp': datetime.now().isoformat()
        }
        
        return redirect(url_for('results'))
    
    return render_template('analyze.html', form=form)

@app.route('/results')
def results():
    """Display investment recommendations and analysis results"""
    if 'last_analysis' not in session:
        return redirect(url_for('index'))
    
    analysis = session['last_analysis']
    
    # Get current exchange rate for display
    exchange_rate = exchange_api.get_exchange_rate('USD', analysis['user_data']['currency'])
    
    return render_template('results.html', 
                         analysis=analysis,
                         exchange_rate=exchange_rate)

@app.route('/education')
def education():
    """Educational content about investments in multiple languages"""
    # Get latest financial news
    financial_news = news_api.get_financial_news(get_locale())
    
    return render_template('education.html', news=financial_news)

@app.route('/api/market-data')
def api_market_data():
    """API endpoint for live market data"""
    data = {
        'gold_price': market_api.get_gold_price(),
        'stocks': market_api.get_active_stocks(),
        'exchange_rates': exchange_api.get_major_rates(),
        'timestamp': datetime.now().isoformat()
    }
    return jsonify(data)

@app.route('/api/currency-convert')
def api_currency_convert():
    """API endpoint for currency conversion"""
    amount = request.args.get('amount', type=float)
    from_currency = request.args.get('from', 'USD')
    to_currency = request.args.get('to', 'AED')
    
    if not amount:
        return jsonify({'error': 'Amount required'}), 400
    
    result = exchange_api.convert_currency(amount, from_currency, to_currency)
    return jsonify(result)

@app.route('/set-language/<language>')
def set_language(language=None):
    """Set user's preferred language"""
    session['language'] = language
    return redirect(request.referrer or url_for('index'))

@app.route('/api/status')
def api_status():
    """API endpoint to test functionality"""
    return jsonify({
        'status': 'success',
        'message': 'TharaGrowth Flask API is running',
        'timestamp': datetime.now().isoformat(),
        'language': get_locale()
    })

def apply_quick_start_defaults(user_data):
    """Apply default settings for quick start users"""
    defaults = {
        'low': {
            'investment_types': ['bonds', 'sukuk', 'gold'],
            'goal': 'wealth_preservation'
        },
        'medium': {
            'investment_types': ['real_estate', 'stocks', 'gold'],
            'goal': 'capital_growth'
        },
        'high': {
            'investment_types': ['stocks', 'crowdfunding', 'real_estate'],
            'goal': 'capital_growth'
        }
    }
    
    risk_defaults = defaults.get(user_data['risk_appetite'], defaults['medium'])
    
    if not user_data['investment_types']:
        user_data['investment_types'] = risk_defaults['investment_types']
    
    return user_data

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Development server
    app.run(
        host='0.0.0.0', 
        port=int(os.getenv('FLASK_PORT', 3000)), 
        debug=os.getenv('FLASK_ENV', 'development') == 'development'
    )