import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { StartLogo } from "../components/StartLogo";
import { useStartAuth } from "../contexts/StartAuthContext";
import { startClasses } from "../styles/tokens";

export default function StartLogin() {
  const navigate = useNavigate();
  const { login } = useStartAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pwd) {
      setErr("Preencha e-mail e senha");
      return;
    }
    setErr(null);
    setLoading(true);
    setTimeout(() => {
      login();
      navigate("/start/inicio");
    }, 800);
  };

  return (
    <div className="font-['Inter'] min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-[#E1F5EE] items-center justify-center p-12">
        <div className="max-w-sm">
          <StartLogo size={32} />
          <p className="mt-6 text-[20px] leading-snug text-[#0F6E56]">
            Sua fábrica no digital. Do jeito mais simples.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center"><StartLogo size={22} /></div>
          <h1 className="text-[24px] font-medium mb-1">Bem-vinda de volta</h1>
          <p className="text-[14px] text-[#6B6B6B] mb-6">Entre na sua conta</p>

          <label className={startClasses.label}>E-mail</label>
          <input className={startClasses.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />

          <label className={`${startClasses.label} mt-4`}>Senha</label>
          <div className="relative">
            <input className={startClasses.input} type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {err && <p className="mt-3 text-[13px] text-[#A32D2D]">{err}</p>}

          <button type="submit" disabled={loading} className={`${startClasses.btnPrimary} w-full mt-5`}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <button type="button" className="mt-3 w-full text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A]">
            Esqueci minha senha
          </button>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
            <span className="text-[12px] text-[#A0A0A0]">ou</span>
            <span className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
          </div>

          <button type="button" onClick={() => navigate("/start/cadastro")} className={`${startClasses.btnSecondary} w-full`}>
            Criar conta gratuita
          </button>
        </form>
      </div>
    </div>
  );
}
