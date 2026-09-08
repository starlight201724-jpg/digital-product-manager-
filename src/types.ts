export type ProductCategory =
  | "All"
  | "Canva & Design Systems"
  | "Notion Operating Systems"
  | "E-Books & Editorial Guides"
  | "Lightroom Presets & LUTs"
  | "Masterclasses & Audio"
  | "Luxury Planners & Printables"
  | "Brand Identity Kits";

export type ProductStatus = "active" | "draft" | "featured" | "archived";

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ProductDescriptionData {
  tagline: string;
  shortSummary: string;
  detailedDescription: string;
  keyDeliverables: string[];
  idealFor: string[];
  faq: ProductFaq[];
}

export interface MarketingCaptionsData {
  instagram?: {
    hook: string;
    body: string;
    callToAction: string;
    hashtags: string[];
  };
  tiktokReels?: {
    hook: string;
    videoConcept: string;
    caption: string;
  };
  pinterest?: {
    pinTitle: string;
    pinDescription: string;
    keywords: string[];
  };
  emailNewsletter?: {
    subjectLine: string;
    previewText: string;
    body: string;
  };
  threadsX?: {
    posts: string[];
  };
}

export interface DigitalProduct {
  id: string;
  title: string;
  tagline: string;
  category: ProductCategory;
  format: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  coverImage: string;
  coverImagePrompt?: string;
  coverImageSize?: "1K" | "2K" | "4K";
  status: ProductStatus;
  downloadsCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  targetAudience?: string;
  keySellingPoints?: string;
  description: ProductDescriptionData;
  marketingCaptions?: MarketingCaptionsData;
}

export type ChatTaskType = "complex" | "general" | "fast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
  taskType?: ChatTaskType;
}
