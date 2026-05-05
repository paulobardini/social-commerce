## Problema

No editor de Lookbook (`/marketing/lookbooks/:id`):
- Páginas do tipo "produtos" mostram só placeholders cinza com texto "Produto" — não puxam o catálogo real (`brands` em `mockProducts.ts`).
- Inspector apenas exibe "use o seletor para adicionar do catálogo (em breve)" — não há seletor.
- Não existem **modelos pré-definidos de cards/páginas** para acelerar a montagem do catálogo.
- Página pública (`LookbookPublicoPage`) sofre do mesmo problema (renderiza placeholders).

## Objetivo

Transformar Lookbook em um **construtor de catálogo facilitado**, com seleção real de produtos do catálogo Nextil e templates prontos.

## Mudanças

### 1. Seletor real de produtos no Inspector
Reusar/adaptar o `ProductLinker` (`src/components/ProductLinker.tsx`) já existente:
- Busca por nome/ref/categoria, miniatura, preço, multiselect com chips.
- Limite configurável (ex.: até 12 por página).
- IDs persistidos em `page.produtoIds` no formato `${brandSlug}/${productId}` (mantendo o padrão já usado em `mockLookbooks.ts`).
- Helper `resolveProduct(id)` em `mockLookbooks.ts` para buscar produto + marca a partir do ID composto.

### 2. Renderização real dos cards de produto
No `LookbookEditorPage` (preview) e em `LookbookPublicoPage`:
- Resolver cada `produtoId` → mostrar imagem da 1ª variante, nome, ref, preço.
- Card responsivo com aspect 3/4, overlay com nome + preço, badge de marca.
- Click no card (na pública) registra `cliquesProduto` no log.

### 3. Templates de página pré-definidos
Adicionar barra "Adicionar página" expandida com **modelos prontos** (não só tipos crus):
- **Capa hero** — imagem fullbleed + título + subtítulo
- **Grade 2x2 destaques** — 4 produtos grandes
- **Grade 3x3 catálogo** — 9 produtos compactos
- **Vitrine vertical** — lista 1 produto por linha com descrição
- **Editorial + 2 produtos** — imagem grande + 2 produtos abaixo
- **Página de texto/manifesto**
- **Capa de seção** (divisor entre coleções)

Cada template injeta uma `LookbookPagina` pré-configurada (com `layout` novo campo opcional: `grid-2`, `grid-3`, `lista`, `split`).

### 4. Ações rápidas para popular catálogo
No inspector, quando tipo = produtos:
- Botão **"Adicionar todos de uma marca"** (dropdown de marcas → injeta IDs).
- Botão **"Adicionar por categoria"** (filtro rápido).
- Reordenar produtos via drag (ou botões ↑↓ simples para escopo do mock).

### 5. Mock atualizado
- `mockLookbooks.ts`: regenerar `productIds` usando IDs reais (já existe, mas confirmar formato compatível com novo helper) e adicionar `layout` aos lookbooks seed para mostrarem variedade visual.

## Arquivos afetados

- `src/marketing/data/mockLookbooks.ts` — adicionar `layout?` em `LookbookPagina`, helper `resolveProduto`, templates.
- `src/marketing/pages/LookbookEditorPage.tsx` — substituir placeholder por cards reais, integrar `ProductLinker`, menu de templates, ações em massa.
- `src/marketing/pages/LookbookPublicoPage.tsx` — renderizar cards reais conforme `layout`.
- (Opcional) `src/marketing/components/LookbookProductCard.tsx` — componente reutilizável de card.

## Fora do escopo

- Persistência server-side (continua localStorage).
- Drag-and-drop avançado (usaremos botões reorder simples).
- Edição de produto a partir do lookbook.
