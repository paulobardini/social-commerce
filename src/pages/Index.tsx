import { NextilHeader } from "@/components/NextilHeader";
import { StoriesBar } from "@/components/StoriesBar";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MasonryFeed } from "@/components/MasonryFeed";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <StoriesBar />
      <div className="flex">
        <NextilSidebar />
        <MasonryFeed />
      </div>
    </div>
  );
};

export default Index;
