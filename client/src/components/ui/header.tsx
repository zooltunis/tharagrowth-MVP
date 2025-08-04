import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { useLanguage, useTranslation, commonTranslations } from "@/contexts/LanguageContext";
import logoPath from "@assets/TharaGrowth Logo - Emblem Style with Calligraphy Twist_20250803_194834_0000_1754247313539.png";

interface HeaderProps {
  // No props needed anymore - using context
}

export function Header(props: HeaderProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslation();

  const languages = [
    { code: "ar" as const, name: "العربية", dir: "rtl" },
    { code: "en" as const, name: "English", dir: "ltr" },
    { code: "fr" as const, name: "Français", dir: "ltr" }
  ];

  const navigation = [
    { href: "/", label: commonTranslations.home },
    { href: "/data-collection", label: commonTranslations.analysis },
    { href: "/market-dashboard", label: commonTranslations.market },
    { href: "/education", label: commonTranslations.education }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50" dir={isRTL ? "rtl" : "ltr"}>
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
                {t({ ar: "مستشار الاستثمار الذكي", en: "Smart Investment Advisor", fr: "Conseiller Intelligent" })}
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
                {t(nav.label)}
              </Link>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {languages.find(lang => lang.code === currentLanguage)?.name}
                </span>
              </Button>
              
              {/* Language Dropdown */}
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors ${
                      currentLanguage === lang.code ? 'bg-muted text-primary font-medium' : 'text-foreground'
                    }`}
                    dir={lang.dir}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  {t(nav.label)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}