import { useState, useMemo } from "react";
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useComments, type Comment } from "@/contexts/CommentsContext";
import { useAuth } from "@/contexts/AuthContext";

interface CommentsSectionProps {
  contentId: string;
  contentType: "post" | "story";
  compact?: boolean; // for stories (smaller UI)
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function CommentItem({
  comment,
  replies,
  userId,
  onLike,
  onReply,
  compact,
}: {
  comment: Comment;
  replies: Comment[];
  userId: string;
  onLike: (id: string) => void;
  onReply: (id: string, userName: string) => void;
  compact?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const isLiked = comment.likes.includes(userId);
  const initial = comment.userName.charAt(0).toUpperCase();

  return (
    <div className={compact ? "py-1.5" : "py-2"}>
      <div className="flex gap-2">
        <div className={`${compact ? "h-6 w-6 text-[8px]" : "h-7 w-7 text-[9px]"} rounded-full bg-accent/15 flex items-center justify-center font-bold text-accent flex-shrink-0`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-foreground`}>{comment.userName}</span>
            <span className={`${compact ? "text-[8px]" : "text-[10px]"} text-muted-foreground`}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p className={`${compact ? "text-[10px]" : "text-xs"} text-foreground/90 mt-0.5 leading-relaxed break-words`}>{comment.text}</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 ${compact ? "text-[9px]" : "text-[10px]"} transition-colors ${isLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Heart className={`${compact ? "h-2.5 w-2.5" : "h-3 w-3"}`} fill={isLiked ? "currentColor" : "none"} />
              {comment.likes.length > 0 && comment.likes.length}
            </button>
            <button
              onClick={() => onReply(comment.id, comment.userName)}
              className={`${compact ? "text-[9px]" : "text-[10px]"} text-muted-foreground hover:text-foreground transition-colors`}
            >
              Responder
            </button>
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-1.5">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className={`flex items-center gap-1 ${compact ? "text-[9px]" : "text-[10px]"} text-accent font-medium hover:underline`}
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {replies.length} {replies.length === 1 ? "resposta" : "respostas"}
              </button>
              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-2 border-l-2 border-border pl-2 mt-1 space-y-1"
                  >
                    {replies.map((r) => (
                      <CommentItem
                        key={r.id}
                        comment={r}
                        replies={[]}
                        userId={userId}
                        onLike={onLike}
                        onReply={onReply}
                        compact={compact}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentsSection({ contentId, contentType, compact }: CommentsSectionProps) {
  const { getComments, addComment, toggleLike } = useComments();
  const { isAuthenticated, user } = useAuth();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null);

  const allComments = getComments(contentId, contentType);
  const topLevel = useMemo(() => allComments.filter((c) => !c.parentId).sort((a, b) => b.createdAt - a.createdAt), [allComments]);
  const repliesMap = useMemo(() => {
    const map = new Map<string, Comment[]>();
    allComments.filter((c) => c.parentId).forEach((c) => {
      const list = map.get(c.parentId!) || [];
      list.push(c);
      map.set(c.parentId!, list);
    });
    return map;
  }, [allComments]);

  const userId = user?.email || "anon";

  const handleSubmit = () => {
    if (!isAuthenticated || !user) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    addComment({
      contentId,
      contentType,
      userId,
      userName: user.name,
      text: trimmed,
      parentId: replyTo?.id,
    });
    setText("");
    setReplyTo(null);
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo({ id: commentId, userName });
  };

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <MessageCircle className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} text-foreground`} />
        <span className={`${compact ? "text-xs" : "text-sm"} font-medium text-foreground`}>
          {allComments.length > 0 ? `${allComments.length} comentário${allComments.length > 1 ? "s" : ""}` : "Comentários"}
        </span>
      </div>

      {/* Comments list */}
      {topLevel.length > 0 && (
        <div className={`${compact ? "max-h-32" : "max-h-48"} overflow-y-auto divide-y divide-border/50`}>
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesMap.get(c.id) || []}
              userId={userId}
              onLike={(id) => toggleLike(id, userId)}
              onReply={handleReply}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Input */}
      {isAuthenticated ? (
        <div className="space-y-1">
          {replyTo && (
            <div className={`flex items-center gap-1 ${compact ? "text-[9px]" : "text-[10px]"} text-accent`}>
              <span>Respondendo a <strong>{replyTo.userName}</strong></span>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground ml-1">✕</button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={replyTo ? `Responder ${replyTo.userName}...` : "Escreva um comentário..."}
              maxLength={500}
              className={`flex-1 ${compact ? "h-7 text-[10px]" : "h-8 text-xs"} rounded-lg border border-border bg-background px-3 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50`}
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={`${compact ? "h-7 w-7" : "h-8 w-8"} rounded-lg bg-accent text-accent-foreground flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90`}
            >
              <Send className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
            </button>
          </div>
        </div>
      ) : (
        <p className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground italic`}>
          Faça login para comentar
        </p>
      )}
    </div>
  );
}
