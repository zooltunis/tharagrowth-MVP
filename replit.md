# InvestWise - AI Investment Advisory Application

## Overview

InvestWise is a full-stack web application that provides personalized investment recommendations using an intelligent local algorithm. The application collects user financial data through a multi-step form and generates customized investment advice with visual portfolio allocation charts.

## Recent Changes

**August 6, 2025**: Successfully implemented New Smart Investment Recommendation System:
- 🔴 **حذف نظام التوصية السابق كليًا**: تم حذف جميع محركات التوصية القديمة وتنظيف الكود
- 🟢 **بناء نظام توصية جديد Smart Investment Recommendation System**: 
  - استخدام Gemini AI مباشرة لتوليد توصيات ذكية ومفصلة
  - استلام بيانات المستخدم الشاملة (الميزانية، الأهداف، المدة الزمنية، مستوى المخاطرة)
  - استخدام mockdata الحقيقية من ملفات Excel (أسهم، ذهب، عقارات، صكوك، عملات رقمية)
  - إرسال prompt شامل إلى Gemini يتضمن جميع البيانات المتوفرة والملف الشخصي للمستثمر
  - النظام يقدم توصيات بمبالغ محددة وليس نسب مئوية (مثل: "50000 درهم في 588 سهم من إعمار")
  - تحليل استراتيجي يشرح منطق التوزيع بناءً على استراتيجيات استثمار معروفة
- ✅ **اختبار ناجح**: النظام الجديد يولد 6 توصيات ذكية بإجمالي 49,985 درهم من ميزانية 50,000 درهم
- ✅ **تنظيف شامل**: إزالة جميع الملفات والتبعيات القديمة والحفاظ على البيانات الحقيقية فقط

**August 4, 2025**: Successfully implemented Comprehensive Investment Platform with Crypto & Bonds:
- ✅ Fixed Gemini AI engine to use proper market-specific data filtering for UAE vs Saudi markets
- ✅ Integrated authentic Excel mockdata files (UAE real estate, stocks, sukuk bonds) with AI recommendations
- ✅ AI now correctly recommends UAE companies when UAE market is selected: Emaar Properties, FAB Bank, ADNOC, Etisalat UAE
- ✅ Added comprehensive cryptocurrency support: Bitcoin, Ethereum, Cardano, Solana, Polygon with Islamic compliance filtering
- ✅ Integrated government bonds and corporate sukuk: UAE Treasury bonds, Saudi government sukuk, Aramco bonds
- ✅ Built comprehensive recommendation system that analyzes user profile + market data to generate personalized strategies
- ✅ AI provides realistic portfolio allocation with exact amounts from authentic data sources
- ✅ Generated detailed strategy explanations with Arabic reasoning for each investment choice
- ✅ Implemented smart fallback system: Gemini primary engine with Dynamic engine backup
- ✅ Successfully tested with real Gulf market data integration and Islamic compliance filtering
- ✅ AI system considers: age, income, risk tolerance, market preference, currency, Islamic compliance, and payment frequency

**August 4, 2025**: Successfully implemented Smart Investment Preferences Form for Gulf Market:
- ✅ Added Gulf market-specific fields: Target Market (UAE/Saudi/Gulf/International), Currency preference (AED default), Islamic compliance filter, and diversification options
- ✅ Enhanced multilingual support with comprehensive Arabic/English/French translations for all new fields
- ✅ Updated database schema to support new market preferences and compliance filters
- ✅ Integrated dynamic recommendation engine with real data - tested successfully with 5 personalized recommendations (66K AED allocated from 100K budget)
- ✅ Added smart market filtering with country flags and help tooltips for enhanced UX
- ✅ Implemented comprehensive language context system replacing local language variables

**August 3, 2025**: Successfully completed comprehensive Excel data integration and recommendation engine enhancement:
- ✅ Implemented chat-based Excel file processing system instead of public upload interface
- ✅ Processed user's actual Excel files: "Client transfer", "UAE Real Estate Projects", "Sukuk Islamic Bonds", "Crowdfunding Projects MENA"
- ✅ Generated comprehensive real data files for all investment categories with 50+ authentic investment opportunities
- ✅ Created UpdatedRecommendationEngine using real market data from processed Excel files
- ✅ Added UAE real estate projects (15 projects) for cross-border diversification
- ✅ Integrated Islamic Sukuk bonds (12 Sharia-compliant bonds) for ethical investing
- ✅ Added MENA crowdfunding projects (10 projects) for alternative investments
- ✅ Enhanced algorithm to provide exact amounts and quantities with smart diversification
- ✅ Integrated authentic Saudi and GCC market data for precise recommendations

**August 3, 2025**: Successfully completed Flask backend rebuild of TharaGrowth application. Core infrastructure now running on Python Flask with trilingual support (English, Arabic, French). Main application server operational on port 3000 with working API endpoints and template rendering system.

**August 3, 2025**: Enhanced recommendation system with real data integration:
- Updated algorithm to use authentic data from user's Excel file instead of synthetic data
- Provides specific investment recommendations with exact quantities (e.g., "127 shares of Emaar", "15 grams of gold")
- Utilizes real Saudi and GCC market data for stocks, real estate, bonds, and gold prices
- Chat-based Excel processing replaces public upload interface for enhanced security
- Algorithm considers user's budget constraints and ensures total doesn't exceed available investment amount

**August 3, 2025**: Successfully implemented comprehensive educational content and legal compliance features:
- ✅ Created trilingual educational content (Arabic, English, French) with investment basics, risk management, and financial planning
- ✅ Integrated real-time financial news feeds with caching for performance optimization
- ✅ Added legal disclaimers on all pages stating platform is for educational purposes only
- ✅ Implemented performance optimizations for Replit free-tier deployment
- ✅ Added health check endpoints and API monitoring for production readiness
- ✅ Created comprehensive config.json for deployment configuration management

**January 19, 2025**: Enhanced recommendation system to provide detailed, specific investment opportunities instead of just percentage allocations. Added comprehensive investment database with real estate projects, stocks, bonds, gold options, and savings products. Each recommendation includes specific prices, expected returns, payment plans, risk levels, and detailed features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: Python Flask with Jinja2 templates
- **Backend**: Python Flask with WTForms for form handling
- **Database**: PostgreSQL (ready for implementation)
- **Styling**: Tailwind CSS for responsive design
- **Internationalization**: Flask-Babel for trilingual support (EN/AR/FR)
- **AI Integration**: Intelligent local recommendation algorithm
- **API**: RESTful Flask endpoints for data processing
- **Deployment**: Optimized for low-cost hosting platforms

### Architecture Pattern
The application follows a monorepo structure with clear separation between client, server, and shared code:
- **Client**: React SPA with component-based architecture
- **Server**: RESTful API with Express.js
- **Shared**: Common TypeScript schemas and types

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components for consistent UI
- **Form Management**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query for API communication
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Chart.js integration for portfolio visualization

### Backend Architecture
- **API Structure**: RESTful endpoints for data analysis
- **Storage Layer**: Abstracted storage interface with PostgreSQL database implementation
- **AI Integration**: Intelligent local algorithm for generating recommendations
- **Error Handling**: Centralized error handling middleware

### Database Schema
- **investment_analyses**: Stores user data and AI-generated recommendations
  - User demographics (age, income, investment amount)
  - Investment goals and preferences
  - Risk tolerance level
  - AI-generated portfolio allocation and analysis

## Data Flow

1. **User Input**: Multi-step form collects user financial information
2. **Validation**: Zod schemas validate data on both client and server
3. **AI Processing**: OpenAI API generates personalized investment recommendations
4. **Storage**: Analysis results stored with unique ID
5. **Visualization**: Results displayed with interactive charts and detailed breakdown

### API Endpoints
- `POST /api/analyze` - Process user data and generate recommendations
- `GET /api/analysis/:id` - Retrieve stored analysis by ID

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **AI Service**: OpenAI GPT API
- **UI Components**: Radix UI primitives via shadcn/ui
- **Charts**: Chart.js for data visualization

### Development Tools
- **Database Migration**: Drizzle Kit
- **Type Safety**: TypeScript with strict configuration
- **Build System**: Vite with React plugin
- **Code Quality**: ESLint and TypeScript compiler

## Deployment Strategy

### Production Build
- **Client**: Vite builds optimized React bundle to `dist/public`
- **Server**: esbuild bundles Node.js server to `dist/index.js`
- **Assets**: Static files served by Express in production

### Environment Configuration
- **Development**: Hot module replacement with Vite dev server
- **Production**: Express serves static files and API endpoints
- **Database**: Environment variable configuration for PostgreSQL connection

### Key Features
- **Progressive Enhancement**: Works with JavaScript disabled for basic functionality
- **Mobile Responsive**: Tailwind CSS responsive design
- **Arabic Support**: RTL-friendly UI components and Arabic text content
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Proper loading indicators throughout the application

The application is designed to be scalable, maintainable, and user-friendly, with clear separation of concerns and modern development practices.