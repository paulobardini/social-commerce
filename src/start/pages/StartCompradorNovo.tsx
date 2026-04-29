import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useStartData } from "../contexts/StartDataContext";
import { startClasses } from "../styles/tokens";
import { UFS } from "../data/mockStart";

export default function StartCompradorNovo() {
  const navigate = useNavigate();
  const { saveComprador } = useStartData();
  const [form, setForm] = useState({ loja: "", contato: "", whatsapp: "", cidade: "", estado: "PE" });

  const submit = () => {
    if (!form.loja || !form.contato) { toast.error("Preencha loja e contato"); return; }
    saveComprador({
      id: `c-${Date.now()}`,
      loja: form.loja, contato: form.contato, whatsapp: form.whatsapp,
      cidade: form.cidade, estado: form.estado, ultimoPedido: null,
    });
    toast.success("Comprador adicionado");
    navigate("/start/compradores");
  };

  return (
    <div className="max-w-md mx-auto space-y-5">
      <button onClick={() => navigate("/start/compradores")} className="text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-2">
        <ArrowLeft size={18} /> <span className="text-[14px]">Voltar</span>
      </button>
      <h1 className="text-[22px] font-medium">Novo comprador</h1>

      <div className="space-y-3">
        <div><label className={startClasses.label}>Nome da loja/empresa</label>
          <input className={startClasses.input} value={form.loja} onChange={e => setForm({ ...form, loja: e.target.value })} /></div>
        <div><label className={startClasses.label}>Contato (responsável)</label>
          <input className={startClasses.input} value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} /></div>
        <div><label className={startClasses.label}>WhatsApp</label>
          <input className={startClasses.input} value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={startClasses.label}>Cidade</label>
            <input className={startClasses.input} value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
          <div><label className={startClasses.label}>Estado</label>
            <select className={startClasses.input} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              {UFS.map(uf => <option key={uf}>{uf}</option>)}
            </select></div>
        </div>
      </div>

      <button onClick={submit} className={`${startClasses.btnPrimary} w-full`}>Salvar comprador</button>
    </div>
  );
}
