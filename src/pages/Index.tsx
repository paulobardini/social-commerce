import { NextilHeader } from "@/components/NextilHeader";
import { StoriesBar } from "@/components/StoriesBar";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MasonryFeed } from "@/components/MasonryFeed";
import { MobileNav } from "@/components/MobileNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 flex flex-col pb-16 md:pb-0">
          <StoriesBar />
          <MasonryFeed />
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default Index;
