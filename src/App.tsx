import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { WhatsAppPaymentGuide } from './components/WhatsAppPaymentGuide';
import { ScentFinderModal } from './components/ScentFinderModal';
import { AdminPortal } from './components/AdminPortal';
import { MotionBackground } from './components/MotionBackground';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { PRODUCTS } from './data/products';
import { STUDIO_IMAGES, resolveProductImage } from './data/images';
import { ADMIN_HASH_ROUTE } from './utils/adminAuth';
import { Product, CartItem, Currency } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  // Product state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mirex_custom_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => ({
            ...p,
            image: resolveProductImage(p.image),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load custom products', e);
    }
    return PRODUCTS;
  });
  
  // Theme state (persisted in localStorage)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('mirex_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Currency state (persisted in localStorage)
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('mirex_currency') as Currency;
      return saved && ['USD', 'GBP', 'EUR', 'NGN'].includes(saved) ? saved : 'USD';
    } catch {
      return 'USD';
    }
  });

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('mirex_theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('mirex_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem('mirex_currency', newCurrency);
    } catch (e) {
      console.error('Failed to save currency', e);
    }
    showToast(`Currency changed to ${newCurrency}`);
  };

  // Cart / Inquiry Bag state (persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mirex_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.hash === ADMIN_HASH_ROUTE;
  });
  const [whatsappVersion, setWhatsappVersion] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mirex_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Listen for private Admin Portal hash route & Ctrl/Cmd+Shift+A shortcut
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === ADMIN_HASH_ROUTE) {
        setIsAdminOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === ADMIN_HASH_ROUTE) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Product mutations for Admin Portal
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some(p => p.id === updatedProduct.id);
      const nextList = exists
        ? prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        : [updatedProduct, ...prev];
      try {
        localStorage.setItem('mirex_custom_products', JSON.stringify(nextList));
      } catch (e) {
        console.error(e);
      }
      return nextList;
    });
    showToast(`Flacon "${updatedProduct.name}" saved to storefront`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const nextList = prev.filter(p => p.id !== productId);
      try {
        localStorage.setItem('mirex_custom_products', JSON.stringify(nextList));
      } catch (e) {
        console.error(e);
      }
      return nextList;
    });
    setCartItems((prev) => prev.filter(i => i.productId !== productId));
    showToast('Flacon removed from storefront');
  };

  const handleResetToDefaults = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem('mirex_custom_products');
    } catch (e) {
      console.error(e);
    }
    showToast('Catalog restored to original curated collection');
  };

  // Cart operations
  const handleAddToCart = (product: Product, volume: string, unitPrice: number) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.volume === volume
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      } else {
        return [...prev, { productId: product.id, volume, unitPrice, quantity: 1 }];
      }
    });
    showToast(`Added ${product.name} (${volume}) to WhatsApp Bag`);
  };

  const handleUpdateQuantity = (productId: string, volume: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId && item.volume === volume) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string, volume: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.volume === volume))
    );
    showToast('Item removed from inquiry bag');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Inquiry bag cleared');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleScrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFocusSearch = () => {
    handleScrollToCollection();
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 300);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EF] dark:bg-[#140E0C] text-[#3E312D] dark:text-[#F4EFEB] transition-colors duration-200 selection:bg-[#DCCBB8] dark:selection:bg-[#3D2F2A] selection:text-[#3E312D] dark:selection:text-[#F5EFEB] relative">
      
      {/* Motion Graphics Ambient Background */}
      <MotionBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-[#3E312D] dark:bg-[#F5EFEB] text-[#F7F3EF] dark:text-[#15100E] px-4 py-3 rounded-xl shadow-2xl border border-[#DCCBB8]/50 dark:border-[#3D2F2A] text-xs font-sans flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#B98F77] dark:text-[#C8977D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenConsultation={() => setIsConsultationOpen(true)}
        onSearchClick={handleFocusSearch}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Hero Section with motion graphics */}
      <main className="flex-1 relative z-10">
        <Hero
          onExploreClick={handleScrollToCollection}
          onOpenConsultation={() => setIsConsultationOpen(true)}
          onQuickWhatsApp={() => setIsCartOpen(true)}
        />

        {/* Product Catalog with WhatsApp inquiry on every item */}
        <ProductGrid
          products={products}
          currency={currency}
          onOpenDetail={(product) => setSelectedProduct(product)}
          onAddToCart={handleAddToCart}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Editorial Brand Narrative & Olfactory Philosophy */}
        <section id="story" className="py-14 sm:py-20 bg-[#FAF7F3] dark:bg-[#1A1311] border-t border-[#DCCBB8]/70 dark:border-[#3D2F2A] transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-5 sm:space-y-6">
                <div className="text-[11px] sm:text-xs tracking-[0.24em] sm:tracking-[0.28em] uppercase text-[#B98F77] dark:text-[#D4A388] font-sans font-medium">
                  The Mirex Difference
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#3E312D] dark:text-[#F5EFEB] leading-tight">
                  Hand-Poured in Small Batches. Matured for 90 Days.
                </h2>
                <p className="text-xs sm:text-sm text-[#3E312D]/80 dark:text-[#C2B5AC] font-sans leading-relaxed">
                  While mass-market perfumes rely on synthetic aroma-chemicals and high water dilution, every flacon of MIREX SCENT is created with a minimum of 30% pure perfume oil concentration. We let our pure botanical oils macerate over months, allowing the woods, ambers, and florals to harmonize naturally on the skin.
                </p>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2 text-xs font-sans">
                  <div className="border-t border-[#DCCBB8] dark:border-[#3D2F2A] pt-3 space-y-1">
                    <span className="font-serif text-xl sm:text-2xl text-[#3E312D] dark:text-[#F5EFEB] block tabular-nums">30% - 35%</span>
                    <span className="text-[#3E312D]/70 dark:text-[#C2B5AC] uppercase tracking-wider text-[10px] sm:text-[11px]">Extrait de Parfum Oil</span>
                  </div>
                  <div className="border-t border-[#DCCBB8] dark:border-[#3D2F2A] pt-3 space-y-1">
                    <span className="font-serif text-xl sm:text-2xl text-[#3E312D] dark:text-[#F5EFEB] block tabular-nums">90 Days</span>
                    <span className="text-[#3E312D]/70 dark:text-[#C2B5AC] uppercase tracking-wider text-[10px] sm:text-[11px]">Artisanal Maceration</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsConsultationOpen(true)}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#B98F77] dark:text-[#D4A388] hover:text-[#3E312D] dark:hover:text-white font-semibold font-sans cursor-pointer group"
                  >
                    <span>Take the Scent Quiz for a Personalized Recommendation</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Showcase Image */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-[#DCCBB8] dark:border-[#3D2F2A] shadow-lg bg-[#EFE8DF] dark:bg-[#251D1A]">
                  <img
                    src={STUDIO_IMAGES.discoverySet}
                    alt="Mirex Scent Discovery Set with sleek frosted bottles"
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Step-by-Step Guide on How WhatsApp Payment & Ordering Works */}
        <WhatsAppPaymentGuide />

      </main>

      {/* Footer */}
      <Footer
        key={`footer-${whatsappVersion}`}
        onOpenConsultation={() => setIsConsultationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating WhatsApp Concierge Button */}
      <FloatingWhatsApp key={`wa-${whatsappVersion}`} />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <WhatsAppDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        products={products}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <ScentFinderModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        products={products}
        currency={currency}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        products={products}
        currency={currency}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetToDefaults={handleResetToDefaults}
        onWhatsAppUpdated={() => {
          setWhatsappVersion((v) => v + 1);
          showToast('WhatsApp Concierge Number Updated');
        }}
      />

    </div>
  );
}
