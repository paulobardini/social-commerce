import { useState, useRef } from "react";
import { X, Upload, ArrowRight, ArrowLeft, Image, Tag, Send, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductLinker } from "@/components/ProductLinker";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/data/mockProducts";
import { brands } from "@/data/mockProducts";
import { toast } from "sonner";

interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
}

const ctaOptions = ["Ver Coleção", "Comprar Agora", "Saiba Mais", "Confira"];

export function CreateStoryModal({ open, onClose }: CreateStoryModalProps) {
  const { addStory } = useContent();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const isCriador = user?.role === "criador";
  const connectedBrands = user?.connectedBrands || [];

  const [step, setStep] = useState(0);
  const [imageData, setImageData] = useState<string | null>(null);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
  const [caption, setCaption] = useState("");
  const [cta, setCta] = useState(ctaOptions[0]);
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>(connectedBrands[0]?.slug || "");

  const steps = isCriador
    ? [
        { icon: Building2, label: "Fábrica" },
        { icon: Image, label: "Imagem" },
        { icon: Tag, label: "Produtos" },
        { icon: Send, label: "Publicar" },
      ]
    : [
        { icon: Image, label: "Imagem" },
        { icon: Tag, label: "Produtos" },
        { icon: Send, label: "Publicar" },
      ];

  const totalSteps = steps.length;

  const reset = () => {
    setStep(0);
    setImageData(null);
    setLinkedProducts([]);
    setCaption("");
    setCta(ctaOptions[0]);
    setSelectedBrandSlug(connectedBrands[0]?.slug || "");
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImageData(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  // Resolve actual step content based on criador offset
  const contentStep = isCriador ? step : step;
  const brandStep = isCriador ? 0 : -1;
  const imageStep = isCriador ? 1 : 0;
  const productsStep = isCriador ? 2 : 1;
  const publishStep = isCriador ? 3 : 2;

  const selectedBrand = brands.find((b) => b.slug === selectedBrandSlug);

  const handlePublish = () => {
    if (!imageData || !user) return;
    const brandName = isCriador && selectedBrand ? selectedBrand.name : user.name;
    const brandLogo = isCriador && selectedBrand ? selectedBrand.logo : "";
    addStory({
      brandName,
      brandAvatar: brandLogo,
      image: imageData,
      caption,
      cta,
      linkedProducts,
    });
    toast.success("Story publicado!");
    reset();
    onClose();
  };

  const canNext = () => {
    if (contentStep === brandStep) return !!selectedBrandSlug;
    if (contentStep === imageStep) return !!imageData;
    if (contentStep === productsStep) return true;
    if (contentStep === publishStep) return !!caption;
    return false;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
        onClick={() => { reset(); onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-3 max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Criar Story</h2>
            <button onClick={() => { reset(); onClose(); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 px-5 py-3 border-b border-border">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <div className="w-6 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>

          <div className="p-5">
            {/* Brand selection (criador only) */}
            {contentStep === brandStep && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecione a fábrica para vincular ao seu story.</p>
                <div className="space-y-2">
                  {connectedBrands.map((cb) => {
                    const fullBrand = brands.find((b) => b.slug === cb.slug);
                    return (
                      <button
                        key={cb.slug}
                        onClick={() => setSelectedBrandSlug(cb.slug)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-colors ${
                          selectedBrandSlug === cb.slug
                            ? "border-accent bg-accent/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        {fullBrand?.logo ? (
                          <img src={fullBrand.logo} alt={cb.name} className="h-10 w-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent border border-border">
                            {cb.name.charAt(0)}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{cb.name}</p>
                          {fullBrand && (
                            <p className="text-xs text-muted-foreground">{fullBrand.totalProducts} produtos</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload */}
            {contentStep === imageStep && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Envie uma imagem no formato vertical (9:16) para seu story.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {!imageData ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-10 cursor-pointer hover:border-accent/50 transition-colors"
                    style={{ aspectRatio: "9/16", maxHeight: "320px" }}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground text-center">Clique ou arraste uma imagem</span>
                  </div>
                ) : (
                  <div className="relative mx-auto overflow-hidden rounded-xl" style={{ aspectRatio: "9/16", maxHeight: "320px" }}>
                    <img src={imageData} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setImageData(null)}
                      className="absolute top-2 right-2 rounded-full bg-foreground/60 p-1.5 text-background hover:bg-foreground/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Link products */}
            {contentStep === productsStep && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Vincule produtos ao seu story para que os lojistas possam comprar diretamente.</p>
                <ProductLinker selected={linkedProducts} onChange={setLinkedProducts} />
              </div>
            )}

            {/* Caption + CTA + Publish */}
            {contentStep === publishStep && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Legenda</label>
                  <Input
                    placeholder="Ex: Nova Coleção Verão 2026"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Botão CTA</label>
                  <div className="flex flex-wrap gap-2">
                    {ctaOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCta(opt)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          cta === opt
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {imageData && (
                  <div className="relative mx-auto overflow-hidden rounded-xl" style={{ aspectRatio: "9/16", maxHeight: "200px" }}>
                    <img src={imageData} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/70 to-transparent">
                      <p className="text-xs font-semibold text-primary-foreground">{caption || "Legenda..."}</p>
                      <span className="mt-1 inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-medium text-accent-foreground">
                        {cta}
                      </span>
                    </div>
                  </div>
                )}
                {linkedProducts.length > 0 && (
                  <p className="text-xs text-muted-foreground">{linkedProducts.length} produto(s) vinculado(s)</p>
                )}
                {isCriador && selectedBrand && (
                  <p className="text-xs text-muted-foreground">Fábrica: {selectedBrand.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-card px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step > 0 ? setStep(step - 1) : (reset(), onClose())}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {step > 0 ? "Voltar" : "Cancelar"}
            </Button>
            {step < totalSteps - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)} disabled={!canNext()}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handlePublish} disabled={!canNext()}>
                <Send className="h-4 w-4 mr-1" />
                Publicar
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
