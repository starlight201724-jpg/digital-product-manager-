import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Filter,
  Package,
  RotateCcw,
  Gem,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { DigitalProduct, ProductCategory, ProductStatus } from "./types";
import { INITIAL_PRODUCTS } from "./data/seedProducts";
import { Navbar } from "./components/Navbar";
import { MetricCards } from "./components/MetricCards";
import { ProductCard } from "./components/ProductCard";
import { ProductEditorModal } from "./components/ProductEditorModal";
import { ImageGeneratorModal } from "./components/ImageGeneratorModal";
import { GeminiChatModal } from "./components/GeminiChatModal";
import { MarketingModal } from "./components/MarketingModal";
import { ToastContainer, ToastMessage } from "./components/Toast";

const CATEGORIES: ProductCategory[] = [
  "All",
  "Canva & Design Systems",
  "Notion Operating Systems",
  "E-Books & Editorial Guides",
  "Lightroom Presets & LUTs",
  "Masterclasses & Audio",
  "Luxury Planners & Printables",
  "Brand Identity Kits",
];

const LOCAL_STORAGE_KEY = "atelier_digitale_products_v1";

export default function App() {
  // Load products from localStorage or use initial seed
  const [products, setProducts] = useState<DigitalProduct[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load products from storage", e);
    }
    return INITIAL_PRODUCTS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to storage", e);
    }
  }, [products]);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "revenue">(
    "newest"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);

  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [imageStudioTargetProduct, setImageStudioTargetProduct] =
    useState<DigitalProduct | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [marketingTargetProduct, setMarketingTargetProduct] =
    useState<DigitalProduct | null>(null);

  // Notifications / Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== "All" && p.category !== selectedCategory) {
          return false;
        }
        // Status
        if (selectedStatus !== "all" && p.status !== selectedStatus) {
          return false;
        }
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesTagline = p.tagline.toLowerCase().includes(q);
          const matchesFormat = p.format.toLowerCase().includes(q);
          const matchesAudience = p.targetAudience?.toLowerCase().includes(q);
          return matchesTitle || matchesTagline || matchesFormat || matchesAudience;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        }
        if (sortBy === "price-desc") {
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        }
        if (sortBy === "revenue") {
          return (b.totalRevenue || 0) - (a.totalRevenue || 0);
        }
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, selectedStatus, searchQuery, sortBy]);

  // Handlers for product mutations
  const handleSaveProduct = (savedProduct: DigitalProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    if (window.confirm(`Are you sure you want to remove "${target.title}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast("info", "Product Removed", `"${target.title}" was deleted.`);
    }
  };

  const handleApplyImageToProduct = (
    imageUrl: string,
    size: "1K" | "2K" | "4K",
    prompt: string
  ) => {
    if (!imageStudioTargetProduct) return;
    const updated: DigitalProduct = {
      ...imageStudioTargetProduct,
      coverImage: imageUrl,
      coverImageSize: size,
      coverImagePrompt: prompt,
      updatedAt: new Date().toISOString(),
    };
    handleSaveProduct(updated);
  };

  const handleSaveMarketingCaptions = (productId: string, captions: any) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, marketingCaptions: captions, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const handleResetCatalog = () => {
    if (window.confirm("Reset all products back to default luxury seed collection?")) {
      setProducts(INITIAL_PRODUCTS);
      addToast("success", "Catalog Reset", "Restored default digital product suite.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2622] flex flex-col font-sans">
      {/* Top Luxury Navbar */}
      <Navbar
        onOpenCreateModal={() => {
          setEditingProduct(null);
          setIsEditorOpen(true);
        }}
        onOpenImageStudio={() => {
          setImageStudioTargetProduct(null);
          setIsImageStudioOpen(true);
        }}
        onOpenChatModal={() => setIsChatOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
        {/* Editorial Subheader & Atelier Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FDFBF7] to-[#F5EFE6] border border-[#EADBCA] p-6 sm:p-10 shadow-xs">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E5] border border-[#E8DAC2] text-[11px] font-semibold uppercase tracking-widest text-[#9E7321]">
              <Sparkles className="w-3.5 h-3.5" />
              Quiet Luxury Commerce Studio
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#231B15] tracking-tight leading-tight">
              Curate, Price & Launch{" "}
              <span className="italic font-light text-[#9E7321]">
                Haute Digital Assets
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#6E5E50] leading-relaxed font-light">
              Craft bespoke e-books, Notion operating systems, design suites, and presets.
              Elevate your sales narrative with Gemini descriptions, multi-channel marketing, and
              ultra-high-resolution cover visuals.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] via-[#C5A059] to-[#BF974B] hover:opacity-95 transition-all shadow-sm active:scale-98"
              >
                <Plus className="w-4 h-4" />
                Create New Offering
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#5A4B3E] bg-[#FAF8F5] hover:bg-[#EFE5D6] border border-[#DFD5C2] transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#C5A059]" />
                Consult Aurelia
              </button>
            </div>
          </div>

          {/* Decorative subtle gold botanical watermarks */}
          <div className="absolute right-[-40px] bottom-[-40px] w-96 h-96 rounded-full bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none blur-2xl" />
        </section>

        {/* Portfolio Metrics */}
        <MetricCards products={products} />

        {/* Catalog Exploration Controls */}
        <section className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === "All"
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#2D2622] text-[#FAF8F5] border-[#2D2622] shadow-xs"
                      : "bg-[#FDFBF7] text-[#6E5E50] border-[#EADBCA] hover:border-[#C5A059]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-[#423730] text-[#EFE8DC]" : "bg-[#EFE8DC] text-[#7A6C5E]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Status, Sort & View Mode Toolbar */}
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCA] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A08855] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, tagline, audience or format..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#DFD5C2] text-xs text-[#2D2622] placeholder:text-[#9E8E7D] focus:outline-none focus:border-[#C5A059] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-[#9E8E7D] hover:text-[#2D2622]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#9E8E7D]" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#DFD5C2] text-[#3D332A] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="featured">Featured</option>
                  <option value="draft">Drafts</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#9E8E7D]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#DFD5C2] text-[#3D332A] focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="revenue">Highest Revenue</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#FAF8F5] border border-[#DFD5C2] rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#2D2622] text-[#FAF8F5]"
                      : "text-[#8A796B] hover:text-[#2D2622]"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[#2D2622] text-[#FAF8F5]"
                      : "text-[#8A796B] hover:text-[#2D2622]"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Display */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#FDFBF7] border border-[#EADBCA] space-y-4">
              <Package className="w-12 h-12 text-[#C5A059] mx-auto opacity-60" />
              <h3 className="font-serif text-2xl font-semibold text-[#2D2622]">
                No Offerings Match Your Criteria
              </h3>
              <p className="text-xs text-[#7A6C5E] max-w-md mx-auto leading-relaxed">
                Try resetting your search query or category filters, or craft a new luxury
                digital product with the Atelier creator studio.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedStatus("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A4B3E] bg-[#F5EFE6] border border-[#DFD5C2] hover:bg-[#EFE5D6]"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsEditorOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#231B15] bg-[#C5A059] hover:bg-[#B38C3E] text-white"
                >
                  Create New Offering
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode="grid"
                  onSelect={(p) => {
                    setEditingProduct(p);
                    setIsEditorOpen(true);
                  }}
                  onOpenMarketing={(p) => {
                    setMarketingTargetProduct(p);
                    setIsMarketingModalOpen(true);
                  }}
                  onOpenCoverStudio={(p) => {
                    setImageStudioTargetProduct(p);
                    setIsImageStudioOpen(true);
                  }}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode="list"
                  onSelect={(p) => {
                    setEditingProduct(p);
                    setIsEditorOpen(true);
                  }}
                  onOpenMarketing={(p) => {
                    setMarketingTargetProduct(p);
                    setIsMarketingModalOpen(true);
                  }}
                  onOpenCoverStudio={(p) => {
                    setImageStudioTargetProduct(p);
                    setIsImageStudioOpen(true);
                  }}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Tools & Reset Bar */}
        <section className="pt-8 border-t border-[#EBE4D5] flex flex-wrap items-center justify-between gap-4 text-xs text-[#8A796B]">
          <div className="flex items-center gap-2">
            <Gem className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>
              Showing {filteredProducts.length} of {products.length} Digital Offerings
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetCatalog}
              className="inline-flex items-center gap-1.5 hover:text-[#2D2622] transition-colors"
              title="Restore initial seed products"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Default Catalog
            </button>
          </div>
        </section>
      </main>

      {/* Luxury Footer */}
      <footer className="mt-16 border-t border-[#EADBCA] bg-[#FAF8F5] py-8 text-center text-xs text-[#8A796B]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif text-lg tracking-wider text-[#2D2622] font-semibold">
            Atelier Digitale
          </p>
          <p className="text-[11px] font-light tracking-wide">
            Designed with Ivory, Soft Beige & Warm Gold • Powered by Google Gemini AI
          </p>
        </div>
      </footer>

      {/* Product Creator & Editor Modal */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        onOpenImageStudioForProduct={(p) => {
          setIsEditorOpen(false);
          setImageStudioTargetProduct(p);
          setIsImageStudioOpen(true);
        }}
        onNotify={addToast}
      />

      {/* High-Resolution Cover Image Generator Modal (1K, 2K, 4K) */}
      <ImageGeneratorModal
        isOpen={isImageStudioOpen}
        onClose={() => {
          setIsImageStudioOpen(false);
          setImageStudioTargetProduct(null);
        }}
        targetProduct={imageStudioTargetProduct}
        onApplyImageToProduct={handleApplyImageToProduct}
        onNotify={addToast}
      />

      {/* Gemini Multi-turn Chatbot Modal (Aurelia) */}
      <GeminiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNotify={addToast}
      />

      {/* Marketing Captions Modal */}
      <MarketingModal
        isOpen={isMarketingModalOpen}
        onClose={() => {
          setIsMarketingModalOpen(false);
          setMarketingTargetProduct(null);
        }}
        product={marketingTargetProduct}
        onSaveMarketingCaptions={handleSaveMarketingCaptions}
        onNotify={addToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
