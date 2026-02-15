import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => (
  <div className="min-h-screen bg-background py-16 px-6">
    <div className="max-w-3xl mx-auto">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </Link>

      <h1 className="font-display text-3xl font-bold mb-8">Termos de Uso</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
        <p><strong className="text-foreground">Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="font-display text-lg font-semibold text-foreground">1. Aceitação dos Termos</h2>
        <p>Ao acessar e usar a plataforma Vyral ("Serviço"), você concorda com estes Termos de Uso. Se não concordar, não utilize o Serviço.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">2. Descrição do Serviço</h2>
        <p>A Vyral é uma plataforma de análise de tendências do TikTok Shop, oferecendo dados sobre produtos virais, vídeos e métricas de engajamento para fins informativos e de pesquisa.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">3. Cadastro e Conta</h2>
        <p>Você é responsável por manter a confidencialidade de sua conta e senha. Todas as atividades realizadas em sua conta são de sua responsabilidade.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">4. Planos e Pagamentos</h2>
        <p>Os planos são cobrados mensalmente via Stripe. Ao assinar, você autoriza a cobrança recorrente. Cancelamentos podem ser feitos a qualquer momento pelo portal de gerenciamento de assinatura, sem reembolso proporcional.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">5. Uso Aceitável</h2>
        <p>Você concorda em não: (a) usar o Serviço para atividades ilegais; (b) tentar acessar dados de outros usuários; (c) revender ou redistribuir os dados sem autorização; (d) sobrecarregar intencionalmente os servidores.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">6. Propriedade Intelectual</h2>
        <p>Todo o conteúdo, design e tecnologia da Vyral são protegidos por direitos autorais. Os dados exibidos são obtidos de fontes públicas e apresentados de forma agregada.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">7. Limitação de Responsabilidade</h2>
        <p>A Vyral não garante a precisão dos dados exibidos e não se responsabiliza por decisões comerciais baseadas nas informações fornecidas. O serviço é fornecido "como está".</p>

        <h2 className="font-display text-lg font-semibold text-foreground">8. Alterações</h2>
        <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas por email ou notificação na plataforma.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">9. Contato</h2>
        <p>Para dúvidas sobre estes termos, entre em contato pelo email: suporte@vyral.com.br</p>
      </div>
    </div>
  </div>
);

export default Terms;
