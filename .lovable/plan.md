

## Redesign dos Contadores de Engajamento nos Cards

### Problema
Os contadores atuais (curtidas, comentários, salvamentos) estão visualmente pobres — ícones pequenos (`h-3 w-3`), texto minúsculo (`text-[10px]`), sem diferenciação visual, tudo amontoado na mesma linha da marca.

### Solução
Redesenhar os contadores com um estilo mais polished inspirado em Instagram/Pinterest:

1. **Separar visualmente** os contadores da linha da marca — colocá-los em uma linha própria abaixo da marca
2. **Estilo pill/chip** — cada contador dentro de um pequeno chip com background sutil (`bg-muted/50 rounded-full px-2 py-0.5`)
3. **Ícones maiores e coloridos** — Heart vermelho quando curtido (`h-3.5 w-3.5`), MessageCircle com cor accent, Bookmark preenchido com cor accent
4. **Tipografia melhor** — `text-[11px] font-medium` com espaçamento adequado
5. **Sempre visíveis** — Bookmark aparece sempre (não apenas quando salvo), com estado visual diferente

### Arquivo a editar
- `src/components/MasonryFeed.tsx` — seção de engajamento (linhas 177-193)

### Layout proposto
```text
┌─────────────────────────┐
│  [img] Brand Name       │
│                         │
│  ❤️ 343  💬 5  🔖      │  ← linha separada, chips sutis
└─────────────────────────┘
```

Cada counter terá: ícone colorido contextual + número em `font-medium`, com gap harmonioso entre eles. O Bookmark aparece sempre (outline quando não salvo, filled+accent quando salvo).

