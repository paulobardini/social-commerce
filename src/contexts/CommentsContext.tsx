import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface Comment {
  id: string;
  contentId: string; // post or story id
  contentType: "post" | "story";
  userId: string;
  userName: string;
  text: string;
  likes: string[]; // user ids who liked
  parentId: string | null; // null = top-level, string = reply to comment
  createdAt: number;
}

interface CommentsContextType {
  getComments: (contentId: string, contentType: "post" | "story") => Comment[];
  addComment: (data: { contentId: string; contentType: "post" | "story"; userId: string; userName: string; text: string; parentId?: string }) => void;
  toggleLike: (commentId: string, userId: string) => void;
  getCommentCount: (contentId: string, contentType: "post" | "story") => number;
}

const STORAGE_KEY = "nextil_comments";

const CommentsContext = createContext<CommentsContextType>({} as CommentsContextType);

function loadComments(): Comment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveComments(comments: Comment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>(loadComments);

  const getComments = useCallback(
    (contentId: string, contentType: "post" | "story") =>
      comments.filter((c) => c.contentId === contentId && c.contentType === contentType),
    [comments]
  );

  const getCommentCount = useCallback(
    (contentId: string, contentType: "post" | "story") =>
      comments.filter((c) => c.contentId === contentId && c.contentType === contentType).length,
    [comments]
  );

  const addComment = useCallback(
    (data: { contentId: string; contentType: "post" | "story"; userId: string; userName: string; text: string; parentId?: string }) => {
      const trimmed = data.text.trim().slice(0, 500);
      if (!trimmed) return;
      const newComment: Comment = {
        id: crypto.randomUUID(),
        contentId: data.contentId,
        contentType: data.contentType,
        userId: data.userId,
        userName: data.userName,
        text: trimmed,
        likes: [],
        parentId: data.parentId || null,
        createdAt: Date.now(),
      };
      setComments((prev) => {
        const next = [...prev, newComment];
        saveComments(next);
        return next;
      });
    },
    []
  );

  const toggleLike = useCallback((commentId: string, userId: string) => {
    setComments((prev) => {
      const next = prev.map((c) => {
        if (c.id !== commentId) return c;
        const liked = c.likes.includes(userId);
        return { ...c, likes: liked ? c.likes.filter((id) => id !== userId) : [...c.likes, userId] };
      });
      saveComments(next);
      return next;
    });
  }, []);

  return (
    <CommentsContext.Provider value={{ getComments, addComment, toggleLike, getCommentCount }}>
      {children}
    </CommentsContext.Provider>
  );
}

export const useComments = () => useContext(CommentsContext);
