import React, { useState } from "react";
import { Sparkles, Plus, Image as ImageIcon, MessageSquare, Menu, X, Gem } from "lucide-react";

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenImageStudio: () => void;
  onOpenChatModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onOpenImageStudio,
  onOpenChatModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EBE4D5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#C5A059] to-[#EBD59B] p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-[#FAF8F5] flex items-center justify-center">
                <Gem className="w-4 h-4 text-[#C5A059]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-semibold tracking-wider text-[#2D2622]">
                  Atelier Digitale
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-widest bg-[#EFE9DF] text-[#7A6B5D] rounded-full border border-[#E2D8C7]">
                  Studio
                </span>
              </div>
              <p className="text-xs text-[#8A796B] font-normal tracking-wide">
                Luxury Digital Product Suite
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="nav-chat-btn"
              onClick={onOpenChatModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#5A4B3E] bg-[#F5EFE6] hover:bg-[#EFE5D6] border border-[#E2D7C3] transition-all shadow-xs hover:shadow-sm active:scale-98"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C5A059]" />
              AI Brand Strategist
            </button>

            <button
              id="nav-image-btn"
              onClick={onOpenImageStudio}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#5A4B3E] bg-[#F5EFE6] hover:bg-[#EFE5D6] border border-[#E2D7C3] transition-all shadow-xs hover:shadow-sm active:scale-98"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#C5A059]" />
              Cover Studio (1K–4K)
            </button>

            <button
              id="nav-new-product-btn"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] via-[#C5A059] to-[#BF974B] hover:opacity-95 transition-all shadow-sm hover:shadow active:scale-98"
            >
              <Plus className="w-4 h-4" />
              New Product
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#5A4B3E] hover:bg-[#EFE9DF] border border-[#E2D7C3]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EBE4D5] bg-[#FAF8F5] px-4 pt-3 pb-5 space-y-2.5">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCreateModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] to-[#C5A059] shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Product
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenChatModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#5A4B3E] bg-[#F5EFE6] border border-[#E2D7C3]"
          >
            <MessageSquare className="w-4 h-4 text-[#C5A059]" />
            AI Brand Strategist
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenImageStudio();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-[#5A4B3E] bg-[#F5EFE6] border border-[#E2D7C3]"
          >
            <ImageIcon className="w-4 h-4 text-[#C5A059]" />
            Cover Studio (1K–4K)
          </button>
        </div>
      )}
    </header>
  );
};
