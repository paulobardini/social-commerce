

## Plano: Corrigir navegacao para produtos no feed e stories

### Problemas identificados

1. **PostDetailModal** — os cards de produto vinculado nao tem `onClick`. O icone `ExternalLink` e decorativo, clicar nao faz nada.
2. **StoryProductSheet** — mesma situacao: lista produtos mas nao sao clicaveis.
3. Ambos precisam navegar para a pagina de produtos da marca (`/marca/{slug}/produtos`) ao clicar num produto vinculado.

### Solucao

#### 1. PostDetailModal — tornar produtos clicaveis
- Adicionar `useNavigate` do react-router
- No card de cada produto, adicionar `onClick` que:
  - Fecha o modal (`onClose()`)
  - Navega para `/marca/{brandSlug}/produtos` onde `brandSlug` e derivado dos dados do produto (usando `product.subBrandId` ou a marca do post)
- Como o `PostDetailModal` ja recebe `brand` (nome da marca), precisamos tambem do `brandSlug` — adicionar prop opcional ou derivar do nome

#### 2. StoryProductSheet — tornar produtos clicaveis
- Adicionar `useNavigate`
- Adicionar prop `onProductClick` ou `brandSlug` + navegacao interna
- Ao clicar num produto, fechar o story viewer e navegar para a pagina de produtos

#### 3. MasonryFeed — passar brandSlug ao PostDetailModal
- Os pins estaticos ja tem o brand name que corresponde ao slug (ex: "Brandili" -> "brandili")
- Adicionar campo `brandSlug` ao `Pin` interface e popular com o slug correto

### Arquivos afetados

| Arquivo | Alteracao |
|---------|-----------|
| `PostDetailModal.tsx` | Adicionar navegacao nos cards de produto |
| `StoryProductSheet.tsx` | Adicionar navegacao nos cards de produto |
| `StoriesBar.tsx` | Passar callback de close ao StoryProductSheet para fechar story ao navegar |
| `MasonryFeed.tsx` | Passar brandSlug ao PostDetailModal |

