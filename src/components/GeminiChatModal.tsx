import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Trash2, Bot, User, RefreshCw, Cpu, Layers } from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage, ChatTaskType } from "../types";

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Welcome to the Atelier strategy salon. I am **Aurelia**, your senior luxury brand strategist and digital product architect.\n\nWhether you need to calibrate high-ticket pricing, architect a multi-asset launch funnel, or elevate your brand narrative with feminine luxury nuances, I am at your service. How may we elevate your catalog today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-3.5-flash",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Task type mapping to model:
  // "complex" -> gemini-3.1-pro-preview
  // "general" -> gemini-3.5-flash
  // "fast" -> gemini-3.1-flash-lite
  const [taskType, setTaskType] = useState<ChatTaskType>("general");
  const [systemRole, setSystemRole] = useState<string>("luxury_brand_strategist");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickStarters = [
    "How should I price and tier an aesthetic Notion Operating System?",
    "Give me 5 irresistible bonus ideas for a luxury brand identity kit launch.",
    "Draft a 3-part teaser sequence for Instagram Stories that feels quiet luxury.",
    "Help me position an e-book at $79 instead of the typical $19 market standard.",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          taskType,
          systemRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to receive response from Gemini.");
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        taskType,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      onNotify("error", "Chat Error", err.message || "Failed to reach AI strategist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Conversation cleared. I am ready to advise on your next digital product concept, pricing model, or marketing drop.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "gemini-3.5-flash",
      },
    ]);
    onNotify("info", "History Reset", "Conversation history cleared.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#231B15]/50 backdrop-blur-sm">
      <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-3xl border border-[#EADBCA] shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[#EADBCA] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#C5A059] p-0.5 shadow-xs">
              <div className="w-full h-full rounded-full bg-[#FAF8F5] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-semibold text-[#2D2622]">
                  Aurelia • AI Luxury Brand Strategist
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#F3EBE0] text-[#8C7652] border border-[#E3D6C1]">
                  Gemini Multi-Turn
                </span>
              </div>
              <p className="text-xs text-[#7A6C5E]">
                High-ticket digital products & creative positioning consultant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-[#7E6E60] hover:text-[#9E7321] hover:bg-[#F3ECE0] transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7E6E60] hover:text-[#2D2622] hover:bg-[#F3ECE0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Role & Task/Model Router */}
        <div className="px-6 py-2.5 bg-[#F6EFE5] border-b border-[#EADBCA] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Persona selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#6E5D4F] uppercase text-[10px] tracking-wider">
              Persona:
            </span>
            <select
              value={systemRole}
              onChange={(e) => setSystemRole(e.target.value)}
              className="bg-[#FAF8F5] border border-[#DFD4C1] text-[#3D332A] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059]"
            >
              <option value="luxury_brand_strategist">Aurelia (Brand Strategist)</option>
              <option value="pricing_architect">Monetization & Pricing Architect</option>
              <option value="launch_copywriter">Luxury Direct-Response Copywriter</option>
            </select>
          </div>

          {/* Model / Task Router (gemini-3.1-pro-preview / gemini-3.5-flash / gemini-3.1-flash-lite) */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#6E5D4F] uppercase text-[10px] tracking-wider">
              Task Mode:
            </span>
            <div className="flex bg-[#EFE7D8] rounded-lg p-0.5 border border-[#DFD4C1]">
              <button
                type="button"
                onClick={() => setTaskType("complex")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  taskType === "complex"
                    ? "bg-[#2D2622] text-[#FAF8F5] shadow-xs"
                    : "text-[#6E5E50] hover:text-[#2D2622]"
                }`}
                title="Uses gemini-3.1-pro-preview for deep strategic reasoning"
              >
                Complex (Pro)
              </button>
              <button
                type="button"
                onClick={() => setTaskType("general")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  taskType === "general"
                    ? "bg-[#2D2622] text-[#FAF8F5] shadow-xs"
                    : "text-[#6E5E50] hover:text-[#2D2622]"
                }`}
                title="Uses gemini-3.5-flash for balanced creative consulting"
              >
                General (Flash)
              </button>
              <button
                type="button"
                onClick={() => setTaskType("fast")}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  taskType === "fast"
                    ? "bg-[#2D2622] text-[#FAF8F5] shadow-xs"
                    : "text-[#6E5E50] hover:text-[#2D2622]"
                }`}
                title="Uses gemini-3.1-flash-lite for rapid hooks and ideas"
              >
                Fast (Lite)
              </button>
            </div>
          </div>
        </div>

        {/* Message Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#EFE6D8] border border-[#DFCDB7] flex items-center justify-center shrink-0 text-[#A08855] mt-1 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-[#2D2622] text-[#FAF8F5] rounded-tr-none"
                      : "bg-[#FDFBF7] text-[#332A24] border border-[#EADBCA] rounded-tl-none"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-[#2D2622] prose-strong:text-[#2D2622] prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}

                  <div
                    className={`mt-2 flex items-center gap-2 text-[10px] ${
                      isUser ? "text-[#C4B7AA] justify-end" : "text-[#9E8E7F] justify-start"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.2 rounded bg-[#EFE8DC] text-[#7A6C5E] font-mono">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#2D2622] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#EFE6D8] border border-[#DFCDB7] flex items-center justify-center shrink-0 text-[#A08855] mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-[#FDFBF7] border border-[#EADBCA] rounded-2xl rounded-tl-none p-4 text-xs text-[#7A6C5E] flex items-center gap-2 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                <span>
                  Aurelia is analyzing luxury market signals with{" "}
                  {taskType === "complex"
                    ? "gemini-3.1-pro-preview"
                    : taskType === "fast"
                    ? "gemini-3.1-flash-lite"
                    : "gemini-3.5-flash"}
                  ...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-[#EADBCA] bg-[#FAF6EE] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-semibold text-[#8C7652] shrink-0">
            Inspire:
          </span>
          {quickStarters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(starter)}
              disabled={isLoading}
              className="text-xs px-3 py-1 rounded-full bg-[#FDFBF7] hover:bg-[#F2EADB] text-[#5A4B3E] border border-[#E0D5C3] whitespace-nowrap shrink-0 transition-colors disabled:opacity-50"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#EADBCA] bg-[#FDFBF7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Aurelia about product strategy, pricing tiers, or copy..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#DFD5C2] text-sm text-[#2D2622] placeholder:text-[#9C8C7D] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#D8B467] to-[#C5A059] text-[#231B15] hover:opacity-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
