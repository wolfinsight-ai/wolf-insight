import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border border-emerald-500/40 bg-[#131A29] px-4 py-3 text-sm font-medium text-slate-100 shadow-xl shadow-black/50"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
