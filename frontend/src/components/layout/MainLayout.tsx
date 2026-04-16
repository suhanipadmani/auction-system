"use client";

import { useState } from "react";

import { Sidebar } from "../common/Sidebar";
import { Header } from "../common/Header";
import { Drawer } from "../common/Drawer";
import { ProtectedRoute } from "../common/ProtectedRoute";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Drawer (containing the same sidebar) */}
        <Drawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
          <Sidebar isMobile onClose={() => setIsSidebarOpen(false)} />
        </Drawer>

        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          <main className={`flex-1 ${isSidebarOpen ? '' : 'lg:ml-64'} bg-background text-foreground p-4 md:p-8 lg:p-10 overflow-x-hidden`}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
