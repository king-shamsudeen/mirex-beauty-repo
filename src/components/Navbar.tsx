import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles, Search, Sun, Moon } from 'lucide-react';
import { Currency, CURRENCY_CONFIG } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenConsultation: () => void;
  onSearchClick: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenConsultation,
  onSearchClick,
  isDark,
  onToggleTheme,
  currency,
  onCurrencyChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3EF]/90 dark:bg-[#15100E]/90 backdrop-blur-md border-b border-[#DCCBB8]/60 dark:border-[#3D2F2A] transition-colors duration-200">
      {/* Slim Top Bar Announcement */}
      <div className="bg-[#3E312D] dark:bg-[#1F1714] text-[#F7F3EF] dark:text-[#EFE8DF] px-3 py-1 text-center text-[10px] sm:text-xs tracking-[0.14em] sm:tracking-widest uppercase font-sans flex items-center justify-center gap-2 border-b dark:border-[#3D2F2A]">
        <span className="hidden md:inline">Artisanal Extrait de Parfum</span>
        <span aria-hidden="true" className="hidden md:inline opacity-50">·</span>
        <span className="truncate">Orders &amp; Payment via WhatsApp Concierge</span>
        <span aria-hidden="true" className="hidden lg:inline opacity-50">·</span>
        <span className="hidden lg:inline">Complimentary Worldwide Insured Dispatch</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8 h-16 sm:h-20">
          
          {/* Zone 1: Single element brand wordmark */}
          <a 
            href="#" 
            className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[#3E312D] dark:text-[#F5EFEB] hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98F77]"
          >
            MIREX SCENT
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-medium tracking-[0.18em] uppercase text-[#3E312D]/80 dark:text-[#F5EFEB]/80">
            <a 
              href="#collection" 
              className="hover:text-[#3E312D] dark:hover:text-[#F5EFEB] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-[#B98F77]"
            >
              Collection
            </a>
            <a 
              href="#how-it-works" 
              className="hover:text-[#3E312D] dark:hover:text-[#F5EFEB] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-[#B98F77]"
            >
              WhatsApp Payment
            </a>
            <a 
              href="#story" 
              className="hover:text-[#3E312D] dark:hover:text-[#F5EFEB] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-[#B98F77]"
            >
              Our Craft
            </a>
            <button 
              type="button"
              onClick={onOpenConsultation}
              className="hover:text-[#3E312D] dark:hover:text-[#F5EFEB] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-[#B98F77] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B98F77] dark:text-[#D4A388]" />
              <span>Scent Matcher</span>
            </button>
          </nav>

          {/* Zone 3: Responsive Controls + Primary Action */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Currency Selector (visible on tablet/desktop, inside menu on small mobile) */}
            <div className="hidden sm:block relative">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                aria-label="Currency selector"
                className="bg-transparent border border-[#DCCBB8]/70 dark:border-[#3D2F2A] rounded px-2 py-1.5 text-xs text-[#3E312D] dark:text-[#F5EFEB] font-sans font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B98F77] hover:bg-[#DCCBB8]/20 dark:hover:bg-[#271E1B]"
              >
                {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((c) => (
                  <option key={c} value={c} className="bg-[#FAF7F3] dark:bg-[#1E1715] text-[#3E312D] dark:text-[#F5EFEB]">
                    {CURRENCY_CONFIG[c].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#3E312D]/80 dark:text-[#F5EFEB]/80 hover:text-[#3E312D] dark:hover:text-[#F5EFEB] transition-colors rounded-full hover:bg-[#DCCBB8]/30 dark:hover:bg-[#271E1B] cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#3E312D]" />
              )}
            </button>

            {/* Search Trigger (desktop/tablet top bar, mobile inside menu) */}
            <button
              type="button"
              onClick={onSearchClick}
              aria-label="Search fragrances"
              className="hidden sm:flex p-2 min-w-[40px] min-h-[40px] items-center justify-center text-[#3E312D]/80 dark:text-[#F5EFEB]/80 hover:text-[#3E312D] dark:hover:text-[#F5EFEB] transition-colors rounded-full hover:bg-[#DCCBB8]/30 dark:hover:bg-[#271E1B] cursor-pointer"
              title="Search collection"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Inquiry Bag */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open Inquiry Bag (${cartCount} items)`}
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#3E312D] dark:bg-[#F5EFEB] text-[#F7F3EF] dark:text-[#15100E] hover:bg-[#2D2320] dark:hover:bg-[#E2DDD8] transition-all rounded shadow-sm text-xs font-medium tracking-[0.12em] sm:tracking-[0.14em] uppercase cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98F77] whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-105" />
              <span className="hidden sm:inline">Inquiry Bag</span>
              <span className="px-1.5 py-0.5 bg-[#B98F77] dark:bg-[#C8977D] text-white rounded-full text-[10px] font-sans font-semibold tabular-nums leading-none">
                {cartCount}
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#3E312D] dark:text-[#F5EFEB] hover:bg-[#DCCBB8]/30 dark:hover:bg-[#271E1B] rounded cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#DCCBB8]/50 dark:border-[#3D2F2A] space-y-2 font-sans text-xs tracking-widest uppercase">
            <a 
              href="#collection" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-[#3E312D] dark:text-[#F5EFEB] hover:text-[#B98F77]"
            >
              Full Fragrance Collection
            </a>
            <a 
              href="#story" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-[#3E312D] dark:text-[#F5EFEB] hover:text-[#B98F77]"
            >
              Our Craft &amp; Concentration
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-[#3E312D] dark:text-[#F5EFEB] hover:text-[#B98F77]"
            >
              How WhatsApp Payment Works
            </a>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSearchClick();
              }}
              className="sm:hidden flex items-center gap-2 py-2.5 text-[#3E312D] dark:text-[#F5EFEB] hover:text-[#B98F77] w-full text-left cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#B98F77] dark:text-[#D4A388]" />
              <span>Search Fragrances</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="flex items-center gap-2 py-2.5 text-[#B98F77] dark:text-[#D4A388] font-semibold w-full text-left cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Interactive Scent Finder Quiz</span>
            </button>

            {/* Mobile Currency Selector */}
            <div className="sm:hidden pt-3 mt-2 border-t border-[#DCCBB8]/40 dark:border-[#3D2F2A]/60 flex items-center justify-between">
              <span className="text-[11px] text-[#3E312D]/70 dark:text-[#C2B5AC]">Currency</span>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                aria-label="Mobile currency selector"
                className="bg-[#FAF7F3] dark:bg-[#1D1513] border border-[#DCCBB8] dark:border-[#3D2F2A] rounded px-3 py-1.5 text-xs text-[#3E312D] dark:text-[#F5EFEB] font-sans font-medium"
              >
                {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((c) => (
                  <option key={c} value={c} className="bg-[#FAF7F3] dark:bg-[#1E1715] text-[#3E312D] dark:text-[#F5EFEB]">
                    {CURRENCY_CONFIG[c].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
