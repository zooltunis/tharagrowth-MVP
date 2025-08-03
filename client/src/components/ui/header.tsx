import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import logoPath from "@assets/TharaGrowth Logo - Emblem Style with Calligraphy Twist_20250803_194834_0000_1754247313539.png";

interface HeaderProps {
  currentLang?: string;
  onLanguageChange?: (lang: string) => void;
}

export function Header({ currentLang = "ar", onLanguageChange }: HeaderProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const languages = [
    { code: "ar", name: "العربية", dir: "rtl" },
    { code: "en", name: "English", dir: "ltr" },
    { code: "fr", name: "Français", dir: "ltr" }
  ];

  const navigation = [
    { href: "/", label: "الرئيسية", labelEn: "Home", labelFr: "Accueil" },
    { href: "/data-collection", label: "التحليل", labelEn: "Analysis", labelFr: "Analyse" },
    { href: "/market-dashboard", label: "السوق", labelEn: "Market", labelFr: "Marché" },
    { href: "/education", label: "التعليم", labelEn: "Education", labelFr: "Éducation" }
  ];

  const getNavLabel = (nav: any) => {
    switch (currentLang) {
      case "en": return nav.labelEn;
      case "fr": return nav.labelFr;
      default: return nav.label;
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="logo-container w-12 h-12">
              <img 
                src={logoPath} 
                alt="TharaGrowth Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">TharaGrowth</h1>
              <p className="text-xs text-muted-foreground -mt-1">
                {currentLang === "en" ? "Smart Investment Advisor" : 
                 currentLang === "fr" ? "Conseiller Intelligent" : 
                 "مستشار الاستثمار الذكي"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((nav) => (
              <Link 
                key={nav.href} 
                href={nav.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === nav.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {getNavLabel(nav)}
              </Link>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="language-switcher">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange?.(lang.code)}
                  className={`language-btn ${currentLang === lang.code ? "active" : ""}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((nav) => (
                <Link 
                  key={nav.href} 
                  href={nav.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location === nav.href 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getNavLabel(nav)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}