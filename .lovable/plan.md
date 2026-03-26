

## Botão de Política Comercial na página /produtos

### O que será feito
Adicionar um botão na barra de ações do header sticky da página de produtos (`ProdutoDetalhe.tsx`) que abre um modal com:
1. **Select de tipo de venda**: "Venda Apolo" ou "Venda Direta"
2. **Lista suspensa (dropdown)** para selecionar a política comercial disponível (ex: "CDKA - INV 26 - SUL/SUD/CO")
3. Exibição dos dados da política selecionada (comissionamento, descontos, prazos, grade, pedido mínimo, etc.)

### Arquivos

**1. Novo: `src/components/CommercialPolicyModal.tsx`**
- Modal (Dialog) com:
  - Select para tipo de venda: "Venda Apolo" / "Venda Direta"
  - Select/Combobox para escolher a política comercial
  - Exibição dos detalhes da política selecionada em formato tabular (comissionamento padrão, desconto x prazo, prazo de pagamento, grade produto, pedido mínimo, período de faturamento, observações)
- Dados mock inline com 2-3 políticas de exemplo baseadas na imagem de referência

**2. Editar: `src/pages/ProdutoDetalhe.tsx`**
- Adicionar estado `policyModalOpen`
- Inserir botão na barra de ações (ao lado do filtro/desconto) com ícone `FileText` ou `ClipboardList`
- Importar e renderizar o `CommercialPolicyModal`

### Layout do modal
```text
┌─────────────────────────────────────────┐
│  Política Comercial              [X]    │
│                                         │
│  Tipo de Venda:  [Venda Apolo ▼]        │
│  Política:       [CDKA - INV 26 ▼]     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Comissionamento: 20% sob comissão│  │
│  │ Desconto padrão: 19% prazo ...   │  │
│  │ Prazo pagamento: Boleto 75D      │  │
│  │ Grade: Fechada                   │  │
│  │ Pedido mín. frete: R$ 2.500     │  │
│  │ Período faturamento: 01/03-30/06│  │
│  │ Observações: ...                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│              [Aplicar política]         │
└─────────────────────────────────────────┘
```

