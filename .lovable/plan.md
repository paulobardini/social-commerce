

## Adicionar Perfil Comercial ao CadastroPJModal (sem Região)

Como o endereço já captura o estado (UF), o campo região é redundante e será removido.

### Mudanças

**1. CadastroPJModal.tsx — Novo step 2 "Perfil Comercial"**
- Steps passam de 2 para 3: Dados da loja → Endereço → Perfil Comercial
- Novo step com apenas 2 campos:
  - **Porte**: select (MEI, Microempresa, Pequeno porte, Médio porte, Grande porte)
  - **Investimento mensal**: select com faixas (Até R$5.000, R$5.000-R$15.000, R$15.000-R$50.000, R$50.000-R$100.000, Acima de R$100.000)
- Step 1 (Endereço) avança para step 2 em vez de finalizar
- Step 2 tem "Voltar" e "Cadastre-se"
- Indicador de steps atualizado com 3 items (ícone BarChart3 para o novo)

**2. AuthContext.tsx**
- Adicionar `investimentoMensal?: string` ao `UserProfile`

**3. handleFinish**
- Incluir `porte` e `investimentoMensal` no objeto passado para `completePJ`

### Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/CadastroPJModal.tsx` | Editar — adicionar step 2 com porte e investimento mensal |
| `src/contexts/AuthContext.tsx` | Editar — adicionar `investimentoMensal` ao UserProfile |

