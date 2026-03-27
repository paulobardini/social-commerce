

## Comprador Inteligente — Experiencia Interativa e Imersiva

### Conceito

Um fluxo fullscreen que simula uma conversa com IA, onde cada step e uma tela inteira com animacoes ricas, ilustracoes/icones grandes e interacoes taticas (arrastar slider, tocar cards que flipam, animacao de particulas ao selecionar). Zero reutilizacao de componentes existentes como FilterSheet, Select ou chips padrao — tudo custom.

### UX por Step

**Step 0 — Boas-vindas (tela de entrada)**
- Fundo gradiente animado com particulas sutis (CSS puro)
- Texto grande: "Vou te ajudar a encontrar os melhores produtos"
- Botao pulsante "Começar" que dispara a transicao

**Step 1 — "O que voce procura?" (Tipo)**
- Cards grandes com ilustracoes/icones (Baby, Criança, Adulto, Verão, Inverno, Kits, Coleção)
- Ao clicar, card faz animacao de "flip 3D" e muda de cor confirmando selecao
- Multi-select permitido

**Step 2 — "Para quem é?" (Genero)**
- 3 cards circulares grandes lado a lado com icones estilizados
- Hover faz card "levitar" com sombra animada
- Single select

**Step 3 — "Qual a faixa etaria?" (Idade)**
- Timeline horizontal interativa com pontos clicaveis (Bebe 0-2, Kids 2-8, Teen 8-14, Adulto)
- Ao clicar num ponto, linha se preenche ate ele com animacao fluida
- Condicional: so aparece se Step 1 inclui "Infantil" ou "Adulto"

**Step 4 — "Que tipo de peça?" (Categoria)**
- Grid de cards com icones desenhados (camiseta, calca, vestido, jaqueta, conjunto)
- Multi-select com animacao de "bounce" ao selecionar
- Badge animado mostra quantidade selecionada

**Step 5 — "Qual o estilo?" (Tipo/Estilo)**
- Cards horizontais com gradientes diferentes por estilo (Basico=neutro, Casual=colorido, Fashion=vibrante, Social=elegante)
- Multi-select

**Step 6 — "Qual estacao?" (Estacao)**
- 3 cards grandes com background tematico (sol para verao, folhas para inverno, misto para meia-estacao)
- Animacao de clima sutil no fundo do card selecionado

**Step 7 — "Qual tamanho?" (Tamanho)**
- Grid circular de tamanhos com efeito ripple ao tocar
- Multi-select

**Step 8 — "Quanto voce quer investir por peca?" (Valor)**
- Slider customizado grande com thumb animado
- Valor exibido em tempo real com animacao de contagem (count-up)
- Ranges: R$0 — R$500

**Step 9 — "Quantas pecas voce precisa?" (Quantidade)**
- Input central grande estilizado com botoes +/- animados
- Sugestoes rapidas como bolhas flutuantes (50, 100, 200, 500)

**Transicao Final — "Analisando..."**
- Tela com animacao de "radar" ou "scanning" por 2-3s
- Texto animado: "Cruzando dados...", "Encontrando marcas...", "Montando orcamento..."

**Resultado**
- Cards de marca com barra de compatibilidade animada (preenche de 0 a X%)
- Marca conectada: orcamento detalhado com contagem animada do valor total
- Marca nao conectada: botao "Solicitar conexao" com pulse
- Botoes "Refazer" e "Ver todas as marcas"

### Animacoes (framer-motion)

- Cada step entra com `slideInFromRight` e sai com `slideOutToLeft`
- Texto da IA aparece com efeito typewriter (letra por letra)
- Barra de progresso custom no topo com glow animado
- Particulas/confetti sutil ao completar cada step

### Dados

Campos novos na interface Product: `age`, `season`, `type`, `style`. Populados nos mocks existentes.

### Arquivos

| Arquivo | Acao |
|---|---|
| `src/data/mockProducts.ts` | Editar — adicionar `age`, `season`, `type`, `style` ao Product e dados mock |
| `src/components/SmartBuyerQuiz.tsx` | Novo — componente fullscreen com 10 steps, animacoes custom, logica de matching e resultado |
| `src/pages/Marcas.tsx` | Editar — botao de entrada estilizado para abrir o quiz |

