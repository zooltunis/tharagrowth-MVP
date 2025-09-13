import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import WelcomePage from "@/pages/welcome";
import DataCollectionPage from "@/pages/data-collection";
import ResultsPage from "@/pages/results";
import MarketDashboardPage from "@/pages/market-dashboard";
import EducationPage from "@/pages/education";
import NotFound from "@/pages/not-found";
import { auth, db } from './lib/firebase';

function Router() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={WelcomePage} />
          <Route path="/data-collection" component={DataCollectionPage} />
          <Route path="/results/:id" component={ResultsPage} />
          <Route path="/market-dashboard" component={MarketDashboardPage} />
          <Route path="/education" component={EducationPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
