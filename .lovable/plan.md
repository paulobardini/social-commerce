## Objetivo
Permitir que o lojista defina **markup/margem** e visualize o **preço de venda (sell-out)** de forma discreta nos cards e detalhada no modal, com hierarquia global → marca → produto. Também **remover a seção "Oportunidades"** da página `/marca/:slug/produtos`.

## 1. Remover "Oportunidades" da página da marca
- Em `src/pages/MarcaDetalhe.tsx`, remover o uso de `OpportunitiesSection` (import + render) apenas nessa página. O componente segue existindo para outras telas.

## 2. Onde ele imputa a precificação

### A) Painel global — "Minha precificação"
- Nova página `src/pages/PrecificacaoConfig.tsx` (rota `/precificacao`), com link no menu do usuário (AppTopbar/Perfil).
- Conteúdo:
  - **Padrão global**: toggle Markup (`x`) ou Margem (`%`) + valor.
  - **Por marca**: lista das marcas com input próprio + botão "usar padrão".
  - **Arredondamento** opcional: nenhum / `,90` / `,99` / inteiro.
- Persistência em `localStorage` (novo `src/lib/precificacao.ts`), emitindo evento `precificacao:updated`.

### B) Ajuste rápido na página da marca
- Barra fina discreta acima do grid: `Sua precificação p/ Brandili: 2,5x` com um botão pequeno de editar (popover inline). Sem poluir; uma linha só.

### C) Ajuste por produto
- Dentro do `ProductDetailModal`, seção "Preço de venda" com input individual + "voltar ao padrão da marca".

## 3. Onde ele visualiza (regra anti-poluição no card)

### Card do produto
- **Uma única linha adicional, discreta**, abaixo do preço de atacado:
  ```
  R$ 79,90                              (preço atacado, atual)
  Venda R$ 199,90 · 2,5x                (12px, cor muted, sem ícone, sem badge)
  ```
- Sem badge colorido, sem caixa, sem borda — só texto secundário.
- Se o lojista desativar o markup (valor = 0 ou toggle off no config), some completamente. Toggle "Mostrar preço de venda" fica no painel de precificação (default: ligado).
- Respeita gating: sem PJ conectado não mostra nem atacado nem venda (mantém "Conecte-se…").

### `ProductDetailModal` (aqui pode detalhar mais)
- Bloco de preço com: atacado, venda, **lucro por peça** e **margem efetiva**.
- Input inline para simular markup/margem só daquele produto.
- Total do pedido também mostra **venda projetada** e **lucro projetado**.

## 4. Modelo de dados

```ts
// src/lib/precificacao.ts
type Modo = "markup" | "margem";
interface RegraPreco {
  modo: Modo;
  valor: number;             // 2.5 (markup) ou 60 (margem %)
  arredondamento?: "none" | "90" | "99" | "inteiro";
}
interface PrecificacaoState {
  mostrarNoCard: boolean;                    // default true
  global: RegraPreco;
  porMarca: Record<string, RegraPreco>;
  porProduto: Record<string, RegraPreco>;
}
```
Helpers: `getRegra(slug, id)` (resolve hierarquia), `calcularVenda(custo, regra)`, `set/reset` por escopo.

Fórmulas:
- Markup → `venda = custo * markup`
- Margem → `venda = custo / (1 - margem/100)`
- Lucro `= venda - custo`; margem efetiva `= (venda - custo)/venda`.

## 5. Arquivos

**Criar**
- `src/lib/precificacao.ts`
- `src/hooks/usePrecoVenda.ts` → `{ precoVenda, regra, origem, lucro, margemEfetiva }`
- `src/pages/PrecificacaoConfig.tsx`
- `src/components/PrecoVendaBar.tsx` (barra discreta na página da marca)

**Editar**
- `src/pages/MarcaDetalhe.tsx` — remover `OpportunitiesSection`; adicionar `PrecoVendaBar`; passar preço de venda ao card.
- Card de produto usado nessa página — acrescentar a linha "Venda R$ … · Nx" (texto muted).
- `src/components/ProductDetailModal.tsx` — bloco expandido com input, lucro, totais projetados.
- `src/App.tsx` — rota `/precificacao`.
- Menu/AppTopbar — link "Minha precificação".

## Fora de escopo
- Regras por categoria/gênero.
- Impostos por NCM.
- Persistência em backend.