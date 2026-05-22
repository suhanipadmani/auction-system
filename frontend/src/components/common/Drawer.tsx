"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { IDrawerProps } from "@/types/components";

export function Drawer({ isOpen, onClose, children }: IDrawerProps) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-72 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-gray-900 rounded-lg text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
