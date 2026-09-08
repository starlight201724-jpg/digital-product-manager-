import React from "react";
import { DigitalProduct } from "../types";
import { PackageCheck, DollarSign, Download, Sparkles } from "lucide-react";

interface MetricCardsProps {
  products: DigitalProduct[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ products }) => {
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active" || p.status === "featured").length;
  const totalCatalogValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const totalDownloads = products.reduce((sum, p) => sum + (p.downloadsCount || 0), 0);

  const metrics = [
    {
      label: "Portfolio Catalog",
      value: `${totalProducts} Offerings`,
      subtext: `${activeProducts} Active in Market`,
      icon: PackageCheck,
    },
    {
      label: "Catalog List Value",
      value: `$${totalCatalogValue.toLocaleString()}`,
      subtext: "Combined asset value",
      icon: DollarSign,
    },
    {
      label: "Gross Product Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtext: "All-time digital sales",
      icon: Sparkles,
    },
    {
      label: "Clients Acquired",
      value: `${totalDownloads.toLocaleString()}`,
      subtext: "Verified product downloads",
      icon: Download,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            id={`metric-card-${index}`}
            className="p-5 sm:p-6 rounded-2xl bg-[#FDFBF7] border border-[#EADBCA] shadow-xs hover:border-[#D4AF37]/50 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8A796B]">
                {item.label}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#FAF5EC] border border-[#EADBCA] flex items-center justify-center text-[#C5A059] group-hover:scale-105 transition-transform">
                <IconComponent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-serif text-3xl font-semibold text-[#2D2622] tracking-tight">
                {item.value}
              </div>
              <p className="text-xs text-[#7A6C5E] mt-1 font-normal tracking-wide">
                {item.subtext}
              </p>
            </div>
            {/* Subtle luxury gold accent bottom line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059]/20 to-transparent group-hover:via-[#C5A059]/60 transition-colors" />
          </div>
        );
      })}
    </section>
  );
};
