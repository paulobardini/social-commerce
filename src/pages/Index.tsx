import { NextilHeader } from "@/components/NextilHeader";
import { StoriesBar } from "@/components/StoriesBar";
import { NextilSidebar } from "@/components/NextilSidebar";
import { MasonryFeed } from "@/components/MasonryFeed";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NextilHeader />
      <div className="flex">
        <NextilSidebar />
        <div className="flex-1 flex flex-col">
          <StoriesBar />
          <MasonryFeed />
        </div>
      </div>
    </div>
  );
};

export default Index;
