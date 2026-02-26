import { Search, Bell, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

const placeholders = [
  "Buscar tecidos de algodão orgânico...",
  "Buscar fornecedores de linho...",
  "Buscar coleções outono/inverno 2026...",
  "Buscar malhas sustentáveis...",
];

export function NextilHeader() {
  const [focused, setFocused] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Nextil
        </span>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
          B2B
        </span>
      </div>

      {/* Search */}
      <div
        className={`relative flex w-full max-w-md items-center transition-all duration-300 ${
          focused ? "max-w-lg" : ""
        }`}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholders[0]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-10 w-full rounded-full border border-border bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {[
          { icon: Bell, label: "Notificações", badge: 3 },
          { icon: MessageCircle, label: "Mensagens", badge: 1 },
          { icon: ShoppingBag, label: "Carrinho", badge: 0 },
        ].map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            aria-label={label}
            className="relative rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Icon className="h-5 w-5" />
            {badge > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {badge}
              </span>
            )}
          </button>
        ))}

        <div className="ml-2 h-8 w-8 overflow-hidden rounded-full bg-secondary">
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
