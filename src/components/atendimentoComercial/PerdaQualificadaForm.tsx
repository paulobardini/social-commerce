import { useMemo, useState } from "react";
import {
  MotivoPerdaNode, PerdaQualificada, calcularRetomarEm, defaultMotivosPerdaTree,
} from "@/data/mockAtendimentoComercial";

const MIN_EXPL = 15;

interface Props {
  tree?: MotivoPerdaNode[];
  onCancel?: () => void;
  onConfirm: (perda: Omit<PerdaQualificada, "registradoEm">) => void;
  compact?: boolean; // versão para inline (whats)
}

export function PerdaQualificadaForm({ tree = defaultMotivosPerdaTree, onCancel, onConfirm, compact }: Props) {
  const [motivo, setMotivo] = useState("");
  const [subMotivo, setSubMotivo] = useState("");
  const [explicacao, setExplicacao] = useState("");

  const nodeAtual = useMemo(() => tree.find(m => m.motivo === motivo), [tree, motivo]);
  const precisaSubmotivo = !!nodeAtual && nodeAtual.subMotivos.length > 0;

  const ok = !!motivo
    && (!precisaSubmotivo || !!subMotivo)
    && explicacao.trim().length >= MIN_EXPL;

  const submit = () => {
    if (!ok) return;
    const retomarEm = calcularRetomarEm(subMotivo);
    onConfirm({
      motivo,
      subMotivo: precisaSubmotivo ? subMotivo : undefined,
      explicacao: explicacao.trim(),
      retomarEm,
    });
  };

  const textSize = compact ? "text-[10px]" : "text-xs";
  const inputCls = `w-full ${textSize} bg-background border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring`;
  const labelCls = `${textSize} font-semibold uppercase tracking-wide text-muted-foreground`;

  return (
    <div className="space-y-2.5">
      <div>
        <label className={labelCls}>Motivo *</label>
        <select
          value={motivo}
          onChange={e => { setMotivo(e.target.value); setSubMotivo(""); }}
          className={`${inputCls} mt-1`}
        >
          <option value="">Selecione…</option>
          {tree.map(m => <option key={m.motivo} value={m.motivo}>{m.motivo}</option>)}
        </select>
      </div>

      {precisaSubmotivo && (
        <div>
          <label className={labelCls}>Sub-motivo *</label>
          <select
            value={subMotivo}
            onChange={e => setSubMotivo(e.target.value)}
            className={`${inputCls} mt-1`}
          >
            <option value="">Selecione…</option>
            {nodeAtual!.subMotivos.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className={labelCls}>Explicação * <span className="text-[10px] normal-case font-normal text-muted-foreground">(mín. {MIN_EXPL} caracteres)</span></label>
        <textarea
          value={explicacao}
          onChange={e => setExplicacao(e.target.value)}
          rows={compact ? 2 : 3}
          placeholder="Descreva o contexto — o que aconteceu e por quê?"
          className={`${inputCls} mt-1 resize-none`}
        />
        <div className="flex items-center justify-between mt-0.5">
          <span className={`${textSize} ${explicacao.trim().length >= MIN_EXPL ? "text-emerald-600" : "text-muted-foreground"}`}>
            {explicacao.trim().length}/{MIN_EXPL}
          </span>
          {subMotivo && calcularRetomarEm(subMotivo) && (
            <span className={`${textSize} text-amber-700`}>
              🗓 Sugerido retomar em {new Date(calcularRetomarEm(subMotivo)!).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button onClick={onCancel} className={`${textSize} px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground`}>
            Cancelar
          </button>
        )}
        <button
          disabled={!ok}
          onClick={submit}
          className={`${textSize} font-medium px-4 py-1.5 rounded-lg bg-rose-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Marcar como perdido
        </button>
      </div>
    </div>
  );
}
