import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Endpoint: Generate Product Descriptions with Gemini
app.post("/api/generate-description", async (req, res) => {
  try {
    const {
      title,
      category,
      format,
      price,
      targetAudience,
      keySellingPoints,
      tone = "Feminine Luxury & Editorial",
      formatStyle = "Comprehensive Luxury Package",
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Product title is required." });
    }

    const ai = getAi();
    const prompt = `You are a high-end luxury digital product copywriter and branding director. Write a compelling, irresistible product description for a premium digital product.

Product Details:
- Title: ${title}
- Category: ${category || "Digital Product"}
- Format: ${format || "Digital Download"}
- Price: $${price || "49"}
- Target Audience: ${targetAudience || "Ambitious creators, affluent entrepreneurs, and luxury seekers"}
- Key Features / Selling Points: ${keySellingPoints || "Modern aesthetic, meticulously crafted, instant delivery, high value"}
- Tone: ${tone}
- Format Style: ${formatStyle}

Deliver your response strictly in JSON format matching this schema:
{
  "tagline": "A chic, memorable 1-sentence hook",
  "shortSummary": "A 2-3 sentence alluring elevator pitch",
  "detailedDescription": "A complete, evocative, high-converting product narrative (2-3 paragraphs) capturing the aesthetic, effortless lifestyle, and transformation",
  "keyDeliverables": [
    "5 to 7 detailed bullet points describing tangible components, modules, templates, or assets included"
  ],
  "idealFor": [
    "3 to 4 bullet points describing who will benefit most"
  ],
  "faq": [
    {
      "question": "Realistic client question",
      "answer": "Polite, elegant, reassuring answer"
    },
    {
      "question": "Realistic client question",
      "answer": "Polite, elegant, reassuring answer"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tagline: { type: Type.STRING },
            shortSummary: { type: Type.STRING },
            detailedDescription: { type: Type.STRING },
            keyDeliverables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            idealFor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: [
            "tagline",
            "shortSummary",
            "detailedDescription",
            "keyDeliverables",
            "idealFor",
            "faq",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error generating product description:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate product description",
    });
  }
});

// Endpoint: Generate Marketing Captions across channels
app.post("/api/generate-marketing-captions", async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      tagline,
      shortSummary,
      campaignGoal = "Product Launch",
      callToAction = "Click link in bio to shop the limited release",
      aestheticTone = "Warm Ivory, Chic, Sophisticated & Inspiring",
    } = req.body;

    const ai = getAi();
    const prompt = `You are a premier social media director for aesthetic digital brands. Craft tailored marketing captions for the launch of this digital product across 5 major channels.

Product Information:
- Name: ${title}
- Category: ${category}
- Price: $${price}
- Tagline: ${tagline || ""}
- Summary: ${shortSummary || ""}
- Campaign Goal: ${campaignGoal}
- Desired Call-To-Action: ${callToAction}
- Aesthetic & Tone: ${aestheticTone}

Provide output strictly in JSON format matching this schema:
{
  "instagram": {
    "hook": "Attention-grabbing aesthetic opening line",
    "body": "Spacious, elegant caption formatted with gentle line breaks, emotional appeal, and value proposition",
    "callToAction": "Clear CTA statement",
    "hashtags": ["#aesthetic", "#digitalproducts", "#luxurylifestyle", "#templates", "..."]
  },
  "tiktokReels": {
    "hook": "Spoken/On-screen text hook that creates curiosity in 3 seconds",
    "videoConcept": "Brief visual shot idea (e.g. pouring iced matcha, opening iPad on ivory marble desk)",
    "caption": "Short, punchy video caption with relevant sound suggestion and hashtags"
  },
  "pinterest": {
    "pinTitle": "High-ranking, SEO-rich luxury Pin Title",
    "pinDescription": "Search-optimized pin copy with strategic keywords",
    "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"]
  },
  "emailNewsletter": {
    "subjectLine": "Aesthetic, high-open-rate subject line",
    "previewText": "Subtle curiosity-piquing preheader text",
    "body": "Conversational, warm, intimate letter to subscribers announcing the release with soft champagne luxury vibes"
  },
  "threadsX": {
    "posts": [
      "1/ Hook post creating an aesthetic perspective shift",
      "2/ What is included in this drop",
      "3/ Final CTA and release link announcement"
    ]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instagram: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                body: { type: Type.STRING },
                callToAction: { type: Type.STRING },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["hook", "body", "callToAction", "hashtags"],
            },
            tiktokReels: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                videoConcept: { type: Type.STRING },
                caption: { type: Type.STRING },
              },
              required: ["hook", "videoConcept", "caption"],
            },
            pinterest: {
              type: Type.OBJECT,
              properties: {
                pinTitle: { type: Type.STRING },
                pinDescription: { type: Type.STRING },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["pinTitle", "pinDescription", "keywords"],
            },
            emailNewsletter: {
              type: Type.OBJECT,
              properties: {
                subjectLine: { type: Type.STRING },
                previewText: { type: Type.STRING },
                body: { type: Type.STRING },
              },
              required: ["subjectLine", "previewText", "body"],
            },
            threadsX: {
              type: Type.OBJECT,
              properties: {
                posts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["posts"],
            },
          },
          required: [
            "instagram",
            "tiktokReels",
            "pinterest",
            "emailNewsletter",
            "threadsX",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error generating marketing captions:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate marketing captions",
    });
  }
});

// Endpoint: Generate High-Quality Images
// Must use model gemini-3-pro-image-preview and support image sizes (1K, 2K, 4K)
app.post("/api/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = "1:1",
      imageSize = "1K", // "1K" | "2K" | "4K"
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required for image generation." });
    }

    const ai = getAi();

    // Models priority: requested gemini-3-pro-image-preview, with fallback
    const modelsToTry = [
      "gemini-3-pro-image-preview",
      "gemini-3-pro-image",
      "gemini-3.1-flash-image",
      "gemini-3.1-flash-lite-image",
    ];

    let lastError: any = null;
    let imageUrl: string | null = null;
    let modelUsed: string = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting image generation with model: ${modelName}, size: ${imageSize}, ratio: ${aspectRatio}`);
        
        // Build imageConfig. Note: gemini-3-pro-image-preview and gemini-3.1-flash-image support imageSize
        const imageConfig: any = {
          aspectRatio: aspectRatio || "1:1",
        };

        if (modelName !== "gemini-3.1-flash-lite-image" && ["1K", "2K", "4K"].includes(imageSize)) {
          imageConfig.imageSize = imageSize;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig,
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || "image/png";
              imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              modelUsed = modelName;
              break;
            }
          }
        }

        if (imageUrl) {
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} image generation failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!imageUrl) {
      throw new Error(
        lastError?.message || "No image could be generated. Please verify your prompt or API credentials."
      );
    }

    return res.json({
      imageUrl,
      modelUsed,
      imageSize,
      aspectRatio,
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate image",
    });
  }
});

// Endpoint: Multi-turn Gemini Chatbot
// Uses gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for fast tasks
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      taskType = "general", // "complex" | "general" | "fast"
      systemRole = "luxury_brand_strategist",
      customSystemInstruction,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Model selection based on user requirements:
    // Complex tasks: gemini-3.1-pro-preview
    // General tasks: gemini-3.5-flash
    // Fast tasks: gemini-3.1-flash-lite
    let preferredModel = "gemini-3.5-flash";
    if (taskType === "complex") {
      preferredModel = "gemini-3.1-pro-preview";
    } else if (taskType === "fast") {
      preferredModel = "gemini-3.1-flash-lite";
    }

    const ai = getAi();

    // System instruction presets
    const systemRoleInstructions: Record<string, string> = {
      luxury_brand_strategist: `You are "Aurelia", a senior luxury brand strategist, high-ticket digital product consultant, and creative director for aesthetic digital creators and boutique digital ateliers.
Your personality is sophisticated, encouraging, warm, highly analytical, and attuned to the finest details of feminine luxury, elegant typography, premium pricing psychology, and high-conversion launch strategies.
You give actionable, high-value advice on digital product development (e-books, Notion systems, Canva kits, presets, courses), pricing tier architecture, audience attraction, and persuasive luxury copy.
Format your responses with clear formatting, elegant bullet points, and practical steps.`,

      pricing_architect: `You are a specialized pricing and monetization architect for digital products. You analyze value propositions, market positioning, tiered packaging (standard vs VIP vs bundle), and psychological anchoring to help creators maximize average order value without devaluing their luxury brand.`,

      launch_copywriter: `You are a world-class luxury direct-response copywriter. You craft high-converting headlines, story-driven sales hooks, aesthetic launch sequences, and high-converting calls to action tailored for modern discerning buyers.`,
    };

    const activeInstruction =
      customSystemInstruction ||
      systemRoleInstructions[systemRole] ||
      systemRoleInstructions.luxury_brand_strategist;

    // Convert messages to Gemini API format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    // Execute with fallback chain
    const modelsToAttempt = [
      preferredModel,
      "gemini-3.5-flash",
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ];

    let lastError: any = null;
    let replyText = "";
    let modelUsed = preferredModel;

    for (const modelToTry of modelsToAttempt) {
      try {
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents,
          config: {
            systemInstruction: activeInstruction,
            temperature: 0.7,
          },
        });

        if (response.text) {
          replyText = response.text;
          modelUsed = modelToTry;
          break;
        }
      } catch (err: any) {
        console.warn(`Chat model ${modelToTry} attempt failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!replyText) {
      throw new Error(
        lastError?.message || "Failed to generate reply from Gemini AI models."
      );
    }

    return res.json({
      reply: replyText,
      modelUsed,
      taskType,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: error?.message || "Failed to communicate with AI chat service.",
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Digital Product Management Server running on port ${PORT}`);
  });
}

startServer();
