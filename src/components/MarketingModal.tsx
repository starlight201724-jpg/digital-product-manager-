import React, { useState } from "react";
import { X, Sparkles, Copy, RefreshCw, Share2, Check, ExternalLink } from "lucide-react";
import { DigitalProduct, MarketingCaptionsData } from "../types";

interface MarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DigitalProduct | null;
  onSaveMarketingCaptions: (productId: string, captions: MarketingCaptionsData) => void;
  onNotify: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

export const MarketingModal: React.FC<MarketingModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveMarketingCaptions,
  onNotify,
}) => {
  const [activeChannel, setActiveChannel] = useState<
    "instagram" | "tiktokReels" | "pinterest" | "emailNewsletter" | "threadsX"
  >("instagram");

  const [isGenerating, setIsGenerating] = useState(false);
  const [captions, setCaptions] = useState<MarketingCaptionsData>(
    product?.marketingCaptions || {}
  );

  if (!isOpen || !product) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-marketing-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          category: product.category,
          price: product.salePrice || product.price,
          tagline: product.tagline,
          shortSummary: product.description?.shortSummary || "",
          campaignGoal: "Boutique Digital Product Drop",
          callToAction: "Tap link in bio to secure your instant download",
          aestheticTone: "Feminine Luxury, Ivory & Champagne Editorial Nuance",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate marketing captions.");
      }

      setCaptions(data);
      onSaveMarketingCaptions(product.id, data);
      onNotify(
        "success",
        "Marketing Kit Ready",
        "Gemini generated tailored captions across 5 channels."
      );
    } catch (err: any) {
      console.error(err);
      onNotify("error", "Generation Failed", err.message || "Could not generate captions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onNotify("info", "Copied", `${label} copied to clipboard.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#231B15]/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-3xl border border-[#EADBCA] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EADBCA] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF3E5] border border-[#EADBCA] flex items-center justify-center text-[#C5A059]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-semibold text-[#2D2622]">
                  Marketing Kit • {product.title}
                </h2>
              </div>
              <p className="text-xs text-[#7A6C5E]">
                Gemini-generated multi-channel social & email launch copy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#8A796B] hover:text-[#2D2622] hover:bg-[#EFEAE1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 bg-[#F6EFE5] border-b border-[#EADBCA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {[
              { id: "instagram", label: "Instagram" },
              { id: "tiktokReels", label: "TikTok & Reels" },
              { id: "pinterest", label: "Pinterest SEO" },
              { id: "emailNewsletter", label: "Email / Substack" },
              { id: "threadsX", label: "Threads & X" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChannel(c.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeChannel === c.id
                    ? "bg-[#2D2622] text-[#FAF8F5] border-[#2D2622]"
                    : "bg-[#FDFBF7] text-[#6E5E50] border-[#DFD5C2] hover:border-[#C5A059]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#231B15] bg-gradient-to-r from-[#D8B467] to-[#C5A059] hover:opacity-95 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Crafting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Regenerate Kit
              </>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeChannel === "instagram" && (
            <div className="space-y-4">
              {captions.instagram ? (
                <>
                  <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#EADBCA]">
                    <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                      Opening Hook
                    </span>
                    <p className="text-sm font-semibold text-[#2D2622]">
                      {captions.instagram.hook}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#6E5E50]">Caption Body</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${captions.instagram?.hook}\n\n${captions.instagram?.body}\n\n${captions.instagram?.callToAction}\n\n${captions.instagram?.hashtags?.join(" ")}`,
                            "Instagram Post"
                          )
                        }
                        className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Complete Post
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBCA] text-xs text-[#3D332A] whitespace-pre-wrap leading-relaxed">
                      {captions.instagram.body}
                    </div>
                  </div>

                  <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#EADBCA]">
                    <span className="text-[10px] uppercase font-bold text-[#6E5E50] block mb-1">
                      Call To Action
                    </span>
                    <p className="text-xs text-[#2D2622] font-medium">
                      {captions.instagram.callToAction}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(captions.instagram.hashtags || []).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EFE8DC] text-[#6E5E50]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 space-y-3 text-[#7A6C5E]">
                  <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
                  <p className="font-serif text-lg text-[#2D2622]">
                    No Captions Generated Yet
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Click "Regenerate Kit" above to have Gemini craft an aesthetic Instagram launch caption with curated hashtags.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeChannel === "tiktokReels" && (
            <div className="space-y-4">
              {captions.tiktokReels ? (
                <>
                  <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#EADBCA]">
                    <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                      Visual Hook (0–3 Seconds)
                    </span>
                    <p className="text-sm font-semibold text-[#2D2622]">
                      "{captions.tiktokReels.hook}"
                    </p>
                  </div>

                  <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EADBCA]">
                    <span className="text-[10px] uppercase font-bold text-[#6E5E50] block mb-1">
                      Aesthetic Video Production Concept
                    </span>
                    <p className="text-xs text-[#3D332A] leading-relaxed">
                      {captions.tiktokReels.videoConcept}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#6E5E50]">Caption & Audio Sound</span>
                      <button
                        onClick={() => copyToClipboard(captions.tiktokReels?.caption || "", "TikTok Caption")}
                        className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#EADBCA] text-xs text-[#3D332A]">
                      {captions.tiktokReels.caption}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-xs text-[#7A6C5E]">
                  Click "Regenerate Kit" to create TikTok hook concepts and sound suggestions.
                </div>
              )}
            </div>
          )}

          {activeChannel === "pinterest" && (
            <div className="space-y-4">
              {captions.pinterest ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#6E5E50]">High-SEO Pin Title</span>
                      <button
                        onClick={() => copyToClipboard(captions.pinterest?.pinTitle || "", "Pin Title")}
                        className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[#2D2622] p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCA]">
                      {captions.pinterest.pinTitle}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#6E5E50]">Pin Description</span>
                      <button
                        onClick={() => copyToClipboard(captions.pinterest?.pinDescription || "", "Pin Description")}
                        className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <p className="text-xs text-[#3D332A] p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] leading-relaxed">
                      {captions.pinterest.pinDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(captions.pinterest.keywords || []).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EFE8DC] text-[#6E5E50]"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-xs text-[#7A6C5E]">
                  Click "Regenerate Kit" to craft Pinterest keywords and descriptions.
                </div>
              )}
            </div>
          )}

          {activeChannel === "emailNewsletter" && (
            <div className="space-y-4">
              {captions.emailNewsletter ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EADBCA]">
                      <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                        Subject Line
                      </span>
                      <p className="text-xs font-semibold text-[#2D2622]">
                        {captions.emailNewsletter.subjectLine}
                      </p>
                    </div>
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EADBCA]">
                      <span className="text-[10px] uppercase font-bold text-[#A08855] block mb-1">
                        Preview Text
                      </span>
                      <p className="text-xs text-[#6E5E50]">
                        {captions.emailNewsletter.previewText}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#6E5E50]">Broadcast Letter</span>
                      <button
                        onClick={() => copyToClipboard(captions.emailNewsletter?.body || "", "Email Newsletter")}
                        className="text-xs text-[#A08855] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy Email
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCA] text-xs text-[#3D332A] whitespace-pre-wrap leading-relaxed font-sans">
                      {captions.emailNewsletter.body}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-xs text-[#7A6C5E]">
                  Click "Regenerate Kit" to write subscriber launch letters.
                </div>
              )}
            </div>
          )}

          {activeChannel === "threadsX" && (
            <div className="space-y-3">
              {captions.threadsX ? (
                (captions.threadsX.posts || []).map((post, i) => (
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
                ))
              ) : (
                <div className="text-center py-10 text-xs text-[#7A6C5E]">
                  Click "Regenerate Kit" to generate a connected X/Threads post series.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EADBCA] bg-[#FDFBF7] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#2D2622] bg-[#EFEAE1] hover:bg-[#E5DAC8] transition-colors"
          >
            Close Marketing Studio
          </button>
        </div>
      </div>
    </div>
  );
};
