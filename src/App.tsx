import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { CommentsProvider } from "@/contexts/CommentsContext";
import { CartDrawer } from "@/components/CartDrawer";
import Index from "./pages/Index";
import Explorar from "./pages/Explorar";
import Perfil from "./pages/Perfil";
import Marcas from "./pages/Marcas";
import MarcaDetalhe from "./pages/MarcaDetalhe";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Onboarding from "./pages/Onboarding";
import Vendedor from "./pages/Vendedor";
import VendedorOrcamentos from "./pages/vendedor/VendedorOrcamentos";
import NovoOrcamento from "./pages/vendedor/NovoOrcamento";
import GradeEdicao from "./pages/vendedor/GradeEdicao";
import VendedorCarteira from "./pages/vendedor/VendedorCarteira";
import OrcamentoViewer from "./pages/vendedor/OrcamentoViewer";
import VendedorDashboard from "./pages/vendedor/VendedorDashboard";
import VendedorOportunidades from "./pages/vendedor/VendedorOportunidades";
import OportunidadeDetalhe from "./pages/vendedor/OportunidadeDetalhe";
import VendedorConfiguracoes from "./pages/vendedor/VendedorConfiguracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ContentProvider>
          <CartProvider>
          <CommentsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CartDrawer />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/marcas" element={<Marcas />} />
                <Route path="/marca/:slug" element={<MarcaDetalhe />} />
                <Route path="/marca/:slug/produtos" element={<ProdutoDetalhe />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/vendedor-antigo" element={<Vendedor />} />
                <Route path="/vendedor" element={<VendedorOrcamentos />} />
                <Route path="/vendedor/dashboard" element={<VendedorDashboard />} />
                <Route path="/vendedor/oportunidades" element={<VendedorOportunidades />} />
                <Route path="/vendedor/oportunidades/nova" element={<VendedorOportunidades />} />
                <Route path="/vendedor/oportunidades/:id" element={<OportunidadeDetalhe />} />
                <Route path="/vendedor/novo-orcamento" element={<NovoOrcamento />} />
                <Route path="/vendedor/orcamento/:id" element={<NovoOrcamento />} />
                <Route path="/vendedor/grade" element={<GradeEdicao />} />
                <Route path="/vendedor/carteira" element={<VendedorCarteira />} />
                <Route path="/vendedor/orcamento-viewer" element={<OrcamentoViewer />} />
                <Route path="/vendedor/configuracoes" element={<VendedorConfiguracoes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CommentsProvider>
          </CartProvider>
        </ContentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
