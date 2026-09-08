import React, { useState } from "react";
import {
  X,
  Sparkles,
  Save,
  Check,
  Share2,
  Copy,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  Tag,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { DigitalProduct, ProductCategory, ProductStatus } from "../types";

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DigitalProduct | null; // null means creating new product
  onSave: (product: DigitalProduct) => void;
  onOpenImageStudioForProduct: (product: DigitalProduct) => void;
  onNotify: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

const CATEGORIES: ProductCategory[] = [
  "Canva & Design Systems",
  "Notion Operating Systems",
  "E-Books & Editorial Guides",
  "Lightroom Presets & LUTs",
  "Masterclasses & Audio",
  "Luxury Planners & Printables",
  "Brand Identity Kits",
];

const FORMAT_OPTIONS = [
  "Notion Template Bundle (.link)",
  "Canva Pro & Figma (.fig)",
  "Interactive PDF & Notion Doc",
  "DNG & XMP Files (.zip)",
  "Audio Masterclass + PDF Workbook",
  "GoodNotes & Notability PDF",
  "ZIP Archive (All Formats)",
];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  onOpenImageStudioForProduct,
  onNotify,
}) => {
  const isEditing = Boolean(product);

  const [activeTab, setActiveTab] = useState<
    "core" | "descriptions" | "marketing" | "cover" | "preview"
  >("core");

  // Core Form State
  const [title, setTitle] = useState(product?.title || "");
  const [tagline, setTagline] = useState(product?.tagline || "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category || "Canva & Design Systems"
  );
  const [format, setFormat] = useState(product?.format || FORMAT_OPTIONS[0]);
  const [price, setPrice] = useState<number>(product?.price || 49);
  const [salePrice, setSalePrice] = useState<number | null>(
    product?.salePrice ?? null
  );
  const [status, setStatus] = useState<ProductStatus>(product?.status || "active");
  const [coverImage, setCoverImage] = useState(
    product?.coverImage ||
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80"
  );
  const [coverImageSize, setCoverImageSize] = useState<"1K" | "2K" | "4K">(
    product?.coverImageSize || "2K"
  );
  const [targetAudience, setTargetAudience] = useState(
    product?.targetAudience || ""
  );
  const [keySellingPoints, setKeySellingPoints] = useState(
    product?.keySellingPoints || ""
  );

  // Description State
  const [description, setDescription] = useState(
    product?.description || {
      tagline: "",
      shortSummary: "",
      detailedDescription: "",
      keyDeliverables: [],
      idealFor: [],
      faq: [],
    }
  );

  // Marketing Captions State
  const [marketingCaptions, setMarketingCaptions] = useState(
    product?.marketingCaptions || {}
  );

  // AI Generation Loading States
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [descTone, setDescTone] = useState("Feminine Luxury & Editorial");

  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [marketingChannel, setMarketingChannel] = useState<
    "instagram" | "tiktokReels" | "pinterest" | "emailNewsletter" | "threadsX"
  >("instagram");

  // Cover image generator state in tab
  const [coverPrompt, setCoverPrompt] = useState(
    product?.coverImagePrompt ||
      "Minimalist aesthetic digital product mockup on ivory linen with soft golden sunlight, delicate olive branch shadows, luxury editorial magazine layout"
  );
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  if (!isOpen) return null;

  // AI Description Generator Handler
  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      onNotify("error", "Title Required", "Please enter a product title first.");
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          format,
          price,
          targetAudience,
          keySellingPoints,
          tone: descTone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate description.");
      }

      setDescription({
        tagline: data.tagline || tagline,
        shortSummary: data.shortSummary || "",
        detailedDescription: data.detailedDescription || "",
        keyDeliverables: data.keyDeliverables || [],
        idealFor: data.idealFor || [],
        faq: data.faq || [],
      });

      if (data.tagline && !tagline) {
        setTagline(data.tagline);
      }

      onNotify(
        "success",
        "Description Generated",
        "Gemini drafted luxury editorial sales copy."
      );
    } catch (err: any) {
      console.error(err);
      onNotify("error", "Generation Failed", err.message || "Could not generate copy.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // AI Marketing Captions Generator Handler
  const handleGenerateMarketingCaptions = async () => {
    if (!title.trim()) {
      onNotify("error", "Title Required", "Please enter a product title first.");
      return;
    }

    setIsGeneratingMarketing(true);
    try {
      const response = await fetch("/api/generate-marketing-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          price,
          tagline,
          shortSummary: description.shortSummary,
          campaignGoal: "Boutique Launch & Limited Release",
          callToAction: "Tap link in bio to secure immediate access",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate captions.");
      }

      setMarketingCaptions(data);
      onNotify(
        "success",
        "Captions Formatted",
        "Multi-channel launch captions prepared by Gemini."
      );
    } catch (err: any) {
      console.error(err);
      onNotify("error", "Captions Failed", err.message || "Could not generate captions.");
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  // Generate Cover Visual from tab
  const handleGenerateCoverVisual = async () => {
    setIsGeneratingCover(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: coverPrompt,
          imageSize: coverImageSize,
          aspectRatio: "4:3",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate visual.");
      }

      setCoverImage(data.imageUrl);
      onNotify(
        "success",
        "Cover Generated",
        `High-resolution ${coverImageSize} image generated with ${data.modelUsed || "gemini-3-pro-image-preview"}.`
      );
    } catch (err: any) {
      console.error(err);
      onNotify("error", "Cover Visual Failed", err.message || "Failed to generate cover.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Save Product
  const handleSaveProduct = () => {
    if (!title.trim()) {
      onNotify("error", "Title Required", "Please give your product a title.");
      return;
    }

    const savedProduct: DigitalProduct = {
      id: product?.id || `prod-${Date.now()}`,
      title,
      tagline: tagline || description.tagline || "Luxury digital asset",
      category,
      format,
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : null,
      currency: "$",
      coverImage,
      coverImagePrompt: coverPrompt,
      coverImageSize,
      status,
      downloadsCount: product?.downloadsCount || 0,
      totalRevenue: product?.totalRevenue || 0,
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetAudience,
      keySellingPoints,
      description,
      marketingCaptions,
    };

    onSave(savedProduct);
    onNotify(
      "success",
      isEditing ? "Product Saved" : "Product Created",
      `"${title}" updated in your luxury catalog.`
    );
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onNotify("info", "Copied", `${label} copied to clipboard.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#231B15]/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-5xl rounded-3xl border border-[#EADBCA] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#EADBCA] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E5] border border-[#EADBCA] flex items-center justify-center text-[#C5A059]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-semibold text-[#2D2622]">
                  {isEditing ? "Edit Digital Product" : "Create New Offering"}
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[#7A6B5D] border border-[#E2D8C7]">
                  {category}
                </span>
              </div>
              <p className="text-xs text-[#7A6C5E]">
                Atelier Product Studio with Gemini AI Copy & Cover Generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] via-[#C5A059] to-[#BF974B] hover:opacity-95 transition-all shadow-sm active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              Save Offering
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#8A796B] hover:text-[#2D2622] hover:bg-[#EFEAE1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-[#F6EFE5] border-b border-[#EADBCA] flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: "core", label: "Product Essentials", icon: Tag },
            { id: "descriptions", label: "Gemini Description", icon: Wand2 },
            { id: "marketing", label: "Marketing Captions", icon: Share2 },
            { id: "cover", label: "Cover Studio (1K–4K)", icon: ImageIcon },
            { id: "preview", label: "Storefront Preview", icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold tracking-wide uppercase flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#C5A059] text-[#2D2622] font-bold"
                    : "border-transparent text-[#766759] hover:text-[#2D2622]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C5A059]" : "text-[#9E8E7D]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Content Panels */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CORE PRODUCT ESSENTIALS */}
          {activeTab === "core" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Title & Tagline */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                      Product Name / Offering Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The Atelier Life & Business OS"
                      className="w-full px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-[#2D2622] font-serif text-lg focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                      Tagline / Hook
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. An architected aesthetic second brain for visionary female founders."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-[#2D2622] text-sm focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProductCategory)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                        Deliverable Format
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                      >
                        {FORMAT_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                        Regular Price ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-[#8C7652]">$</span>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] font-semibold focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                        Sale Price ($ optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-[#8C7652]">$</span>
                        <input
                          type="number"
                          value={salePrice ?? ""}
                          onChange={(e) =>
                            setSalePrice(e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="None"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                        Release Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProductStatus)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="active">Active (Available)</option>
                        <option value="featured">Featured (Top of Catalog)</option>
                        <option value="draft">Draft (Work in Progress)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cover Preview Card */}
                <div className="md:col-span-4 flex flex-col">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                    Cover Presentation
                  </label>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFEAE1] border border-[#DFD5C2] group shadow-xs">
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <button
                        onClick={() => setActiveTab("cover")}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] text-[#2D2622] hover:bg-[#C5A059] hover:text-white transition-colors"
                      >
                        Customize Visual (1K–4K)
                      </button>
                    </div>
                    {coverImageSize && (
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-[#2D2622]/80 text-[#FAF8F5]">
                        {coverImageSize} Visual
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A6C5E] mt-2 font-light">
                    Use Gemini 3 Pro to generate high-resolution editorial mockups in the Cover Studio.
                  </p>
                </div>
              </div>

              {/* Audience & Value Proposition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EBE4D5]">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                    Target Discerning Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Creative directors, female founders, luxury consultants"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                    Key Selling Points & Highlights
                  </label>
                  <input
                    type="text"
                    value={keySellingPoints}
                    onChange={(e) => setKeySellingPoints(e.target.value)}
                    placeholder="e.g. 100% customizable, Notion verified, includes gold foil assets"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI PRODUCT DESCRIPTIONS */}
          {activeTab === "descriptions" && (
            <div className="space-y-6">
              {/* Generator control bar */}
              <div className="p-4 rounded-2xl bg-[#F5EFE6] border border-[#DFD5C2] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FAF3E5] border border-[#EADBCA] flex items-center justify-center text-[#C5A059]">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2D2622]">
                      Gemini Luxury Copywriter
                    </h4>
                    <p className="text-xs text-[#7A6C5E]">
                      Generates complete elevator pitch, narrative, deliverables & FAQ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={descTone}
                    onChange={(e) => setDescTone(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-[#FDFBF7] border border-[#DFD5C2] text-[#3D332A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Feminine Luxury & Editorial">Feminine Luxury & Editorial</option>
                    <option value="Modern Chic & Persuasive">Modern Chic & Persuasive</option>
                    <option value="Quiet Luxury & High Ticket">Quiet Luxury & High Ticket</option>
                    <option value="Minimalist & Polished">Minimalist & Polished</option>
                  </select>

                  <button
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDesc}
                    className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-[#231B15] bg-gradient-to-r from-[#D8B467] to-[#C5A059] hover:opacity-95 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingDesc ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Writing Copy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate with Gemini
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editable output fields */}
              <div className="space-y-4">
                {/* Short Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6E5E50]">
                      Alluring Elevator Pitch
                    </label>
                    <button
                      onClick={() => copyToClipboard(description.shortSummary, "Summary")}
                      className="text-[11px] text-[#A08855] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={description.shortSummary}
                    onChange={(e) =>
                      setDescription({ ...description, shortSummary: e.target.value })
                    }
                    placeholder="Click 'Generate with Gemini' to craft an evocative summary..."
                    className="w-full p-3.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] leading-relaxed focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6E5E50]">
                      Full Luxury Sales Narrative
                    </label>
                    <button
                      onClick={() =>
                        copyToClipboard(description.detailedDescription, "Detailed description")
                      }
                      className="text-[11px] text-[#A08855] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={description.detailedDescription}
                    onChange={(e) =>
                      setDescription({ ...description, detailedDescription: e.target.value })
                    }
                    placeholder="Full sales letter narrative capturing transformation, lifestyle, and aesthetic authority..."
                    className="w-full p-3.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-sm text-[#2D2622] leading-relaxed focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Key Deliverables */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6E5E50]">
                      Tangible Deliverables (What's Included)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setDescription({
                          ...description,
                          keyDeliverables: [...(description.keyDeliverables || []), "New Deliverable Item"],
                        })
                      }
                      className="text-[11px] text-[#A08855] hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(description.keyDeliverables || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#FAF3E5] border border-[#EADBCA] flex items-center justify-center text-[10px] text-[#A08855] shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...description.keyDeliverables];
                            updated[idx] = e.target.value;
                            setDescription({ ...description, keyDeliverables: updated });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-xs text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = description.keyDeliverables.filter((_, i) => i !== idx);
                            setDescription({ ...description, keyDeliverables: updated });
                          }}
                          className="p-1.5 text-[#9E8E7D] hover:text-[#B53B3B]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARKETING CAPTIONS */}
          {activeTab === "marketing" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#F5EFE6] border border-[#DFD5C2] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#2D2622]">
                    Multi-Channel Marketing Engine
                  </h4>
                  <p className="text-xs text-[#7A6C5E]">
                    Formatted launch copy tailored for Instagram, TikTok, Pinterest, Substack & X
                  </p>
                </div>

                <button
                  onClick={handleGenerateMarketingCaptions}
                  disabled={isGeneratingMarketing}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-[#231B15] bg-gradient-to-r from-[#D8B467] to-[#C5A059] hover:opacity-95 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingMarketing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Crafting Captions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Multi-Channel Kit
                    </>
                  )}
                </button>
              </div>

              {/* Channel Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: "instagram", label: "Instagram" },
                  { id: "tiktokReels", label: "TikTok & Reels" },
                  { id: "pinterest", label: "Pinterest SEO" },
                  { id: "emailNewsletter", label: "Email / Substack" },
                  { id: "threadsX", label: "Threads & X" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setMarketingChannel(c.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      marketingChannel === c.id
                        ? "bg-[#2D2622] text-[#FAF8F5] border-[#2D2622]"
                        : "bg-[#FDFBF7] text-[#6E5E50] border-[#DFD5C2] hover:border-[#C5A059]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Active Channel Display */}
              <div className="bg-[#FDFBF7] rounded-2xl border border-[#DFD5C2] p-5 space-y-4">
                {marketingChannel === "instagram" && (
                  <div>
                    {marketingCaptions.instagram ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA]">
                          <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                            Opening Hook
                          </span>
                          <p className="text-sm font-semibold text-[#2D2622]">
                            {marketingCaptions.instagram.hook}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#6E5E50]">Caption Body</span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${marketingCaptions.instagram?.hook}\n\n${marketingCaptions.instagram?.body}\n\n${marketingCaptions.instagram?.callToAction}\n\n${marketingCaptions.instagram?.hashtags?.join(" ")}`,
                                  "Instagram Caption"
                                )
                              }
                              className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy Full Post
                            </button>
                          </div>
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] text-xs text-[#3D332A] whitespace-pre-wrap leading-relaxed font-sans">
                            {marketingCaptions.instagram.body}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(marketingCaptions.instagram.hashtags || []).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFE8DC] text-[#7A6C5E]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A796B] py-6 text-center">
                        Click "Generate Multi-Channel Kit" above to craft an Instagram release caption.
                      </p>
                    )}
                  </div>
                )}

                {marketingChannel === "tiktokReels" && (
                  <div>
                    {marketingCaptions.tiktokReels ? (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#EADBCA]">
                          <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                            3-Second Video Hook
                          </span>
                          <p className="text-sm font-semibold text-[#2D2622]">
                            "{marketingCaptions.tiktokReels.hook}"
                          </p>
                        </div>
                        <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EADBCA]">
                          <span className="text-[10px] uppercase font-bold text-[#6E5E50] block mb-1">
                            Aesthetic Video Concept
                          </span>
                          <p className="text-xs text-[#3D332A] leading-relaxed">
                            {marketingCaptions.tiktokReels.videoConcept}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#6E5E50] block mb-1">
                            Short Punchy Caption
                          </span>
                          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] text-xs text-[#3D332A]">
                            {marketingCaptions.tiktokReels.caption}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A796B] py-6 text-center">
                        Generate captions to view TikTok hooks and video shot concepts.
                      </p>
                    )}
                  </div>
                )}

                {marketingChannel === "pinterest" && (
                  <div>
                    {marketingCaptions.pinterest ? (
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-semibold text-[#6E5E50] block mb-1">
                            High-Ranking Pin Title
                          </span>
                          <p className="text-sm font-semibold text-[#2D2622] p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCA]">
                            {marketingCaptions.pinterest.pinTitle}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#6E5E50] block mb-1">
                            SEO Pin Description
                          </span>
                          <p className="text-xs text-[#3D332A] p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] leading-relaxed">
                            {marketingCaptions.pinterest.pinDescription}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(marketingCaptions.pinterest.keywords || []).map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EFE8DC] text-[#6E5E50]"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A796B] py-6 text-center">
                        Generate captions to obtain SEO-rich Pinterest titles and descriptions.
                      </p>
                    )}
                  </div>
                )}

                {marketingChannel === "emailNewsletter" && (
                  <div>
                    {marketingCaptions.emailNewsletter ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EADBCA]">
                            <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                              Subject Line
                            </span>
                            <p className="text-xs font-semibold text-[#2D2622]">
                              {marketingCaptions.emailNewsletter.subjectLine}
                            </p>
                          </div>
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EADBCA]">
                            <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                              Preview Text
                            </span>
                            <p className="text-xs text-[#6E5E50]">
                              {marketingCaptions.emailNewsletter.previewText}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#6E5E50]">
                              Subscriber Letter
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  marketingCaptions.emailNewsletter?.body || "",
                                  "Email Newsletter"
                                )
                              }
                              className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy Email
                            </button>
                          </div>
                          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] text-xs text-[#3D332A] whitespace-pre-wrap leading-relaxed font-sans">
                            {marketingCaptions.emailNewsletter.body}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A796B] py-6 text-center">
                        Generate captions to preview high-converting launch newsletter copy.
                      </p>
                    )}
                  </div>
                )}

                {marketingChannel === "threadsX" && (
                  <div>
                    {marketingCaptions.threadsX ? (
                      <div className="space-y-3">
                        {(marketingCaptions.threadsX.posts || []).map((post, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] text-xs text-[#3D332A] leading-relaxed flex items-start gap-3"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#EFE8DC] flex items-center justify-center font-bold text-[10px] text-[#6E5E50] shrink-0">
                              {i + 1}
                            </span>
                            <p className="flex-1 whitespace-pre-wrap">{post}</p>
                            <button
                              onClick={() => copyToClipboard(post, `Post ${i + 1}`)}
                              className="text-[#9E8E7D] hover:text-[#A08855]"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8A796B] py-6 text-center">
                        Generate captions to see multi-post release threads.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COVER STUDIO (1K-4K GEMINI) */}
          {activeTab === "cover" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                      Visual Prompt (Gemini 3 Pro)
                    </label>
                    <textarea
                      rows={4}
                      value={coverPrompt}
                      onChange={(e) => setCoverPrompt(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-xs text-[#2D2622] leading-relaxed focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {/* Resolution Size (1K, 2K, 4K mandated) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-2">
                      Resolution Size
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["1K", "2K", "4K"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setCoverImageSize(size)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                            coverImageSize === size
                              ? "bg-[#2D2622] text-[#FAF8F5] border-[#2D2622]"
                              : "bg-[#FDFBF7] text-[#5E5043] border-[#DFD5C2] hover:border-[#C5A059]"
                          }`}
                        >
                          <div className="font-bold">{size}</div>
                          <div className="text-[9px] opacity-75 font-normal">
                            {size === "1K" ? "1024px Standard" : size === "2K" ? "2048px Quad HD" : "3840px Ultra HQ"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCoverVisual}
                    disabled={isGeneratingCover}
                    className="w-full py-3 px-6 rounded-full text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] via-[#C5A059] to-[#BF974B] hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingCover ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating {coverImageSize} Visual...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Synthesize Cover with Gemini ({coverImageSize})
                      </>
                    )}
                  </button>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                      Or Direct Image URL
                    </label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD5C2] text-xs text-[#2D2622] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-1.5">
                    Visual Preview
                  </label>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFEAE1] border border-[#DFD5C2] flex items-center justify-center relative shadow-xs">
                    {isGeneratingCover ? (
                      <div className="text-center p-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin mx-auto mb-2" />
                        <p className="text-xs text-[#6E5E50]">
                          Rendering {coverImageSize} visual...
                        </p>
                      </div>
                    ) : (
                      <img
                        src={coverImage}
                        alt="Product cover preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STOREFRONT PREVIEW & EXPORT */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              {/* Luxury Customer Preview Banner */}
              <div className="p-6 rounded-3xl bg-[#FDFBF7] border border-[#EADBCA] shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFEAE1] border border-[#DFD5C2] shadow-xs">
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="md:col-span-7 space-y-3">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#A08855]">
                      {category} • {format}
                    </span>
                    <h1 className="font-serif text-3xl font-semibold text-[#2D2622] leading-tight">
                      {title || "Untitled Digital Offering"}
                    </h1>
                    <p className="text-sm text-[#6E5E50] leading-relaxed font-light">
                      {tagline || description.tagline || description.shortSummary}
                    </p>

                    <div className="flex items-baseline gap-3 pt-2">
                      {salePrice && salePrice < price ? (
                        <>
                          <span className="font-serif text-3xl font-bold text-[#9E7321]">
                            ${salePrice}
                          </span>
                          <span className="text-sm line-through text-[#9E8E7F]">
                            ${price}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF3E5] text-[#9E7321] border border-[#F1DFB8]">
                            Save ${(price - salePrice).toFixed(0)}
                          </span>
                        </>
                      ) : (
                        <span className="font-serif text-3xl font-bold text-[#2D2622]">
                          ${price}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="w-full sm:w-auto px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-[#231B15] bg-gradient-to-r from-[#D8B467] to-[#C5A059] shadow-sm cursor-default"
                    >
                      Instant Digital Download
                    </button>
                  </div>
                </div>

                {/* Narrative & Deliverables */}
                {description.detailedDescription && (
                  <div className="pt-6 border-t border-[#EADBCA] space-y-3">
                    <h4 className="font-serif text-xl font-semibold text-[#2D2622]">
                      The Offering
                    </h4>
                    <p className="text-xs text-[#4F4237] whitespace-pre-wrap leading-relaxed">
                      {description.detailedDescription}
                    </p>
                  </div>
                )}

                {description.keyDeliverables?.length > 0 && (
                  <div className="pt-6 border-t border-[#EADBCA] space-y-3">
                    <h4 className="font-serif text-xl font-semibold text-[#2D2622]">
                      What Is Included
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4F4237]">
                      {description.keyDeliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Copy Markdown sales page */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const markdownText = `# ${title}\n\n*${tagline}*\n\n**Price:** $${
                      salePrice || price
                    }\n\n## Overview\n${description.detailedDescription}\n\n## Deliverables\n${description.keyDeliverables
                      ?.map((d) => `- ${d}`)
                      .join("\n")}\n\n## FAQ\n${description.faq
                      ?.map((f) => `**Q: ${f.question}**\n${f.answer}`)
                      .join("\n\n")}`;
                    copyToClipboard(markdownText, "Markdown Sales Page");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A4B3E] bg-[#FDFBF7] border border-[#DFD5C2] hover:bg-[#FAF3E8] transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-[#C5A059]" />
                  Copy Markdown for Gumroad / Stan Store / Shopify
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 border-t border-[#EADBCA] bg-[#FDFBF7] flex items-center justify-between">
          <div className="text-xs text-[#8A796B]">
            Status: <span className="font-semibold capitalize text-[#2D2622]">{status}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E5E50] hover:bg-[#EFEAE1] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] via-[#C5A059] to-[#BF974B] hover:opacity-95 transition-all shadow-sm active:scale-98 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {isEditing ? "Update Offering" : "Publish Offering"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
