

## Modo Vendedor + Oportunidades

### O que sera construido

Uma nova pagina `/vendedor` que replica a interface de catalogo B2B da imagem de referencia, com layout sidebar de filtros a esquerda + grid de produtos a direita. Alem disso, adiciona uma secao de **Oportunidades** — promocoes destacadas pela fabrica para chamar atencao do vendedor.

### Estrutura da pagina

```text
┌──────────────────────────────────────────────────┐
│  NextilHeader (existente)                        │
├────┬─────────────────────────────────────────────┤
│    │  Breadcrumb: Orcamentos > Novo Orcamento    │
│    ├─────────────────────────────────────────────┤
│    │  🔥 OPORTUNIDADES (banner/carousel)         │
│    │  Cards promocionais com countdown, % off,   │
│    │  badge "Oportunidade", destaque visual      │
│ S  ├──────────┬──────────────────────────────────┤
│ I  │ FILTROS  │  Toolbar: list/grid, sort, search│
│ D  │ Lojista  │  "678 produtos"                  │
│ E  │ Desconto │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ B  │ Faixa $  │  │prod│ │prod│ │prod│ │prod│    │
│ A  │ Marcas   │  └────┘ └────┘ └────┘ └────┘    │
│ R  │ Categoria│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│    │ Genero   │  │prod│ │prod│ │prod│ │prod│    │
│    │ Idade    │  └────┘ └────┘ └────┘ └────┘    │
│    │ Tamanho  │                                  │
│    │ Subcat   │                                  │
└────┴──────────┴──────────────────────────────────┘
```

### 1. Nova pagina `src/pages/Vendedor.tsx`

- Layout com sidebar de filtros fixa a esquerda (estilo accordion como na imagem)
- Filtros: Lojista (select), Desconto, Faixa de preco, Marcas (com badge de contagem), Marcas do kit, Categoria, Genero, Idade, Tamanho, Subcategoria
- Area principal com toolbar (toggle lista/grid, ordenacao A-Z, busca, "Adicionar todos (N)")
- Grid de produtos 4-5 colunas mostrando: imagem, marca (badge colorido), ref, nome, preco
- Botao "Montar grade" no topo esquerdo
- Icones de visualizacao e exportacao no canto superior direito
- Reutiliza dados de `mockProducts.ts` (todas as marcas juntas)

### 2. Secao Oportunidades

- Dados mock: `mockOpportunities` em `src/data/mockProducts.ts`
  - Cada oportunidade: `id`, `title`, `description`, `discountPercent`, `badgeText`, `expiresAt`, `products` (subset de Product[]), `brandSlug`, `highlightColor`
- Tipos de oportunidade: "Queima de estoque", "Lancamento exclusivo", "Compre X leve Y", "Desconto progressivo"
- UI: Barra horizontal scrollavel no topo da area de produtos, antes do grid
  - Cards com gradiente chamativo, badge "OPORTUNIDADE", percentual de desconto grande, timer de expiracao, mini preview de 2-3 produtos
  - Ao clicar, filtra o grid para mostrar apenas produtos daquela oportunidade
  - Visual que quebra o padrao do restante (cores vibrantes, animacao sutil de pulse no badge)

### 3. Rota e navegacao

- Adicionar rota `/vendedor` em `App.tsx`
- Adicionar item "Orcamentos" no sidebar (`NextilSidebar.tsx`) com icone `ClipboardList`

### 4. Componentes reutilizados

- `ProductDetailModal` — ao clicar em produto
- `GradeAbertaModal` — botao "Montar grade"
- Dados de `brands` e `Product` do `mockProducts.ts`

### Arquivos

| Arquivo | Acao |
|---|---|
| `src/pages/Vendedor.tsx` | Criar — pagina completa modo vendedor |
| `src/data/mockProducts.ts` | Editar — adicionar `mockOpportunities` |
| `src/App.tsx` | Editar — adicionar rota `/vendedor` |
| `src/components/NextilSidebar.tsx` | Editar — adicionar link Orcamentos |

