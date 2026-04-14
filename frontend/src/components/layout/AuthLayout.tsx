"use client";

import { ReactNode } from "react";
import { Gavel } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle Background blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-10 border border-border shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 ring-4 ring-primary/5">
                <Gavel className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground mt-3 text-sm font-medium">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
