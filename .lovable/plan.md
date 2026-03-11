

## Plano: 3 Correções e Melhorias no Fluxo de Conteúdo

### 1. Clique no post do feed abre foto expandida com produtos

**Problema**: Clicar num card do `MasonryFeed` não faz nada.

**Solução**: Criar um componente `PostDetailModal` — modal/lightbox que abre ao clicar num pin. Mostra a imagem expandida, título, marca, e se houver produtos vinculados, lista-os abaixo (imagem, nome, ref, preço, botão "Ver Produto"). Para pins estáticos (sem produtos vinculados), mostra apenas a imagem expandida com info da marca.

**Alterações**:
- Criar `src/components/PostDetailModal.tsx` — modal com imagem grande + lista de produtos
- Editar `MasonryFeed.tsx` — adicionar estado `selectedPin`, passar `linkedProducts` (do UserPost) para o modal, e `onClick` no card do pin

O `Pin` interface precisa carregar o array `linkedProducts` (não só o count). Para user posts, já temos os dados no `userPosts`. Para static pins, será vazio.

### 2. CTA nos stories não funciona

**Problema**: No `StoriesBar.tsx`, o botão CTA no story viewer está hardcoded como "Ver Coleção" (linha 339). Não usa o campo `cta` do story criado pelo usuário.

**Solução**: 
- O `BrandStories.stories[]` já tem `caption` mas não tem `cta` — adicionar campo `cta?: string`
- No render do story viewer, usar `activeStoryData.cta || "Ver Coleção"` no botão
- Os static stories ficam com "Ver Coleção" (default), e os user stories usam o CTA escolhido na criação

### 3. Criador vincula conteúdo a fábricas conectadas

**Problema**: Quando o criador cria um story ou post, o `brandName` é simplesmente `user.name` e `brandLogo` fica vazio. Não há seleção de fábrica.

**Solução**: 
- Adicionar ao `AuthContext` um campo `connectedBrands` (array de `{ slug, name, logo }`) — mock com algumas marcas para teste
- No `CreateStoryModal` e `CreatePostModal`, adicionar um step inicial (ou campo no último step) para **selecionar a fábrica** da lista de conexões do criador
- O `brandName` e `brandLogo` do post/story ficam preenchidos com a marca selecionada
- Para `fabrica`, pular essa etapa (a marca é a própria)
- Para mock: quando o usuário é `criador`, popular `connectedBrands` com 3-4 marcas do `mockProducts.ts`

### Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/components/PostDetailModal.tsx` | Criar — lightbox com produtos |
| `src/components/MasonryFeed.tsx` | Editar — onClick abre PostDetailModal, passar linkedProducts |
| `src/components/StoriesBar.tsx` | Editar — usar campo `cta` dinâmico, adicionar `cta` à interface |
| `src/components/CreateStoryModal.tsx` | Editar — adicionar seleção de fábrica para criadores |
| `src/components/CreatePostModal.tsx` | Editar — adicionar seleção de fábrica para criadores |
| `src/contexts/AuthContext.tsx` | Editar — adicionar `connectedBrands` mock para criadores |

