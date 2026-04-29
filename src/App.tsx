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
import { AppLayout } from "@/components/AppLayout";
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
import ClientesListing from "./pages/vendedor/ClientesListing";
import Cliente360Page from "./pages/vendedor/Cliente360Page";
import WhatsAppInbox from "./pages/vendedor/WhatsAppInbox";
import TarefasPage from "./pages/vendedor/TarefasPage";
import AgendaPage from "./pages/vendedor/AgendaPage";
import KanbanClientesPage from "./pages/vendedor/KanbanClientesPage";
import CarteiraPage from "./pages/vendedor/CarteiraPage";
import RepresentantesPage from "./pages/vendedor/RepresentantesPage";
import RepresentanteDetalhePage from "./pages/vendedor/RepresentanteDetalhePage";
import RedistribuicaoPage from "./pages/vendedor/RedistribuicaoPage";
import SegmentacoesPage from "./pages/vendedor/SegmentacoesPage";
import FunilClientesConfigPage from "./pages/vendedor/FunilClientesConfigPage";
import DashboardGerencial from "./pages/vendedor/DashboardGerencial";
import RelatoriosCentral from "./pages/vendedor/RelatoriosCentral";
import ReportBuilder from "./pages/vendedor/ReportBuilder";
import RelatorioViewer from "./pages/vendedor/RelatorioViewer";
import InsightsPage from "./pages/vendedor/InsightsPage";
import VisoesSalvasPage from "./pages/vendedor/VisoesSalvasPage";
import AutomacoesPage from "./pages/vendedor/AutomacoesPage";
import { AutomacoesProvider } from "@/contexts/AutomacoesContext";
import { MetasProvider } from "@/contexts/MetasContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LayoutRoute({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

function FullHeightRoute({ children }: { children: React.ReactNode }) {
  return <AppLayout fullHeight>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ContentProvider>
          <CartProvider>
          <CommentsProvider>
            <AutomacoesProvider>
            <MetasProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CartDrawer />
              <Routes>
                {/* Bare pages (no sidebar/topbar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Consumer pages */}
                <Route path="/" element={<LayoutRoute><Index /></LayoutRoute>} />
                <Route path="/explorar" element={<LayoutRoute><Explorar /></LayoutRoute>} />
                <Route path="/perfil" element={<LayoutRoute><Perfil /></LayoutRoute>} />
                <Route path="/marcas" element={<LayoutRoute><Marcas /></LayoutRoute>} />
                <Route path="/marca/:slug" element={<LayoutRoute><MarcaDetalhe /></LayoutRoute>} />
                <Route path="/marca/:slug/produtos" element={<LayoutRoute><ProdutoDetalhe /></LayoutRoute>} />
                <Route path="/checkout" element={<LayoutRoute><Checkout /></LayoutRoute>} />
                <Route path="/vendedor-antigo" element={<LayoutRoute><Vendedor /></LayoutRoute>} />

                {/* CRM pages */}
                <Route path="/vendedor" element={<LayoutRoute><VendedorOrcamentos /></LayoutRoute>} />
                <Route path="/vendedor/dashboard" element={<LayoutRoute><VendedorDashboard /></LayoutRoute>} />
                <Route path="/vendedor/oportunidades" element={<LayoutRoute><VendedorOportunidades /></LayoutRoute>} />
                <Route path="/vendedor/oportunidades/nova" element={<LayoutRoute><VendedorOportunidades /></LayoutRoute>} />
                <Route path="/vendedor/oportunidades/:id" element={<LayoutRoute><OportunidadeDetalhe /></LayoutRoute>} />
                <Route path="/vendedor/novo-orcamento" element={<LayoutRoute><NovoOrcamento /></LayoutRoute>} />
                <Route path="/vendedor/orcamento/:id" element={<LayoutRoute><NovoOrcamento /></LayoutRoute>} />
                <Route path="/vendedor/grade" element={<LayoutRoute><GradeEdicao /></LayoutRoute>} />
                <Route path="/vendedor/carteira-antiga" element={<LayoutRoute><VendedorCarteira /></LayoutRoute>} />
                <Route path="/vendedor/orcamento-viewer" element={<LayoutRoute><OrcamentoViewer /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes" element={<LayoutRoute><VendedorConfiguracoes /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes/automacoes" element={<LayoutRoute><AutomacoesPage /></LayoutRoute>} />
                <Route path="/vendedor/clientes" element={<LayoutRoute><ClientesListing /></LayoutRoute>} />
                <Route path="/vendedor/clientes/kanban" element={<LayoutRoute><KanbanClientesPage /></LayoutRoute>} />
                <Route path="/vendedor/clientes/kanban/config" element={<LayoutRoute><FunilClientesConfigPage /></LayoutRoute>} />
                <Route path="/vendedor/clientes/redistribuir" element={<LayoutRoute><RedistribuicaoPage /></LayoutRoute>} />
                <Route path="/vendedor/360/:id" element={<LayoutRoute><Cliente360Page /></LayoutRoute>} />
                <Route path="/vendedor/whatsapp" element={<FullHeightRoute><WhatsAppInbox /></FullHeightRoute>} />
                <Route path="/vendedor/tarefas" element={<LayoutRoute><TarefasPage /></LayoutRoute>} />
                <Route path="/vendedor/agenda" element={<LayoutRoute><AgendaPage /></LayoutRoute>} />
                <Route path="/vendedor/carteira" element={<LayoutRoute><CarteiraPage /></LayoutRoute>} />
                <Route path="/vendedor/representantes" element={<LayoutRoute><RepresentantesPage /></LayoutRoute>} />
                <Route path="/vendedor/representantes/:id" element={<LayoutRoute><RepresentanteDetalhePage /></LayoutRoute>} />
                <Route path="/vendedor/segmentacoes" element={<LayoutRoute><SegmentacoesPage /></LayoutRoute>} />
                <Route path="/vendedor/dashboard-gerencial" element={<LayoutRoute><DashboardGerencial /></LayoutRoute>} />
                <Route path="/vendedor/relatorios" element={<LayoutRoute><RelatoriosCentral /></LayoutRoute>} />
                <Route path="/vendedor/relatorios/novo" element={<LayoutRoute><ReportBuilder /></LayoutRoute>} />
                <Route path="/vendedor/relatorios/:id" element={<LayoutRoute><RelatorioViewer /></LayoutRoute>} />
                <Route path="/vendedor/insights" element={<LayoutRoute><InsightsPage /></LayoutRoute>} />
                <Route path="/vendedor/visoes-salvas" element={<LayoutRoute><VisoesSalvasPage /></LayoutRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </MetasProvider>
            </AutomacoesProvider>
          </CommentsProvider>
          </CartProvider>
        </ContentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
