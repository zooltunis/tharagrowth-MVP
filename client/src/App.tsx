import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import WelcomePage from "@/pages/welcome";
import DataCollectionPage from "@/pages/data-collection";
import ResultsPage from "@/pages/results";
import MarketDashboardPage from "@/pages/market-dashboard";
import EducationPage from "@/pages/education";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/data-collection" component={DataCollectionPage} />
      <Route path="/results/:id" component={ResultsPage} />
      <Route path="/market-dashboard" component={MarketDashboardPage} />
      <Route path="/education" component={EducationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
