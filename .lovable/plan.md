
# Nextil Start — Protótipo navegável

## Estratégia: mesmo projeto, módulo isolado

**Não dividir o projeto.** O Nextil Start vive no mesmo repositório React/Vite atual, mas como **módulo paralelo isolado**, sob o prefixo de rota `/start/*` e pasta `src/start/`. Isso preserva 100% do produto atual (Nextil + área Vendedor/CRM) e permite reaproveitar:

- Stack já instalada (React 18, React Router v6, Tailwind, Lucide, sonner, shadcn/ui)
- Componentes base (`Button`, `Input`, `Card`, `Dialog`, `Badge`, etc.)
- Toaster já montado no `App.tsx`

**Isolamento garantido por:**
- Rotas próprias: todas começam com `/start/...` (login, vitrine, área autenticada)
- Pasta exclusiva `src/start/` (pages, components, contexts, data, layout)
- Context API próprio (`StartAuthContext`, `StartDataContext`) — nada conversa com o `AuthContext` ou contextos do CRM existente
- Design system local em `src/start/styles/` aplicado via classes Tailwind arbitrárias com as cores do brief (verdes #1D9E75, etc.) — **não** alteramos `index.css` global nem `tailwind.config.ts` para evitar contaminar o Nextil principal

**Logo "nextil start"** será wordmark em texto puro (lowercase, peso 500, "nextil" preto + "start" verde), sem afetar o branding do Nextil principal.

---

## Mapa de rotas (todas em /start)

```text
Públicas
  /start/login
  /start/cadastro
  /start/vitrine/:slug
  /start/vitrine/:slug/produto/:id
  /start/vitrine/:slug/pedido
  /start/vitrine/:slug/pedido/sucesso

Autenticadas (StartProtectedRoute)
  /start                       → redirect login | inicio
  /start/onboarding
  /start/inicio
  /start/catalogo
  /start/catalogo/novo
  /start/catalogo/:id
  /start/pedidos
  /start/pedidos/:id
  /start/compradores
  /start/compradores/novo
  /start/compradores/:id
  /start/vitrine-config
  /start/configuracoes
  /start/configuracoes/plano
```

Adicionado um único bloco de rotas no `App.tsx` existente, fora do `AppLayout` e do `VendedorLayout`, com seu próprio `<StartLayout>`.

---

## Divisão em 2 etapas

Como o brief é extenso (14 itens da ordem de implementação), divido em **2 entregas** com preview entre elas. Confirme cada uma antes de avançar.

### ETAPA 1 — Fundação + Área autenticada do fornecedor

Objetivo: ter o fornecedor logando, fazendo onboarding e gerenciando catálogo/pedidos/compradores ponta a ponta.

1. **Setup do módulo**
   - `src/start/contexts/StartAuthContext.tsx` (login mockado, fornecedor "Maria Confecções")
   - `src/start/contexts/StartDataContext.tsx` (produtos, pedidos, compradores em memória + persistência opcional em localStorage chave `nextil_start_*`)
   - `src/start/data/mockStart.ts` com os 8 produtos, 5 compradores, 6 pedidos do brief
   - `src/start/styles/tokens.ts` com as cores e classes utilitárias

2. **Layout**
   - `StartLayout` com sidebar 220px (desktop) e bottom nav 4 itens (mobile)
   - `StartHeader`, `StartBottomNav`, `StartSidebar`, `StartLogo`
   - `StartProtectedRoute` redireciona para `/start/login`

3. **Auth e Onboarding**
   - `/start/login` (split layout desktop, formulário simples, qualquer credencial loga)
   - `/start/cadastro`
   - `/start/onboarding` 4 passos com barra de progresso, validação mock de slug, **upload com IA mockada** (loader 2s + preenchimento fixo)

4. **Catálogo**
   - `/start/catalogo` (grid, busca, chips de categoria, badge de estoque, barra de uso 7/10)
   - `/start/catalogo/novo` e `/start/catalogo/:id` com **bloco de IA** (upload → loader 2s → autofill + toast verde + scroll), grade de tamanhos (P/M/G, números, infantil, único), excluir produto

5. **Pedidos**
   - `/start/pedidos` com tabs (Novos/Em produção/Prontos/Entregues/Cancelados) e contagem
   - Card de pedido novo com fundo amarelado e pulsação na borda
   - Confirmar pedido → modal → muda status no Context → toast
   - `/start/pedidos/:id` com timeline, ações por status, gerar comprovante, botão WhatsApp (alert)

6. **Compradores**
   - `/start/compradores` com filtros de temperatura
   - `/start/compradores/:id` com identidade, contato, resumo comercial, pedidos vinculados, observações
   - `/start/compradores/novo`

7. **Início (dashboard)**
   - Saudação, barra de plano, 2 cards do dia, alertas, atalho câmera, pedidos recentes, link da vitrine
   - Botão discreto "Simular novo pedido chegando"

**Checkpoint:** preview navegável de toda a área do fornecedor.

---

### ETAPA 2 — Vitrine pública + conexão + polish

Objetivo: comprador consegue navegar a vitrine, montar pedido e o fornecedor recebe em tempo real.

8. **Vitrine config + Configurações + Planos**
   - `/start/vitrine-config` com preview ao vivo, toggle ativa/inativa, copiar link
   - `/start/configuracoes` (lista de seções, notificações inline)
   - `/start/configuracoes/plano` (grátis vs Pro, modal "em breve" com captura de email)

9. **Vitrine pública**
   - `/start/vitrine/:slug` (header da loja, busca, chips, grid de produtos, botão WhatsApp flutuante, rodapé "Powered by")
   - Validação de slug inexistente → tela de erro dedicada

10. **Produto individual**
    - `/start/vitrine/:slug/produto/:id` (galeria, detalhes, chips de tamanho com estoque, "mais produtos")

11. **Formulário de pedido (tela mais complexa)**
    - `/start/vitrine/:slug/pedido` em 3 seções (dados do comprador, produtos com stepper e validação de mínimo, pagamento/observações)
    - Modal "+ Adicionar mais produtos" com busca
    - Resumo sticky no bottom mobile
    - Submit valida → loader 1.5s → grava no `StartDataContext` (novo pedido status "novo") → redirect

12. **Confirmação**
    - `/start/vitrine/:slug/pedido/sucesso` com check animado em CSS, resumo, botão WhatsApp (alert)

13. **Conexão Context** — pedido enviado pela vitrine aparece em `/start/pedidos` e no dashboard `/start/inicio` (mesma instância do Context). Persistência opcional via localStorage para sobreviver a reload e simular sincronia entre abas.

14. **Estados vazios + 404 + micro-interações**
    - Empty states de catálogo, pedidos, compradores
    - 404 dedicada `/start/*` → tela amigável
    - Animações: copiar com feedback, pulsação em pedidos novos, check animado, transições de tabs, modal scale-in, stepper

**Checkpoint:** preview do fluxo completo comprador → fornecedor.

---

## Detalhes técnicos

- **Roteamento**: adicionar rotas `/start/*` no `App.tsx` existente, fora dos providers do CRM (não envolver `AutomacoesProvider`, `MetasProvider`, etc.). Wrap apenas com `StartAuthProvider` e `StartDataProvider`.
- **Cores**: usar Tailwind com classes arbitrárias `bg-[#1D9E75]`, `text-[#0F6E56]`, etc. Centralizar em `src/start/styles/tokens.ts` exportando strings reutilizáveis (`START_COLORS.primary`, etc.) ou via `cva` local, evitando tocar em `tailwind.config.ts` global.
- **Tipografia Inter**: já é a fonte base do projeto Nextil (Poppins é o atual). Vou adicionar `font-['Inter']` localmente nos containers do `/start` via classe arbitrária + `<link>` Google Fonts no `index.html` (única alteração fora de `src/start/`, restrita a adicionar uma tag `<link>`).
- **Persistência mock**: `localStorage` com namespace `nextil_start_*` para não colidir com `nextil_user`/`nextil_onboarding` do Nextil principal.
- **IA mockada**: função `simulateAIPhotoAnalysis()` que retorna uma Promise resolvida em 2000ms com payload fixo do brief.
- **WhatsApp**: `alert()` formatado como pedido pelo brief.
- **Sem novas dependências**: tudo já está instalado.

## O que NÃO é alterado

- Nada em `src/components/`, `src/pages/`, `src/contexts/`, `src/data/` do projeto atual
- Nenhum estilo global em `index.css` ou `tailwind.config.ts`
- O Nextil principal e a área Vendedor continuam funcionando exatamente como hoje

---

Confirme se posso começar pela **Etapa 1** (Fundação + área autenticada do fornecedor).
