import React, { useState } from "react";
import { X, Sparkles, Download, Check, RefreshCw, Wand2, Info } from "lucide-react";
import { DigitalProduct } from "../types";

interface ImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: DigitalProduct | null;
  onApplyImageToProduct?: (imageUrl: string, size: "1K" | "2K" | "4K", prompt: string) => void;
  onNotify: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

export const ImageGeneratorModal: React.FC<ImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
  onApplyImageToProduct,
  onNotify,
}) => {
  const [prompt, setPrompt] = useState(
    targetProduct?.coverImagePrompt ||
      "Minimalist aesthetic digital product mockup on warm ivory linen with golden morning sunlight, delicate olive branch shadows, luxury editorial magazine layout"
  );
  // Image sizes mandated by requirements: 1K, 2K, and 4K
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">(
    targetProduct?.coverImageSize || "2K"
  );
  const [aspectRatio, setAspectRatio] = useState<string>("4:3");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    targetProduct?.coverImage || null
  );
  const [modelUsed, setModelUsed] = useState<string>("");

  if (!isOpen) return null;

  const presets = [
    {
      title: "Ivory Linen & Sunlight Mockup",
      prompt:
        "Minimalist aesthetic digital product mockup on warm ivory linen with golden morning sunlight, delicate olive branch shadows, luxury editorial magazine layout",
      ratio: "4:3",
    },
    {
      title: "Gold Foil Stationery & Travertine",
      prompt:
        "High-end luxury stationery and iPad branding kit mockup on beige travertine stone slab, metallic warm gold foil typography, soft silk textures, Vogue editorial",
      ratio: "1:1",
    },
    {
      title: "Haute iPad & Cashmere Desk",
      prompt:
        "Clean iPad Pro displaying gold and ivory digital planner template, Apple Pencil resting on cream cashmere fabric, aesthetic coffee cup, soft warm lighting",
      ratio: "16:9",
    },
    {
      title: "Golden Hour Editorial Cover",
      prompt:
        "Warm golden hour fashion and editorial photography mockup, sun-drenched velvet neutrals, champagne highlights, timeless 35mm grain, luxury aesthetic",
      ratio: "3:4",
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onNotify("error", "Prompt Required", "Please enter a descriptive image prompt.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setGeneratedImage(data.imageUrl);
      setModelUsed(data.modelUsed || "gemini-3-pro-image-preview");
      onNotify(
        "success",
        "Visual Created",
        `High-resolution ${imageSize} visual generated with ${data.modelUsed || "gemini-3-pro-image-preview"}.`
      );
    } catch (err: any) {
      console.error(err);
      onNotify("error", "Generation Failed", err.message || "Could not generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToProduct = () => {
    if (!generatedImage) return;
    if (onApplyImageToProduct) {
      onApplyImageToProduct(generatedImage, imageSize, prompt);
      onNotify("success", "Cover Updated", "Applied high-res visual to product.");
      onClose();
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `atelier-visual-${imageSize.toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onNotify("info", "Downloading Visual", "Saved to your downloads folder.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231B15]/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-3xl border border-[#EADBCA] shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EADBCA] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF3E5] border border-[#EADBCA] flex items-center justify-center text-[#C5A059]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#2D2622]">
                Cover Studio & Visual Engine
              </h2>
              <p className="text-xs text-[#7A6C5E]">
                High-quality visual generation with Gemini 3 Pro (1K, 2K & 4K)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target product indicator if applicable */}
          {targetProduct && (
            <div className="p-3.5 rounded-xl bg-[#F7F2E8] border border-[#EADFCD] flex items-center justify-between text-xs">
              <span className="text-[#6D5D4E]">
                Customizing cover for:{" "}
                <strong className="text-[#2D2622] font-semibold">
                  {targetProduct.title}
                </strong>
              </span>
              <span className="text-[11px] font-semibold text-[#A08855] uppercase">
                {targetProduct.category}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls Column */}
            <div className="lg:col-span-6 space-y-5">
              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-2">
                  Visual Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="Describe your luxury product aesthetic, materials, light and textures..."
                  className="w-full p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#DFD5C2] text-[#2D2622] text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all resize-none"
                />
              </div>

              {/* Resolution / Image Size (1K, 2K, 4K) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#6E5E50]">
                    Resolution Size
                  </label>
                  <span className="text-[11px] text-[#A08855] font-medium">
                    Powered by gemini-3-pro-image-preview
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["1K", "2K", "4K"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setImageSize(size)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                        imageSize === size
                          ? "bg-[#2D2622] text-[#FAF8F5] border-[#2D2622] shadow-xs"
                          : "bg-[#FDFBF7] text-[#5E5043] border-[#DFD5C2] hover:border-[#C5A059]"
                      }`}
                    >
                      <div className="font-bold">{size}</div>
                      <div className="text-[10px] opacity-75 font-normal">
                        {size === "1K" ? "1024px Standard" : size === "2K" ? "2048px Quad HD" : "3840px Ultra HQ"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "1:1", name: "Square" },
                    { label: "4:3", name: "Standard" },
                    { label: "3:4", name: "Portrait" },
                    { label: "16:9", name: "Wide" },
                    { label: "9:16", name: "Story" },
                  ].map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setAspectRatio(r.label)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-medium transition-all border text-center ${
                        aspectRatio === r.label
                          ? "bg-[#C5A059] text-[#FAF8F5] border-[#C5A059]"
                          : "bg-[#FDFBF7] text-[#5E5043] border-[#DFD5C2] hover:border-[#C5A059]"
                      }`}
                    >
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[9px] opacity-75 truncate">{r.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Luxury Prompt Inspiration Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-2">
                  Aesthetic Presets
                </label>
                <div className="space-y-1.5">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(preset.prompt);
                        setAspectRatio(preset.ratio);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-[#F8F4EC] hover:bg-[#F2EADB] border border-[#E8DFC8] text-xs text-[#524438] transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium group-hover:text-[#2D2622]">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-[#A08855] uppercase">
                        {preset.ratio}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-full text-xs font-semibold tracking-wider uppercase text-[#231B15] bg-gradient-to-r from-[#D8B467] via-[#C5A059] to-[#BF974B] hover:opacity-95 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing {imageSize} Visual...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Visual with Gemini Pro
                  </>
                )}
              </button>
            </div>

            {/* Right Preview Column */}
            <div className="lg:col-span-6 flex flex-col">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E5E50] mb-2">
                Visual Preview
              </label>

              <div className="flex-1 bg-[#F5EFE6] rounded-2xl border border-[#DFD5C2] overflow-hidden flex flex-col items-center justify-center p-4 min-h-[320px] relative group">
                {isGenerating ? (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin mx-auto" />
                    <p className="font-serif text-lg text-[#2D2622]">
                      Rendering {imageSize} Haute Aesthetic...
                    </p>
                    <p className="text-xs text-[#7A6C5E] max-w-xs">
                      Calibrating light diffusion, gold foil specular reflections, and soft linen textures.
                    </p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={generatedImage}
                      alt="Generated visual preview"
                      className="max-h-[380px] w-auto max-w-full object-contain rounded-xl shadow-md"
                      referrerPolicy="no-referrer"
                    />

                    {/* Overlay badge with model & resolution */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D2622]/85 text-[#FAF8F5] backdrop-blur-md">
                        {imageSize} Resolution
                      </span>
                      {modelUsed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/90 text-white backdrop-blur-md">
                          {modelUsed}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2 text-[#8A796B]">
                    <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto opacity-60" />
                    <p className="font-serif text-base text-[#524538]">
                      No Visual Generated Yet
                    </p>
                    <p className="text-xs max-w-xs">
                      Select your desired resolution (1K, 2K, or 4K), choose an aesthetic preset, and click Generate.
                    </p>
                  </div>
                )}
              </div>

                {/* Bottom Actions for Generated Image */}
              {generatedImage && !isGenerating && (
                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#5A4B3E] bg-[#FDFBF7] hover:bg-[#EFE5D6] border border-[#DFD5C2] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                    Download Visual ({imageSize})
                  </button>

                  {targetProduct && onApplyImageToProduct && (
                    <button
                      onClick={handleApplyToProduct}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#231B15] bg-[#C5A059] hover:bg-[#B38C3E] text-white transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Set as Product Cover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
