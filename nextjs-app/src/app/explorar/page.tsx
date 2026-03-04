"use client";

import { useState } from "react";
import { NextilHeader } from "@/components/NextilHeader";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MasonryFeed } from "@/components/MasonryFeed";
import { MobileNav } from "@/components/MobileNav";

const categories = ["Tudo", "Infantil", "Feminino", "Masculino", "Tendência", "Sustentável"];

export default function ExplorarPage() {
  const [activeCategory, setActiveCategory] = useState("Tudo");

  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 overflow-hidden">
          {/* Category filters */}
          <div className="border-b border-border bg-card/50 px-3 md:px-6 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <MasonryFeed />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

