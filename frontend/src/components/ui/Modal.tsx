"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./Button";

import { IModalProps } from "@/types/components";

export function Modal({ isOpen, onClose, title, children, footer }: IModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="bg-card/90 border border-border/50 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-xl font-bold font-heading text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 bg-white/5 border-t border-border/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
