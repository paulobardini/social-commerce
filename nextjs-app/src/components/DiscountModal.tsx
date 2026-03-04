import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SubBrand } from "@/data/mockProducts";

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  subBrands: SubBrand[];
  onSave: (subBrandId: string | null, percent: number) => void;
}

export function DiscountModal({ open, onClose, subBrands, onSave }: DiscountModalProps) {
  const [selectedSb, setSelectedSb] = useState<string | null>(null);
  const [percent, setPercent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setSelectedSb(null);
    setPercent("");
    setDropdownOpen(false);
    setWasOpen(true);
  }
  if (!open && wasOpen) setWasOpen(false);

  const selectedLabel = selectedSb
    ? subBrands.find((sb) => sb.id === selectedSb)?.name || "Selecione"
    : "Todas as marcas";

  const handleSave = () => {
    const val = parseFloat(percent);
    if (isNaN(val) || val <= 0) return;
    onSave(selectedSb, val);
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Desconto</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione uma marca e aplique um desconto
              </p>

              {/* Select dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background flex items-center justify-between text-sm transition-colors hover:border-muted-foreground"
                >
                  <span className={selectedSb ? "text-foreground" : "text-muted-foreground"}>
                    {selectedLabel}
                  </span>
                  <ChevronIcon open={dropdownOpen} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden"
                    >
                      <button
                        onClick={() => { setSelectedSb(null); setDropdownOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors ${
                          !selectedSb ? "text-accent font-medium" : "text-foreground"
                        }`}
                      >
                        Todas as marcas
                      </button>
                      {subBrands.map((sb) => (
                        <button
                          key={sb.id}
                          onClick={() => { setSelectedSb(sb.id); setDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors border-t border-border ${
                            selectedSb === sb.id ? "text-accent font-medium" : "text-foreground"
                          }`}
                        >
                          {sb.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Percentage input */}
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="h-11 pr-10 text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!percent || parseFloat(percent) <= 0}
              >
                Salvar
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
