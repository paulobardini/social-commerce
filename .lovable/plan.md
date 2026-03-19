

## Plano: Checkout com Política Comercial, Steps de Desconto e Prazo de Faturamento

### Visão Geral

Transformar a página de checkout em um fluxo inteligente com **política comercial por marca**, incluindo:
1. **Barra de progresso com steps** — mostra faixas de desconto por volume (ex: 50 peças = 3%, 100 peças = 5%, 200 peças = 8%)
2. **Desconto por prazo** — prazos menores geram desconto adicional (ex: PIX à vista = +3%, 30 dias = +1%)
3. **Prazo de faturamento** — seleção de data de faturamento com impacto no desconto final

### Estrutura Visual

```text
┌──────────────────────────────────────────────────────────┐
│  MARCA X                                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🎯 Política Comercial          Faltam 12 peças!    │ │
│  │ ●────●────○────○                                    │ │
│  │ 50pç  100pç  200pç  500pç                          │ │
│  │ 3%    5%     8%     12%                             │ │
│  │ [Você está aqui: 88 peças → 3% ativo]               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Produtos expandíveis (como já existe)                   │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Subtotal bruto:        R$ 5.000,00                  │ │
│  │ Desc. volume (5%):    -R$   250,00                  │ │
│  │ Desc. prazo (+1%):    -R$    50,00                  │ │
│  │ Total marca:           R$ 4.700,00                  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

Sidebar direita:
┌──────────────────────┐
│ Pagamento & Prazo    │
│                      │
│ Forma: [Boleto ▼]    │
│ Prazo:  [30,45,60 ▼] │
│ Desc. prazo: +1%     │
│                      │
│ Faturamento:         │
│ [📅 25/04/2026    ]  │
│                      │
│ ──────────────────── │
│ Subtotal   R$5.000   │
│ Desc.vol   -R$250    │
│ Desc.prazo -R$50     │
│ TOTAL      R$4.700   │
│                      │
│ [Confirmar pedido]   │
└──────────────────────┘
```

### Detalhes Técnicos

**1. Dados de política comercial (mock)**

Criar um objeto `commercialPolicies` em `src/data/mockProducts.ts` (ou inline no Checkout) com faixas por marca:
```ts
{ brandSlug: "hering", tiers: [
  { minPieces: 50, discountPercent: 3 },
  { minPieces: 100, discountPercent: 5 },
  { minPieces: 200, discountPercent: 8 },
  { minPieces: 500, discountPercent: 12 },
], prazoDiscounts: [
  { prazo: "pix", extraPercent: 3 },
  { prazo: "30", extraPercent: 1 },
  { prazo: "30, 40", extraPercent: 0.5 },
  // prazos mais longos = 0%
]}
```

**2. Componente `CommercialPolicyBar`**

Novo componente com:
- Progress bar segmentada mostrando as faixas de desconto
- Indicador visual do tier atual (preenchido) vs próximo (vazio)
- Mensagem motivacional: "Adicione mais X peças para desbloquear Y% de desconto!"
- Animação suave ao mudar de tier

**3. Alterações no `Checkout.tsx`**

- Inserir `CommercialPolicyBar` dentro de cada brand group card, logo abaixo do header
- Adicionar seletor de **data de faturamento** (date picker) na sidebar por marca
- Calcular descontos dinamicamente: `descVolume` (pelo tier atingido) + `descPrazo` (pelo prazo selecionado)
- Exibir breakdown detalhado no resumo: subtotal bruto, desconto volume, desconto prazo, total líquido
- Atualizar o total geral somando os totais líquidos de todas as marcas

**4. Arquivos modificados**
- `src/pages/Checkout.tsx` — lógica de descontos, date picker, layout atualizado
- `src/components/CommercialPolicyBar.tsx` — novo componente da barra de progresso com tiers

