

## Onboarding — Simplificar Interacoes

### Mudancas

**1. Steps de selecao unica avancam automaticamente**
Nos steps onde o usuario so pode escolher 1 opcao (Segmento, Porte, Regiao, Investimento), ao clicar o item fica selecionado e apos 400ms avanca automaticamente para o proximo step. Remove a necessidade de clicar "Continuar" nesses steps.

**2. Substituir Swipe Cards do Segmento por grid simples**
Remover completamente o componente `SwipeCard` e a mecanica de swipe/drag. Substituir por um grid 2x3 igual ao porte — cards com emoji + label, toque seleciona e avanca. Limpo e direto.

**3. Remover animacoes excessivas**
- Remover `Particles` (fundo e resultado)
- Remover `Typewriter` da intro — texto aparece direto
- Remover blur/scale nos nao-selecionados (porte, investimento)
- Remover glow pulsante infinito (regiao, marcas)
- Remover float animation das bolhas de interesses
- Remover rotate inicial das marcas
- Manter apenas: fade entre steps, entrada suave dos cards, progress bar, check ao selecionar, stagger no resultado

**4. Regiao — grid vertical limpo**
Substituir o layout de posicionamento absoluto (mapa fake) por uma lista vertical simples com 5 opcoes. Cada opcao com MapPin + nome + estados. Click seleciona e avanca.

### Comportamento do botao Continuar
- Steps multi-selecao (Interesses, Marcas): botao "Continuar" permanece, pois o usuario precisa escolher varios
- Steps single-select (Segmento, Porte, Regiao, Investimento): sem botao "Continuar", avanco automatico ao clicar
- Step intro: botao "Comecar" permanece

### Arquivos

| Arquivo | Acao |
|---|---|
| `src/pages/Onboarding.tsx` | Reescrever — remover SwipeCard, Particles, Typewriter, simplificar todos os steps, auto-avanco em single-select |

