"use client";

import { NextilHeader } from "@/components/NextilHeader";
import { StoriesBar } from "@/components/StoriesBar";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MasonryFeed } from "@/components/MasonryFeed";
import { MobileNav } from "@/components/MobileNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 overflow-hidden">
          <StoriesBar />
          <MasonryFeed />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

