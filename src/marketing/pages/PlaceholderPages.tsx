import { ReactNode } from "react";
import { Construction } from "lucide-react";

interface Props { title: string; description: string; etapa: string; }

export function ComingSoonPage({ title, description, etapa }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
        <div className="h-14 w-14 rounded-full bg-accent/10 text-accent mx-auto flex items-center justify-center mb-3">
          <Construction className="h-7 w-7" />
        </div>
        <p className="text-sm font-medium text-foreground">Em construção</p>
        <p className="text-[12px] text-muted-foreground mt-1">Disponível na <strong>{etapa}</strong> do roadmap.</p>
      </div>
    </div>
  );
}


export function JornadasPage() { return <ComingSoonPage title="Jornadas automatizadas" description="Fluxos com gatilhos baseados em comportamento e atribuição Meta." etapa="Etapa 3" />; }
export function LookbooksPage() { return <ComingSoonPage title="Lookbooks digitais" description="Catálogos enviáveis com tracking, Pixel e ROI." etapa="Etapa 3" />; }
export function AudienciasPage() { return <ComingSoonPage title="Audiências" description="Sincronização com Meta Custom Audiences e Lookalike." etapa="Etapa 4" />; }
export function ConfiguracoesPage() { return <ComingSoonPage title="Configurações" description="Time, UTMs padrão, regras de atribuição e domínios." etapa="Etapa 4" />; }
