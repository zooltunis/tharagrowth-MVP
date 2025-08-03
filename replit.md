# InvestWise - AI Investment Advisory Application

## Overview

InvestWise is a full-stack web application that provides personalized investment recommendations using an intelligent local algorithm. The application collects user financial data through a multi-step form and generates customized investment advice with visual portfolio allocation charts.

## Recent Changes

**August 3, 2025**: Successfully implemented comprehensive live market data integration with real-time APIs:
- ✅ Created comprehensive market data API endpoints for gold prices, stocks, and currency conversion
- ✅ Integrated real-time gold price data from MetalsAPI with fallback to current market rates
- ✅ Added live stock data from Twelve Data API for Saudi market (TADAWUL)
- ✅ Implemented currency conversion using exchangerate.host API
- ✅ Built interactive Market Dashboard with real-time updates every 30 seconds
- ✅ Added newly launched real estate projects database with Saudi/UAE mega projects
- ✅ Enhanced recommendation engine with authentic data from multiple sources
- ✅ Added market navigation to welcome page

**August 3, 2025**: Successfully completed Flask backend rebuild of TharaGrowth application. Core infrastructure now running on Python Flask with trilingual support (English, Arabic, French). Main application server operational on port 3000 with working API endpoints and template rendering system.

**January 19, 2025**: Updated recommendation engine to use intelligent local algorithm instead of OpenAI API to accommodate users without API credits. The new system provides sophisticated analysis based on multiple factors including age, risk tolerance, investment amount, goals, and preferences.

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