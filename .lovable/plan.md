

## Plano: Fluxo de Criação de Conteudo (Stories + Feed) para Fabricas e Criadores

### Contexto

Hoje o app tem stories e feed com dados estáticos. Precisamos criar o fluxo para que **fabricas** (marcas) e **criadores de conteudo** possam postar stories e imagens no feed, sempre vinculando com produtos existentes.

### O que sera criado

#### 1. Novo papel no AuthContext: `role`

Adicionar ao `UserProfile` um campo `role: "lojista" | "fabrica" | "criador"` (derivado do onboarding — quem escolheu "Produtor de Conteudo" vira `criador`, marcas seriam `fabrica`). Isso determina quem ve o botao de criar conteudo.

#### 2. Modal/Pagina de Criar Story (`CreateStoryModal`)

- Acessado pelo botao "+" (Criar Story) na `StoriesBar` — hoje existe mas nao faz nada
- Fluxo em 3 passos dentro de um modal fullscreen (mobile) ou dialog (desktop):
  1. **Upload de imagem** — arrastar ou selecionar imagem (preview 9:16)
  2. **Vincular produtos** — busca/selecao de produtos do catalogo da marca (multi-select com chips mostrando nome + ref do produto)
  3. **Legenda + Publicar** — campo de caption, botao CTA configuravel ("Ver Colecao", "Comprar Agora"), preview final e botao publicar
- Os stories criados sao adicionados ao array local (mock) e aparecem na `StoriesBar`

#### 3. Modal/Pagina de Criar Post no Feed (`CreatePostModal`)

- Acessado por um botao flutuante (FAB) "+" visivel apenas para roles `fabrica` e `criador`
- Fluxo similar:
  1. **Upload de imagem(ns)** — ate 4 imagens, preview em grid
  2. **Vincular produtos** — mesma busca do catalogo, selecao multipla com cards compactos
  3. **Detalhes** — titulo, categoria (Infantil, Feminino, Masculino, Tendencia), marca vinculada
  4. **Preview + Publicar** — mostra como ficara no feed masonry
- Posts criados aparecem no topo do `MasonryFeed`

#### 4. Componente reutilizavel: `ProductLinker`

Componente compartilhado entre os dois modais:
- Campo de busca com filtro por nome/ref
- Lista de produtos com thumbnail, nome, ref e preco
- Chips dos produtos selecionados com botao de remover
- Dados vem do `mockProducts.ts` (busca local)

#### 5. Visualizacao dos produtos vinculados

- **No Story**: quando usuario esta vendo o story, icone de sacola/tag no canto inferior mostrando quantidade de produtos vinculados. Ao tocar, abre um bottom sheet com os cards dos produtos linkados (imagem, nome, preco) com CTA "Ver Produto"
- **No Feed**: badge discreto no card do pin indicando produtos vinculados. Ao clicar no pin, o `ProductDetailModal` existente mostra os produtos tagueados

#### 6. Atualizacoes na navegacao

- Botao "+" na sidebar e mobile nav para roles com permissao de criar
- O "Criar Story" na StoriesBar redireciona para login se nao autenticado, ou abre o modal se tem permissao

### Estrutura de arquivos

```text
src/
  components/
    CreateStoryModal.tsx    (novo)
    CreatePostModal.tsx     (novo)
    ProductLinker.tsx        (novo)
    StoryProductSheet.tsx    (novo)
  contexts/
    AuthContext.tsx          (add role)
    ContentContext.tsx       (novo - gerencia posts/stories criados)
```

### Fluxo do usuario

```text
Fabrica/Criador logado
  ├─ StoriesBar → clica "+" → CreateStoryModal
  │    ├─ Upload imagem 9:16
  │    ├─ ProductLinker → vincula produtos
  │    └─ Caption + Publicar → story aparece na bar
  │
  └─ FAB "+" no feed → CreatePostModal
       ├─ Upload imagens
       ├─ ProductLinker → vincula produtos
       ├─ Titulo + Categoria
       └─ Publicar → post aparece no MasonryFeed
```

### Detalhes tecnicos

- **Upload mock**: imagens sao convertidas para data URLs via `FileReader` (sem backend)
- **ContentContext**: estado global com `useState` + localStorage para persistir posts/stories criados entre navegacoes
- **ProductLinker**: busca filtrando `brands[].products[]` do mockProducts.ts
- **Animacoes**: framer-motion para transicoes entre steps dos modais
- **Responsivo**: modais fullscreen no mobile, dialog centralizado no desktop

