import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import nextilWordmark from "@/assets/nextil-wordmark.png";
import nextilLogo from "@/assets/nextil-logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-90" />
        <div className="relative z-10 p-12">
          <img src={nextilWordmark} alt="Nextil" className="h-10 mb-6 brightness-200" />
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            A plataforma que conecta lojistas às melhores marcas de moda do Brasil.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <img src={nextilLogo} alt="Nextil" className="h-8 w-8" />
            <img src={nextilWordmark} alt="Nextil" className="h-5" />
          </div>
          <div className="lg:flex lg:items-center lg:gap-2 lg:mb-10 hidden">
            <img src={nextilLogo} alt="Nextil" className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-8">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full h-11 rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite aqui"
                  className="w-full h-11 rounded-lg border border-input bg-background px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" className="mt-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Entrar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/cadastro" className="text-accent font-medium hover:underline">
              Cadastre-se como lojista e aproveite!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
