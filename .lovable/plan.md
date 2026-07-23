## Objetivo
Redesenhar `/marca/:slug/colecoes` usando como referência a **tela de pastas (boards) do Pinterest** — grid de cards com cover principal grande + 2 thumbs laterais, tipografia limpa, hover discreto, foco no visual das peças.

## Referência (Pinterest boards)
- Card = 1 cover grande à esquerda ocupando ~66% + coluna de 2 mini-thumbs empilhadas à direita (proporção 2:1).
- Cantos bem arredondados (rounded-2xl), sem bordas visíveis; só sombra leve no hover.
- Fundo do card = imagem, sem overlay pesado. Título e metadata **abaixo** da imagem, tipografia sóbria (nome em semibold, "N pins · atualizado há Xd" em muted).
- Grid responsivo denso: 2 col mobile, 3 tablet, 4-5 desktop (Pinterest usa masonry, mas com cover fixa por coleção o grid uniforme funciona melhor aqui).
- Header minimalista com nome da marca, contador ("5 coleções") e busca/filtro leve. Sem banner grande.

## Mudanças em `src/pages/MarcaColecoes.tsx`
1. **Header enxuto** estilo Pinterest: logo + nome da marca à esquerda, "5 coleções" em muted, campo de busca fino à direita (desktop) e botão "Ver todos os produtos" secundário.
2. **Card no formato Pinterest board**:
   - Layout: `grid grid-cols-3 gap-1` interno — coluna 1 span 2 (cover), coluna 2 com 2 thumbs empilhados.
   - Aspect ratio total ~ `aspect-[3/2]`.
   - Cantos `rounded-2xl` no wrapper, imagens `overflow-hidden`.
   - Hover: leve `scale-[1.01]` + `shadow-md`; sem borda colorida.
3. **Metadata abaixo da imagem**: nome da coleção (semibold, texto foreground), linha muted com "N peças · tag" (ex.: "128 peças · Nova coleção"). Remover badge sobreposto na imagem.
4. **Card "Ver todos os produtos"** também no formato board: cover neutro (bg muted com ícone `LayoutGrid` centralizado grande) + 2 thumbs de produtos reais nas laterais, título "Todos os produtos" e "Catálogo completo".
5. **Grid**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5`.
6. Manter animação de entrada suave (fade+y) já usada.
7. Manter navegação: clique no card → `/marca/:slug/produtos?colecao={slug}`; "Ver todos" → `/marca/:slug/produtos`.

## Fora de escopo
- Criar/editar/reordenar coleções (Pinterest permite; aqui é só visualização).
- Masonry real com alturas variáveis.
- Alterar rota ou dados mock de coleções.
