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
import PoliticasComerciaisPage from "./pages/vendedor/PoliticasComerciaisPage";
import ClientesListing from "./pages/vendedor/ClientesListing";
import Cliente360Page from "./pages/vendedor/Cliente360Page";
import Nextil360Hub from "./pages/vendedor/Nextil360Hub";
import PedidosHub from "./pages/vendedor/PedidosHub";
import { PedidosProvider } from "./contexts/PedidosContext";
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
import GestorAprovacoes from "./pages/vendedor/GestorAprovacoes";
import RelatoriosCentral from "./pages/vendedor/RelatoriosCentral";
import ReportBuilder from "./pages/vendedor/ReportBuilder";
import RelatorioViewer from "./pages/vendedor/RelatorioViewer";
// InsightsPage foi fundida em DashboardGerencial (aba Decisões) — rota redireciona.
import VisoesSalvasPage from "./pages/vendedor/VisoesSalvasPage";
import AutomacoesPage from "./pages/vendedor/AutomacoesPage";
import AtendimentoPage from "./pages/vendedor/AtendimentoPage";
import AtendimentoWhatsApp from "./pages/vendedor/AtendimentoWhatsApp";
import MessageTemplatesPage from "./pages/vendedor/MessageTemplatesPage";
import CatalogoVendedor from "./pages/vendedor/CatalogoVendedor";
import { AutomacoesProvider } from "@/contexts/AutomacoesContext";
import { MetasProvider } from "@/contexts/MetasContext";
import { MessageTemplatesProvider } from "@/contexts/MessageTemplatesContext";
import { TarefasProvider } from "@/contexts/TarefasContext";
import { PlanosProvider } from "@/contexts/PlanosContext";
import { RemindersProvider } from "@/contexts/RemindersContext";
import { StartAuthProvider } from "@/start/contexts/StartAuthContext";
import { StartDataProvider } from "@/start/contexts/StartDataContext";
import { StartCartProvider } from "@/start/contexts/StartCartContext";
import { StartProtectedRoute } from "@/start/components/StartProtectedRoute";
import { StartLayout } from "@/start/components/StartLayout";
import StartLogin from "@/start/pages/StartLogin";
import StartCadastro from "@/start/pages/StartCadastro";
import StartOnboarding from "@/start/pages/StartOnboarding";
import StartInicio from "@/start/pages/StartInicio";
import StartCatalogo from "@/start/pages/StartCatalogo";
import StartProdutoForm from "@/start/pages/StartProdutoForm";
import StartPedidos from "@/start/pages/StartPedidos";
import StartPedidoDetalhe from "@/start/pages/StartPedidoDetalhe";
import StartCompradores from "@/start/pages/StartCompradores";
import StartCompradorDetalhe from "@/start/pages/StartCompradorDetalhe";
import StartCompradorNovo from "@/start/pages/StartCompradorNovo";
import StartVitrine from "@/start/pages/StartVitrine";
import StartVitrineProduto from "@/start/pages/StartVitrineProduto";
import StartVitrinePedido from "@/start/pages/StartVitrinePedido";
import StartVitrineSucesso from "@/start/pages/StartVitrineSucesso";
import StartVitrineConfig from "@/start/pages/StartVitrineConfig";
import StartConfiguracoes from "@/start/pages/StartConfiguracoes";
import StartPlanos from "@/start/pages/StartPlanos";
import StartNotFound from "@/start/pages/StartNotFound";
import { Navigate } from "react-router-dom";
import OrcamentoPublico from "./pages/orcamento/OrcamentoPublico";
import NotFound from "./pages/NotFound";

// Marketing module
import { MarketingProviders } from "@/marketing/contexts/MarketingProviders";
import { RecomendacoesProvider } from "@/contexts/RecomendacoesContext";
import VisaoGeralIM from "./pages/inteligencia/VisaoGeral";
import RadarProdutosIM from "./pages/inteligencia/RadarProdutos";
import ProdutoDetalheIM from "./pages/inteligencia/ProdutoDetalhe";
import RecomendacoesIM from "./pages/inteligencia/Recomendacoes";
import ComparativosIM from "./pages/inteligencia/Comparativos";
import FornecedoresIM from "./pages/inteligencia/Fornecedores";
import ColecoesIM from "./pages/inteligencia/Colecoes";
import RelatoriosIM from "./pages/inteligencia/Relatorios";
import CentralVendasPage from "@/marketing/pages/CentralVendasPage";
import { MarketingLayout } from "@/marketing/components/MarketingLayout";
import MarketingDashboard from "@/marketing/pages/MarketingDashboard";
import MetaAdsHub from "@/marketing/pages/MetaAdsHub";
import MetaCampaignDetail from "@/marketing/pages/MetaCampaignDetail";
import AtribuicaoPage from "@/marketing/pages/AtribuicaoPage";
import IntegracoesPage from "@/marketing/pages/IntegracoesPage";
import CampanhasPage from "@/marketing/pages/CampanhasPage";
import CampanhaDetalhePage from "@/marketing/pages/CampanhaDetalhePage";
import { ConfiguracoesPage } from "@/marketing/pages/PlaceholderPages";
import { AudienciasPage } from "@/marketing/pages/AudienciasPage";
import HandoffPage from "@/marketing/pages/HandoffPage";
import JornadasPage from "@/marketing/pages/JornadasPage";
import JornadaEditorPage from "@/marketing/pages/JornadaEditorPage";
import LookbooksPage from "@/marketing/pages/LookbooksPage";
import LookbookEditorPage from "@/marketing/pages/LookbookEditorPage";
import LookbookPublicoPage from "@/marketing/pages/LookbookPublicoPage";
import { CockpitProvider } from "@/cockpit/contexts/CockpitContext";
import { AtendimentoComercialProvider } from "@/contexts/AtendimentoComercialContext";
import AtendimentoComercial from "./pages/vendedor/AtendimentoComercial";
import AtendimentoConfigPage from "./pages/vendedor/AtendimentoConfigPage";
import LeadsAtendimentoPage from "@/marketing/pages/LeadsAtendimentoPage";

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
            <MessageTemplatesProvider>
            <TarefasProvider>
            <PlanosProvider>
            <RemindersProvider>
            <PedidosProvider>
            <RecomendacoesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CartDrawer />
              <StartAuthProvider>
              <StartDataProvider>
              <StartCartProvider>
              <CockpitProvider>
              <AtendimentoComercialProvider>
              <Routes>
                {/* Bare pages (no sidebar/topbar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/proposta/:id" element={<OrcamentoPublico />} />

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
                <Route path="/vendedor/catalogo" element={<LayoutRoute><CatalogoVendedor /></LayoutRoute>} />
                <Route path="/vendedor/orcamento/:id" element={<LayoutRoute><NovoOrcamento /></LayoutRoute>} />
                <Route path="/vendedor/grade" element={<LayoutRoute><GradeEdicao /></LayoutRoute>} />
                <Route path="/vendedor/carteira-antiga" element={<LayoutRoute><VendedorCarteira /></LayoutRoute>} />
                <Route path="/vendedor/orcamento-viewer" element={<LayoutRoute><OrcamentoViewer /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes" element={<LayoutRoute><VendedorConfiguracoes /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes/automacoes" element={<LayoutRoute><AutomacoesPage /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes/templates" element={<LayoutRoute><MessageTemplatesPage /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes/politicas" element={<LayoutRoute><PoliticasComerciaisPage /></LayoutRoute>} />
                <Route path="/vendedor/clientes" element={<LayoutRoute><ClientesListing /></LayoutRoute>} />
                <Route path="/vendedor/clientes/kanban" element={<LayoutRoute><KanbanClientesPage /></LayoutRoute>} />
                <Route path="/vendedor/clientes/kanban/config" element={<LayoutRoute><FunilClientesConfigPage /></LayoutRoute>} />
                <Route path="/vendedor/clientes/redistribuir" element={<LayoutRoute><RedistribuicaoPage /></LayoutRoute>} />
                <Route path="/vendedor/360" element={<LayoutRoute><Nextil360Hub /></LayoutRoute>} />
                <Route path="/vendedor/360/pedidos" element={<LayoutRoute><PedidosHub /></LayoutRoute>} />
                <Route path="/vendedor/360/:id" element={<LayoutRoute><Cliente360Page /></LayoutRoute>} />
                <Route path="/vendedor/whatsapp" element={<FullHeightRoute><WhatsAppInbox /></FullHeightRoute>} />
                <Route path="/vendedor/tarefas" element={<LayoutRoute><TarefasPage /></LayoutRoute>} />
                <Route path="/vendedor/atendimento" element={<LayoutRoute><AtendimentoPage /></LayoutRoute>} />
                <Route path="/vendedor/atendimento-comercial" element={<LayoutRoute><AtendimentoComercial /></LayoutRoute>} />
                <Route path="/vendedor/configuracoes/atendimento" element={<LayoutRoute><AtendimentoConfigPage /></LayoutRoute>} />
                <Route path="/vendedor/atendimento/whatsapp" element={<FullHeightRoute><AtendimentoWhatsApp /></FullHeightRoute>} />
                <Route path="/vendedor/agenda" element={<LayoutRoute><AgendaPage /></LayoutRoute>} />
                <Route path="/vendedor/carteira" element={<LayoutRoute><CarteiraPage /></LayoutRoute>} />
                <Route path="/vendedor/representantes" element={<LayoutRoute><RepresentantesPage /></LayoutRoute>} />
                <Route path="/vendedor/representantes/:id" element={<LayoutRoute><RepresentanteDetalhePage /></LayoutRoute>} />
                <Route path="/vendedor/segmentacoes" element={<LayoutRoute><SegmentacoesPage /></LayoutRoute>} />
                <Route path="/vendedor/dashboard-gerencial" element={<Navigate to="/gestor/painel" replace />} />
                <Route path="/gestor/painel" element={<LayoutRoute><DashboardGerencial /></LayoutRoute>} />
                <Route path="/gestor/aprovacoes" element={<LayoutRoute><GestorAprovacoes /></LayoutRoute>} />
                <Route path="/vendedor/relatorios" element={<LayoutRoute><RelatoriosCentral /></LayoutRoute>} />
                <Route path="/vendedor/relatorios/novo" element={<LayoutRoute><ReportBuilder /></LayoutRoute>} />
                <Route path="/vendedor/relatorios/:id" element={<LayoutRoute><RelatorioViewer /></LayoutRoute>} />
                <Route path="/vendedor/insights" element={<Navigate to="/gestor/aprovacoes" replace />} />
                <Route path="/vendedor/visoes-salvas" element={<LayoutRoute><VisoesSalvasPage /></LayoutRoute>} />


                {/* Nextil Inteligência de Mercado */}
                <Route path="/inteligencia-mercado" element={<LayoutRoute><VisaoGeralIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/radar-produtos" element={<LayoutRoute><RadarProdutosIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/produto/:sku" element={<LayoutRoute><ProdutoDetalheIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/recomendacoes" element={<LayoutRoute><RecomendacoesIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/comparativos" element={<LayoutRoute><ComparativosIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/fornecedores" element={<LayoutRoute><FornecedoresIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/colecoes" element={<LayoutRoute><ColecoesIM /></LayoutRoute>} />
                <Route path="/inteligencia-mercado/relatorios" element={<LayoutRoute><RelatoriosIM /></LayoutRoute>} />

                {/* Nextil Start - Vitrine pública (não autenticada) */}
                <Route path="/vitrine/:slug" element={<StartVitrine />} />
                <Route path="/vitrine/:slug/produto/:id" element={<StartVitrineProduto />} />
                <Route path="/vitrine/:slug/pedido" element={<StartVitrinePedido />} />
                <Route path="/vitrine/:slug/pedido/sucesso" element={<StartVitrineSucesso />} />

                {/* Nextil Start - área pública */}
                <Route path="/start" element={<Navigate to="/start/inicio" replace />} />
                <Route path="/start/login" element={<StartLayout bare><StartLogin /></StartLayout>} />
                <Route path="/start/cadastro" element={<StartLayout bare><StartCadastro /></StartLayout>} />

                {/* Nextil Start - área autenticada */}
                <Route path="/start/onboarding" element={<StartProtectedRoute><StartLayout bare><StartOnboarding /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/inicio" element={<StartProtectedRoute><StartLayout><StartInicio /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/catalogo" element={<StartProtectedRoute><StartLayout><StartCatalogo /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/catalogo/novo" element={<StartProtectedRoute><StartLayout><StartProdutoForm /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/catalogo/:id" element={<StartProtectedRoute><StartLayout><StartProdutoForm /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/pedidos" element={<StartProtectedRoute><StartLayout><StartPedidos /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/pedidos/:id" element={<StartProtectedRoute><StartLayout><StartPedidoDetalhe /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/compradores" element={<StartProtectedRoute><StartLayout><StartCompradores /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/compradores/novo" element={<StartProtectedRoute><StartLayout><StartCompradorNovo /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/compradores/:id" element={<StartProtectedRoute><StartLayout><StartCompradorDetalhe /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/vitrine-config" element={<StartProtectedRoute><StartLayout><StartVitrineConfig /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/configuracoes" element={<StartProtectedRoute><StartLayout><StartConfiguracoes /></StartLayout></StartProtectedRoute>} />
                <Route path="/start/planos" element={<StartProtectedRoute><StartLayout><StartPlanos /></StartLayout></StartProtectedRoute>} />

                {/* Catch-all específico do Start */}
                <Route path="/start/*" element={<StartNotFound />} />

                {/* Módulo Marketing */}
                <Route path="/marketing" element={<Navigate to="/marketing/dashboard" replace />} />
                <Route path="/marketing/dashboard" element={<MarketingProviders><MarketingLayout><MarketingDashboard /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/central-vendas" element={<MarketingProviders><MarketingLayout><CentralVendasPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/meta-ads" element={<MarketingProviders><MarketingLayout><MetaAdsHub /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/meta-ads/:id" element={<MarketingProviders><MarketingLayout><MetaCampaignDetail /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/atribuicao" element={<MarketingProviders><MarketingLayout><AtribuicaoPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/campanhas" element={<MarketingProviders><MarketingLayout><CampanhasPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/campanhas/:id" element={<MarketingProviders><MarketingLayout><CampanhaDetalhePage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/jornadas" element={<MarketingProviders><MarketingLayout><JornadasPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/jornadas/:id" element={<MarketingProviders><MarketingLayout><JornadaEditorPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/lookbooks" element={<MarketingProviders><MarketingLayout><LookbooksPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/lookbooks/:id" element={<MarketingProviders><MarketingLayout><LookbookEditorPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/publico/lookbook/:slug" element={<MarketingProviders><LookbookPublicoPage /></MarketingProviders>} />
                <Route path="/marketing/audiencias" element={<MarketingProviders><MarketingLayout><AudienciasPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/handoff" element={<MarketingProviders><MarketingLayout><HandoffPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/integracoes" element={<MarketingProviders><MarketingLayout><IntegracoesPage /></MarketingLayout></MarketingProviders>} />
                <Route path="/marketing/configuracoes" element={<MarketingProviders><MarketingLayout><ConfiguracoesPage /></MarketingLayout></MarketingProviders>} />


                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </AtendimentoComercialProvider>
              </CockpitProvider>
              </StartCartProvider>
              </StartDataProvider>
              </StartAuthProvider>
            </BrowserRouter>
            </RecomendacoesProvider>
            </PedidosProvider>
            </RemindersProvider>
            </PlanosProvider>
            </TarefasProvider>
            </MessageTemplatesProvider>
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
