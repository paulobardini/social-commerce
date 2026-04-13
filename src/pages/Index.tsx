import { StoriesBar } from "@/components/StoriesBar";
import { MasonryFeed } from "@/components/MasonryFeed";

const Index = () => {
  return (
    <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 overflow-hidden">
      <StoriesBar />
      <MasonryFeed />
    </div>
  );
};

export default Index;
