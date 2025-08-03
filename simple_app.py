#!/usr/bin/env python3
"""
TharaGrowth - Simple Flask Test App
Basic version to test the setup
"""

from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import os
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'test-secret-key'
app.config['LANGUAGES'] = {
    'en': 'English',
    'ar': 'العربية', 
    'fr': 'Français'
}

@app.template_global()
def get_locale():
    # Simple language detection
    if 'language' in session:
        return session['language']
    return 'en'

@app.route('/')
def index():
    """Simple homepage"""
    return render_template('simple_index.html')

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)