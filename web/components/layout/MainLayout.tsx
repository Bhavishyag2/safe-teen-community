"use client";

import * as React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        showMobileMenu={showSidebar}
      />

      <div className="flex">
        {/* Desktop sidebar */}
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {showSidebar && sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isMobile
            />
          </>
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-3.5rem)]",
            "pb-20 md:pb-0" // Account for mobile nav
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
