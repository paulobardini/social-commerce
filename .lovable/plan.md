

## Novo Onboarding — Experiencia Disruptiva e Imersiva

### Conceito Central

Abandonar completamente o formato "formulario com steps". O onboarding sera uma **jornada narrativa interativa**, como se o usuario estivesse entrando em um universo. Cada tela e uma experiencia sensorial completa — nao um formulario, mas uma **conversa visual com a plataforma**.

### Mecanicas Disruptivas

**1. Entrada cinematica** — Tela preta com o logo Nextil que "explode" em particulas e revela o universo. Texto aparece letra por letra como terminal/hacker: "Bem-vindo ao futuro da moda."

**2. Swiping cards (tipo Tinder)** — Em vez de clicar em opcoes, o usuario **arrasta cards para os lados**. Direita = gosto, esquerda = nao me interessa. Cada swipe dispara particulas e feedback háptico visual. Usado para segmento e interesses.

**3. Drag-and-drop de bolhas** — Para selecionar interesses, bolhas flutuantes com categorias ficam "boiando" na tela. O usuario arrasta as que quer para um circulo central que "absorve" cada bolha com animacao magnetica.

**4. Slider gravitacional** — Para faixa de investimento, em vez de um slider linear, o usuario arrasta uma "bola" em um arco gravitacional. Quanto mais alto, maior o investimento. A bola "pesa" mais conforme sobe.

**5. Mapa interativo pulsante** — Para regiao, um mapa estilizado do Brasil onde cada regiao pulsa. Ao tocar, a regiao "acende" com glow e as outras escurecem.

**6. Logo wall animado** — Para marcas conhecidas, os logos flutuam em movimento orbital lento. O usuario toca para "capturar" cada marca — ela vai para uma orbita pessoal no centro da tela.

**7. Resultado como "desbloqueio"** — A tela final simula um cofre/portal se abrindo, revelando as marcas recomendadas como se fossem premios desbloqueados, com contagem animada.

### Fluxo (7 telas)

```text
Tela 0: CINEMATICA DE ENTRADA
  - Fundo preto → logo explode em particulas
  - Texto typewriter: "Bem-vindo ao futuro da moda"
  - Auto-avanca em 3s ou toque

Tela 1: SEGMENTO (Swipe Cards)
  - "Como voce atua?"
  - 6 cards empilhados (Sacoleira, Lojista, Rede, E-commerce, Atacadista, Criador)
  - Swipe right = selecionar, aparece proximo card
  - Card selecionado fica como miniatura no topo

Tela 2: PORTE (Cards que "crescem")
  - "Em que momento esta seu negocio?"
  - 4 cards lado a lado que comecam pequenos
  - Ao tocar, o selecionado cresce e ocupa 60% da tela
  - Os outros encolhem e desfocam

Tela 3: REGIAO (Mapa interativo)
  - "De onde voce compra?"
  - Mapa estilizado do Brasil dividido em 5 regioes
  - CSS puro com divs posicionadas ou SVG simples
  - Toque acende regiao com glow neon
  - Selecao unica

Tela 4: INTERESSES (Bolhas flutuantes)
  - "O que te interessa?"
  - 12 bolhas com emojis flutuando com animacao CSS
  - Clique faz bolha "voar" para barra de coleta no topo
  - Minimo 3, barra de progresso preenche
  - Bolhas restantes se reorganizam

Tela 5: MARCAS CONHECIDAS (Logo wall orbital)
  - "Quais marcas voce ja conhece?"
  - 8 logos em grid animado com leve flutuacao
  - Toque faz logo "pulsar" e ganhar borda glow
  - Pode pular ("Nenhuma por enquanto")

Tela 6: INVESTIMENTO (Faixas visuais)
  - "Quanto pretende investir por mes?"
  - 4 blocos que representam faixas (ate 5k, 5-15k, 15-50k, +50k)
  - Cada bloco tem ilustracao/icone tematico
  - Selecao faz bloco expandir com animacao

Tela 7: RESULTADO — DESBLOQUEIO
  - Animacao de "processando perfil" (2.5s)
  - Texto sequencial: "Analisando perfil...", "Encontrando marcas...", "Montando sugestoes..."
  - "Portal" se abre revelando grid de marcas recomendadas
  - Cada marca aparece com delay escalonado (stagger)
  - Botao "Solicitar conexao" em cada marca
  - Botao final: "Explorar plataforma" → fecha onboarding
```

### Detalhes Tecnicos

- **Animacoes**: 100% framer-motion (ja instalado) — drag gestures, layout animations, spring physics
- **Swipe**: `drag="x"` com `onDragEnd` do framer-motion, sem lib extra
- **Bolhas flutuantes**: CSS `@keyframes` com variacao random de posicao, clique dispara `animate` do framer
- **Mapa**: SVG inline simples com 5 paths (regioes), interativo via onClick
- **Particulas**: Divs pequenas com animacao de expansao radial (CSS puro)
- **Sem libs novas**: Tudo com framer-motion + CSS

### Dados Salvos no AuthContext

Expandir `UserProfile` e `completeOnboarding`:
```
regiao?: string;
marcasConhecidas?: string[];
faixaInvestimento?: string;
```

### Match de Marcas (Tela 7)

Cruza `interesses` do usuario com `category` das marcas mock. Prioriza marcas que o usuario marcou como conhecidas. Exibe 4-6 marcas com badge "Voce ja conhece" quando aplicavel.

### Arquivos

| Arquivo | Acao |
|---|---|
| `src/pages/Onboarding.tsx` | Reescrever completo — 8 telas imersivas |
| `src/contexts/AuthContext.tsx` | Editar — novos campos no perfil e completeOnboarding |

