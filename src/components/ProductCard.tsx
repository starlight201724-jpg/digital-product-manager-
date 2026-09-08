import React from "react";
import { DigitalProduct } from "../types";
import { Sparkles, Edit3, Share2, Trash2, Download, DollarSign, Tag, Image as ImageIcon } from "lucide-react";

interface ProductCardProps {
  product: DigitalProduct;
  viewMode: "grid" | "list";
  onSelect: (product: DigitalProduct) => void;
  onOpenMarketing: (product: DigitalProduct) => void;
  onOpenCoverStudio: (product: DigitalProduct) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onSelect,
  onOpenMarketing,
  onOpenCoverStudio,
  onDelete,
}) => {
  const isSale = product.salePrice && product.salePrice < product.price;

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    active: { bg: "bg-[#F3F8F2]", text: "text-[#2E6A3B]", border: "border-[#D1E6D6]" },
    featured: { bg: "bg-[#FFF9EC]", text: "text-[#9E7321]", border: "border-[#F1DFB8]" },
    draft: { bg: "bg-[#F7F6F4]", text: "text-[#766A5F]", border: "border-[#E5DFD7]" },
    archived: { bg: "bg-[#F5F2F0]", text: "text-[#8A7970]", border: "border-[#E0D8D4]" },
  };

  const statusStyle = statusColors[product.status] || statusColors.draft;

  if (viewMode === "list") {
    return (
      <div
        id={`product-row-${product.id}`}
        className="group bg-[#FDFBF7] rounded-2xl border border-[#EBE3D3] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#C5A059] transition-all shadow-xs hover:shadow-sm"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#EFEAE1] border border-[#E0D7C6] shrink-0 relative">
            <img
              src={product.coverImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback image if broken URL
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
              }}
            />
            {product.coverImageSize && (
              <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-[#2D2622]/80 text-[#FAF8F5]">
                {product.coverImageSize}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A08855]">
                {product.category}
              </span>
              <span
                className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {product.status}
              </span>
              <span className="text-xs text-[#8A796B] font-light">
                {product.format}
              </span>
            </div>

            <h3
              onClick={() => onSelect(product)}
              className="font-serif text-lg sm:text-xl font-semibold text-[#2D2622] hover:text-[#B38C3E] cursor-pointer transition-colors truncate mt-0.5"
            >
              {product.title}
            </h3>

            <p className="text-xs text-[#6F6052] line-clamp-1 mt-0.5 font-light">
              {product.tagline}
            </p>
          </div>
        </div>

        {/* Pricing & Revenue */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#EFE8DC]">
          <div className="text-left md:text-right">
            <div className="flex items-baseline md:justify-end gap-2">
              {isSale ? (
                <>
                  <span className="font-serif text-xl font-bold text-[#9E7321]">
                    ${product.salePrice}
                  </span>
                  <span className="text-xs line-through text-[#9E8E7F]">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="font-serif text-xl font-bold text-[#2D2622]">
                  ${product.price}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8A796B]">
              {product.downloadsCount} downloads • ${(product.totalRevenue || 0).toLocaleString()} rev
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenMarketing(product)}
              title="Generate Marketing Captions"
              className="p-2 rounded-xl text-[#6E5D4F] hover:text-[#9E7321] hover:bg-[#FAF3E8] border border-[#E5DAC8] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenCoverStudio(product)}
              title="Cover Studio (Gemini 1K-4K)"
              className="p-2 rounded-xl text-[#6E5D4F] hover:text-[#9E7321] hover:bg-[#FAF3E8] border border-[#E5DAC8] transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelect(product)}
              title="Edit Product & AI Description"
              className="p-2 rounded-xl text-[#6E5D4F] hover:text-[#2D2622] hover:bg-[#EFE8DC] border border-[#E5DAC8] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              title="Delete Product"
              className="p-2 rounded-xl text-[#8E5E5E] hover:text-[#B53B3B] hover:bg-[#FDF2F2] border border-[#ECD9D9] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-[#FDFBF7] rounded-2xl border border-[#EBE3D3] overflow-hidden hover:border-[#C5A059] transition-all duration-300 flex flex-col shadow-xs hover:shadow-md"
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-[#EFEAE1] overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.coverImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#201915]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {product.status}
          </span>
          {product.coverImageSize && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2D2622]/80 text-[#FAF8F5] backdrop-blur-md">
              {product.coverImageSize} Visual
            </span>
          )}
        </div>

        {/* Quick edit floating icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-[#FAF8F5]/90 text-[#2D2622] hover:bg-[#C5A059] hover:text-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 duration-200"
          title="Open Studio Editor"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[#A08855]">
              {product.category}
            </span>
            <span className="text-[#8A796B] font-light">
              {product.format}
            </span>
          </div>

          <h3
            onClick={() => onSelect(product)}
            className="font-serif text-xl font-semibold text-[#2D2622] hover:text-[#B38C3E] cursor-pointer transition-colors leading-snug line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="text-xs text-[#6F6052] font-light line-clamp-2 mt-1.5 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Footer & Price */}
        <div className="mt-5 pt-4 border-t border-[#EFE8DC] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              {isSale ? (
                <>
                  <span className="font-serif text-2xl font-bold text-[#9E7321]">
                    ${product.salePrice}
                  </span>
                  <span className="text-xs line-through text-[#9E8E7F]">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="font-serif text-2xl font-bold text-[#2D2622]">
                  ${product.price}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#8A796B] font-light">
              {product.downloadsCount} downloads
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenMarketing(product)}
              title="Marketing Captions"
              className="p-2 rounded-xl text-[#6E5D4F] hover:text-[#9E7321] hover:bg-[#FAF3E8] border border-[#E5DAC8] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenCoverStudio(product)}
              title="High-Res Cover Visual"
              className="p-2 rounded-xl text-[#6E5D4F] hover:text-[#9E7321] hover:bg-[#FAF3E8] border border-[#E5DAC8] transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelect(product)}
              title="Edit details"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2D2622] bg-[#F3ECE0] hover:bg-[#EBE0CE] border border-[#E0D5C3] transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
