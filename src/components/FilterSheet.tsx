import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/data/mockProducts";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: string | null;
  priceMin: string;
  priceMax: string;
  categories: string[];
  genders: string[];
  sizes: string[];
}

export const defaultFilters: FilterState = {
  priceRange: null,
  priceMin: "",
  priceMax: "",
  categories: [],
  genders: [],
  sizes: [],
};

export function countActiveFilters(f: FilterState): number {
  let count = 0;
  if (f.priceRange || f.priceMin || f.priceMax) count++;
  if (f.categories.length) count++;
  if (f.genders.length) count++;
  if (f.sizes.length) count++;
  return count;
}

const priceRanges = [
  { label: "Até R$ 50", value: "0-50" },
  { label: "R$ 50 a R$ 100", value: "50-100" },
  { label: "R$ 100 a R$ 200", value: "100-200" },
  { label: "Mais de R$ 200", value: "200+" },
];

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}

function Section({ title, children, defaultOpen = false, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {badge !== undefined && badge > 0 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
              {badge}
            </span>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full py-2 group"
    >
      <span className={`text-sm ${checked ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
      <div
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked ? "border-accent bg-accent" : "border-border group-hover:border-muted-foreground"
        }`}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-2 w-2 rounded-full bg-accent-foreground"
          />
        )}
      </div>
    </button>
  );
}

export function FilterSheet({ open, onClose, products, filters, onApply }: FilterSheetProps) {
  const [local, setLocal] = useState<FilterState>(filters);

  // Reset local when opening
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setLocal(filters);
    setWasOpen(true);
  }
  if (!open && wasOpen) setWasOpen(false);

  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );
  const allGenders = useMemo(
    () => [...new Set(products.map((p) => p.gender))].sort(),
    [products]
  );
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return [...set].sort((a, b) => {
      const na = parseInt(a), nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [products]);

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const activeCount = countActiveFilters(local);

  const handleClear = () => setLocal(defaultFilters);
  const handleApply = () => {
    onApply(local);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[380px] bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="text-base font-bold text-foreground">Filtro</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto">
              {/* Price range */}
              <Section title="Faixa de valor" defaultOpen badge={local.priceRange || local.priceMin || local.priceMax ? 1 : 0}>
                <div className="space-y-1">
                  {priceRanges.map((pr) => (
                    <CheckOption
                      key={pr.value}
                      label={pr.label}
                      checked={local.priceRange === pr.value}
                      onChange={() =>
                        setLocal((prev) => ({
                          ...prev,
                          priceRange: prev.priceRange === pr.value ? null : pr.value,
                        }))
                      }
                    />
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Mínimo"
                    type="number"
                    value={local.priceMin}
                    onChange={(e) => setLocal((prev) => ({ ...prev, priceMin: e.target.value, priceRange: null }))}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Máximo"
                    type="number"
                    value={local.priceMax}
                    onChange={(e) => setLocal((prev) => ({ ...prev, priceMax: e.target.value, priceRange: null }))}
                    className="h-9 text-sm"
                  />
                </div>
              </Section>

              {/* Category */}
              <Section title="Categoria" badge={local.categories.length}>
                <div className="space-y-1">
                  {allCategories.map((cat) => (
                    <CheckOption
                      key={cat}
                      label={cat}
                      checked={local.categories.includes(cat)}
                      onChange={() =>
                        setLocal((prev) => ({ ...prev, categories: toggleArray(prev.categories, cat) }))
                      }
                    />
                  ))}
                </div>
              </Section>

              {/* Gender */}
              <Section title="Gênero" badge={local.genders.length}>
                <div className="space-y-1">
                  {allGenders.map((g) => (
                    <CheckOption
                      key={g}
                      label={g}
                      checked={local.genders.includes(g)}
                      onChange={() =>
                        setLocal((prev) => ({ ...prev, genders: toggleArray(prev.genders, g) }))
                      }
                    />
                  ))}
                </div>
              </Section>

              {/* Size */}
              <Section title="Tamanho" badge={local.sizes.length}>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setLocal((prev) => ({ ...prev, sizes: toggleArray(prev.sizes, s) }))
                      }
                      className={`h-9 min-w-9 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        local.sizes.includes(s)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-card px-5 py-3 flex items-center gap-3">
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Limpar
                {activeCount > 0 && (
                  <span className="h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
              <Button onClick={handleApply} className="flex-1">
                Filtrar
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
