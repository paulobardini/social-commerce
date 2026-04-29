import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StartLogo } from "../components/StartLogo";
import { useStartAuth } from "../contexts/StartAuthContext";
import { startClasses } from "../styles/tokens";

export default function StartCadastro() {
  const navigate = useNavigate();
  const { signup } = useStartAuth();
  const [form, setForm] = useState({ nome: "", nomeFabrica: "", email: "", whatsapp: "", senha: "", confirmar: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) { setErr("Preencha os campos obrigatórios"); return; }
    if (form.senha !== form.confirmar) { setErr("As senhas não coincidem"); return; }
    setErr(null); setLoading(true);
    setTimeout(() => {
      signup({ nome: form.nome, nomeFabrica: form.nomeFabrica, email: form.email, whatsapp: form.whatsapp });
      navigate("/start/onboarding");
    }, 800);
  };

  return (
    <div className="font-['Inter'] min-h-screen flex items-center justify-center p-6 bg-[#F8F8F6]">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl p-8 border border-[rgba(0,0,0,0.06)]">
        <div className="text-center mb-6"><StartLogo size={22} /></div>
        <h1 className="text-[22px] font-medium mb-1 text-center">Criar conta grátis</h1>
        <p className="text-[13px] text-[#6B6B6B] mb-6 text-center">Comece a vender pelo digital em minutos</p>

        <div className="space-y-3">
          <div>
            <label className={startClasses.label}>Nome completo</label>
            <input className={startClasses.input} value={form.nome} onChange={setField("nome")} />
          </div>
          <div>
            <label className={startClasses.label}>Nome da fábrica/confecção</label>
            <input className={startClasses.input} value={form.nomeFabrica} onChange={setField("nomeFabrica")} />
          </div>
          <div>
            <label className={startClasses.label}>E-mail</label>
            <input type="email" className={startClasses.input} value={form.email} onChange={setField("email")} />
          </div>
          <div>
            <label className={startClasses.label}>WhatsApp</label>
            <input className={startClasses.input} placeholder="(00) 0 0000-0000" value={form.whatsapp} onChange={setField("whatsapp")} />
          </div>
          <div>
            <label className={startClasses.label}>Senha</label>
            <input type="password" className={startClasses.input} value={form.senha} onChange={setField("senha")} />
          </div>
          <div>
            <label className={startClasses.label}>Confirmar senha</label>
            <input type="password" className={startClasses.input} value={form.confirmar} onChange={setField("confirmar")} />
          </div>
        </div>

        {err && <p className="mt-3 text-[13px] text-[#A32D2D]">{err}</p>}

        <button type="submit" disabled={loading} className={`${startClasses.btnPrimary} w-full mt-5`}>
          {loading ? "Criando..." : "Criar conta grátis"}
        </button>

        <button type="button" onClick={() => navigate("/start/login")} className="w-full mt-3 text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A]">
          Já tenho conta — entrar
        </button>
      </form>
    </div>
  );
}
