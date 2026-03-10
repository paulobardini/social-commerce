import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { Product } from "@/data/mockProducts";

export interface UserStory {
  id: string;
  brandName: string;
  brandAvatar: string;
  image: string;
  caption: string;
  cta: string;
  linkedProducts: Product[];
  createdAt: number;
}

export interface UserPost {
  id: string;
  title: string;
  category: string;
  brandName: string;
  brandLogo: string;
  images: string[];
  linkedProducts: Product[];
  createdAt: number;
}

interface ContentContextType {
  userStories: UserStory[];
  userPosts: UserPost[];
  addStory: (story: Omit<UserStory, "id" | "createdAt">) => void;
  addPost: (post: Omit<UserPost, "id" | "createdAt">) => void;
}

const ContentContext = createContext<ContentContextType>({} as ContentContextType);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [userStories, setUserStories] = useState<UserStory[]>(() => {
    const saved = localStorage.getItem("nextil_stories");
    return saved ? JSON.parse(saved) : [];
  });

  const [userPosts, setUserPosts] = useState<UserPost[]>(() => {
    const saved = localStorage.getItem("nextil_posts");
    return saved ? JSON.parse(saved) : [];
  });

  const addStory = useCallback((story: Omit<UserStory, "id" | "createdAt">) => {
    const newStory: UserStory = {
      ...story,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setUserStories((prev) => {
      const next = [newStory, ...prev];
      localStorage.setItem("nextil_stories", JSON.stringify(next));
      return next;
    });
  }, []);

  const addPost = useCallback((post: Omit<UserPost, "id" | "createdAt">) => {
    const newPost: UserPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setUserPosts((prev) => {
      const next = [newPost, ...prev];
      localStorage.setItem("nextil_posts", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ContentContext.Provider value={{ userStories, userPosts, addStory, addPost }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
