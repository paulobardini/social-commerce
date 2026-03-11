import { useState, useRef } from "react";
import { X, Upload, ArrowRight, ArrowLeft, Image, Tag, FileText, Send, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductLinker } from "@/components/ProductLinker";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/data/mockProducts";
import { brands } from "@/data/mockProducts";
import { toast } from "sonner";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

const categories = ["Infantil", "Feminino", "Masculino", "Tendência"];

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { addPost } = useContent();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const isCriador = user?.role === "criador";
  const connectedBrands = user?.connectedBrands || [];

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>(connectedBrands[0]?.slug || "");

  const steps = isCriador
    ? [
        { icon: Building2, label: "Fábrica" },
        { icon: Image, label: "Imagens" },
        { icon: Tag, label: "Produtos" },
        { icon: FileText, label: "Detalhes" },
      ]
    : [
        { icon: Image, label: "Imagens" },
        { icon: Tag, label: "Produtos" },
        { icon: FileText, label: "Detalhes" },
      ];

  const totalSteps = steps.length;
  const brandStep = isCriador ? 0 : -1;
  const imageStep = isCriador ? 1 : 0;
  const productsStep = isCriador ? 2 : 1;
  const detailsStep = isCriador ? 3 : 2;

  const selectedBrand = brands.find((b) => b.slug === selectedBrandSlug);

  const reset = () => {
    setStep(0);
    setImages([]);
    setLinkedProducts([]);
    setTitle("");
    setCategory(categories[0]);
    setSelectedBrandSlug(connectedBrands[0]?.slug || "");
  };

  const handleFiles = (files: FileList) => {
    const remaining = 4 - images.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => setImages((prev) => [...prev, e.target?.result as string].slice(0, 4));
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = () => {
    if (!images.length || !title || !user) return;
    const brandName = isCriador && selectedBrand ? selectedBrand.name : user.name;
    const brandLogo = isCriador && selectedBrand ? selectedBrand.logo : "";
    addPost({
      title,
      category,
      brandName,
      brandLogo,
      images,
      linkedProducts,
    });
    toast.success("Post publicado no feed!");
    reset();
    onClose();
  };

  const canNext = () => {
    if (step === brandStep) return !!selectedBrandSlug;
    if (step === imageStep) return images.length > 0;
    if (step === productsStep) return true;
    if (step === detailsStep) return !!title;
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
            <h2 className="text-base font-semibold text-foreground">Criar Post</h2>
            <button onClick={() => { reset(); onClose(); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Steps */}
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
            {step === brandStep && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecione a fábrica para vincular ao seu post.</p>
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

            {/* Step: Upload images */}
            {step === imageStep && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Envie até 4 imagens para o feed.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                />
                {images.length < 4 && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-accent/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clique ou arraste imagens</span>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden aspect-square">
                        <img src={img} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1.5 right-1.5 rounded-full bg-foreground/60 p-1 text-background hover:bg-foreground/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Link products */}
            {step === productsStep && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Vincule produtos ao post para que os lojistas possam comprar.</p>
                <ProductLinker selected={linkedProducts} onChange={setLinkedProducts} />
              </div>
            )}

            {/* Step: Details */}
            {step === detailsStep && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Título</label>
                  <Input
                    placeholder="Ex: Coleção Inverno Kids 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          category === cat
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img src={images[0]} alt="Preview" className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground">{title || "Título..."}</p>
                      <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {category}
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

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-card px-5 py-3">
            <Button variant="ghost" size="sm" onClick={() => step > 0 ? setStep(step - 1) : (reset(), onClose())}>
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
