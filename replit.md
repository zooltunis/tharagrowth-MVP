# InvestWise - AI Investment Advisory Application

## Overview

InvestWise is a full-stack web application that provides personalized investment recommendations using an intelligent local algorithm. The application collects user financial data through a multi-step form and generates customized investment advice with visual portfolio allocation charts.

## Recent Changes

**January 19, 2025**: Updated recommendation engine to use intelligent local algorithm instead of OpenAI API to accommodate users without API credits. The new system provides sophisticated analysis based on multiple factors including age, risk tolerance, investment amount, goals, and preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React with TypeScript, Vite for build tooling
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Chart.js for data visualization
- **AI Integration**: OpenAI API for investment recommendations
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

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