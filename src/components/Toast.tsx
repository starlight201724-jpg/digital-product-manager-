import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 ${
              toast.type === "error"
                ? "bg-[#FCF4F4]/95 border-[#E5B5B5] text-[#5C2323]"
                : "bg-[#FDFBF7]/95 border-[#E2D6C0] text-[#3D332A]"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-[#B84747] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-[#6E6053] mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#9E8E7D] hover:text-[#3D332A] transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
