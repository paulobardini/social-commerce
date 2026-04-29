import { Link, useLocation } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { StartLogo } from "../components/StartLogo";
import { startClasses } from "../styles/tokens";

export default function StartNotFound() {
  const location = useLocation();
  return (
    <div className="font-['Inter'] min-h-screen bg-white flex flex-col">
      <header className="border-b border-[rgba(0,0,0,0.08)] px-6 py-4">
        <Link to="/start/inicio"><StartLogo size={20} /></Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-5">
            <Compass size={40} className="text-[#1D9E75]" />
          </div>
          <p className="text-[12px] uppercase tracking-wider text-[#A0A0A0] font-semibold">Erro 404</p>
          <h1 className="text-[26px] font-semibold mt-2 leading-tight">Página não encontrada</h1>
          <p className="text-[14px] text-[#6B6B6B] mt-2">
            A página <code className="bg-[#F8F8F6] px-1.5 py-0.5 rounded text-[12px]">{location.pathname}</code> não existe ou foi movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
            <Link to="/start/inicio" className={startClasses.btnPrimary}>
              <ArrowLeft size={14} /> Voltar ao início
            </Link>
            <Link to="/start/catalogo" className={startClasses.btnSecondary}>
              Ir para o catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
