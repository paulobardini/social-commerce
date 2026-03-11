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

const SEED_COMMENTS: Comment[] = [
  // Brandili - Coleção Inverno Kids 2026
  { id: "seed-1", contentId: "brandili-Coleção Inverno Kids 2026", contentType: "post", userId: "ana@email.com", userName: "Ana Silva", text: "Amei essa coleção! As cores estão lindas 😍", likes: ["u1","u2","u3"], parentId: null, createdAt: Date.now() - 3600000 },
  { id: "seed-2", contentId: "brandili-Coleção Inverno Kids 2026", contentType: "post", userId: "joao@email.com", userName: "João Mendes", text: "Quando chega na loja? Meus clientes vão adorar", likes: ["u1"], parentId: null, createdAt: Date.now() - 7200000 },
  { id: "seed-3", contentId: "brandili-Coleção Inverno Kids 2026", contentType: "post", userId: "maria@email.com", userName: "Maria Loja Kids", text: "Já fiz meu pedido! Recomendo demais", likes: ["u2","u3","u4","u5"], parentId: null, createdAt: Date.now() - 1800000 },
  { id: "seed-4", contentId: "brandili-Coleção Inverno Kids 2026", contentType: "post", userId: "ana@email.com", userName: "Ana Silva", text: "Obrigada pela dica, Maria!", likes: [], parentId: "seed-3", createdAt: Date.now() - 900000 },
  // Lunender - Acessórios Outono/Inverno
  { id: "seed-14", contentId: "lunender-Acessórios Outono/Inverno", contentType: "post", userId: "renata@email.com", userName: "Renata Acessórios", text: "Lunender nunca decepciona nos acessórios! 🧣", likes: ["u1","u2","u3","u4"], parentId: null, createdAt: Date.now() - 9000000 },
  { id: "seed-15", contentId: "lunender-Acessórios Outono/Inverno", contentType: "post", userId: "patricia@email.com", userName: "Patrícia Moda", text: "Já separei os favoritos pra minha loja", likes: ["u1","u5"], parentId: null, createdAt: Date.now() - 6000000 },
  { id: "seed-16", contentId: "lunender-Acessórios Outono/Inverno", contentType: "post", userId: "lucas@email.com", userName: "Lucas Varejo", text: "Preços competitivos e qualidade top!", likes: ["u2","u3"], parentId: null, createdAt: Date.now() - 3000000 },
  // Kyly - Streetwear Infantil
  { id: "seed-5", contentId: "kyly-Streetwear Infantil", contentType: "post", userId: "pedro@email.com", userName: "Pedro Costa", text: "Streetwear infantil tá em alta! Ótima aposta da Kyly", likes: ["u1","u2"], parentId: null, createdAt: Date.now() - 5400000 },
  { id: "seed-6", contentId: "kyly-Streetwear Infantil", contentType: "post", userId: "carla@email.com", userName: "Carla Moda", text: "Comprei a coleção toda, vendeu rápido 🔥", likes: ["u3","u4","u5","u6","u7"], parentId: null, createdAt: Date.now() - 4000000 },
  { id: "seed-17", contentId: "kyly-Streetwear Infantil", contentType: "post", userId: "rafael@email.com", userName: "Rafael Kids", text: "Os pais estão adorando essa linha", likes: ["u1"], parentId: null, createdAt: Date.now() - 2500000 },
  // Malwee - Texturas & Tricôs
  { id: "seed-7", contentId: "malwee-Texturas & Tricôs", contentType: "post", userId: "lucia@email.com", userName: "Lúcia Tricot", text: "Malwee sempre acertando nos tricôs!", likes: ["u1","u2","u3"], parentId: null, createdAt: Date.now() - 10800000 },
  { id: "seed-18", contentId: "malwee-Texturas & Tricôs", contentType: "post", userId: "sandra@email.com", userName: "Sandra Inverno", text: "Texturas maravilhosas, toque super macio", likes: ["u4","u5"], parentId: null, createdAt: Date.now() - 8000000 },
  // Hering - Alfaiataria Moderna
  { id: "seed-8", contentId: "hering-Alfaiataria Moderna", contentType: "post", userId: "marcos@email.com", userName: "Marcos Estilo", text: "Alfaiataria da Hering tá num nível absurdo", likes: ["u1"], parentId: null, createdAt: Date.now() - 86400000 },
  { id: "seed-9", contentId: "hering-Alfaiataria Moderna", contentType: "post", userId: "fernanda@email.com", userName: "Fernanda B.", text: "Concordo! Comprei pro meu marido e ficou perfeito", likes: ["u2","u3"], parentId: "seed-8", createdAt: Date.now() - 43200000 },
  { id: "seed-19", contentId: "hering-Alfaiataria Moderna", contentType: "post", userId: "gustavo@email.com", userName: "Gustavo Atacado", text: "Melhor custo-benefício em alfaiataria do mercado", likes: ["u1","u4","u5","u6"], parentId: null, createdAt: Date.now() - 20000000 },
  { id: "seed-20", contentId: "hering-Alfaiataria Moderna", contentType: "post", userId: "isabela@email.com", userName: "Isabela Store", text: "Saiu tudo no primeiro final de semana 🎉", likes: ["u2","u7"], parentId: null, createdAt: Date.now() - 15000000 },
  // Marisol - Candy Colors Verão
  { id: "seed-10", contentId: "marisol-Candy Colors Verão", contentType: "post", userId: "julia@email.com", userName: "Júlia Kids Store", text: "Essas cores vibrantes vendem muito no verão!", likes: ["u1","u2","u3","u4"], parentId: null, createdAt: Date.now() - 7200000 },
  { id: "seed-11", contentId: "marisol-Candy Colors Verão", contentType: "post", userId: "roberto@email.com", userName: "Roberto Atacado", text: "Já encomendei 200 peças 💪", likes: ["u5"], parentId: null, createdAt: Date.now() - 3600000 },
  { id: "seed-21", contentId: "marisol-Candy Colors Verão", contentType: "post", userId: "tatiane@email.com", userName: "Tatiane Moda", text: "As mães pedem muito essas cores!", likes: ["u1","u2","u3"], parentId: null, createdAt: Date.now() - 1500000 },
  // Elian - Paleta Earth Tones
  { id: "seed-13", contentId: "elian-Paleta Earth Tones", contentType: "post", userId: "bruno@email.com", userName: "Bruno Tendência", text: "Earth tones é a cara do inverno 2026", likes: ["u1","u2","u3"], parentId: null, createdAt: Date.now() - 21600000 },
  { id: "seed-22", contentId: "elian-Paleta Earth Tones", contentType: "post", userId: "daniela@email.com", userName: "Daniela Boutique", text: "Paleta sofisticada, clientes amaram!", likes: ["u4","u5","u6"], parentId: null, createdAt: Date.now() - 18000000 },
  { id: "seed-23", contentId: "elian-Paleta Earth Tones", contentType: "post", userId: "andre@email.com", userName: "André Varejo", text: "Combina com tudo, venda garantida", likes: ["u1","u7"], parentId: "seed-13", createdAt: Date.now() - 10000000 },
  // Colorittá - Floral Collection
  { id: "seed-12", contentId: "coloritta-Floral Collection", contentType: "post", userId: "camila@email.com", userName: "Camila Flores", text: "As estampas florais da Colorittá são únicas!", likes: ["u1","u2"], parentId: null, createdAt: Date.now() - 14400000 },
  { id: "seed-24", contentId: "coloritta-Floral Collection", contentType: "post", userId: "vanessa@email.com", userName: "Vanessa Kids", text: "Estampa exclusiva, minhas clientes adoram 🌸", likes: ["u3","u4","u5"], parentId: null, createdAt: Date.now() - 11000000 },
  { id: "seed-25", contentId: "coloritta-Floral Collection", contentType: "post", userId: "felipe@email.com", userName: "Felipe Loja", text: "Qualidade do tecido impressionante", likes: ["u1","u6"], parentId: null, createdAt: Date.now() - 5000000 },
];

function loadComments(): Comment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    // Seed with mock data if empty
    saveComments(SEED_COMMENTS);
    return SEED_COMMENTS;
  } catch {
    return SEED_COMMENTS;
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
