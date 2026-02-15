import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => (
  <div className="min-h-screen bg-background py-16 px-6">
    <div className="max-w-3xl mx-auto">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </Link>

      <h1 className="font-display text-3xl font-bold mb-8">Política de Privacidade</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
        <p><strong className="text-foreground">Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="font-display text-lg font-semibold text-foreground">1. Dados Coletados</h2>
        <p>Coletamos as seguintes informações: nome completo, endereço de email, dados de pagamento (processados pelo Stripe — não armazenamos dados de cartão), e dados de uso da plataforma.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">2. Base Legal (LGPD)</h2>
        <p>O tratamento de dados pessoais é realizado com base no consentimento do titular (Art. 7º, I da LGPD) e na execução do contrato de prestação de serviço (Art. 7º, V da LGPD).</p>

        <h2 className="font-display text-lg font-semibold text-foreground">3. Finalidade do Tratamento</h2>
        <p>Seus dados são utilizados para: (a) prestação do serviço contratado; (b) processamento de pagamentos; (c) comunicações sobre o serviço; (d) melhoria da plataforma.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">4. Compartilhamento de Dados</h2>
        <p>Seus dados podem ser compartilhados com: Stripe (processamento de pagamentos) e provedores de infraestrutura (hospedagem). Não vendemos seus dados a terceiros.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">5. Direitos do Titular</h2>
        <p>Conforme a LGPD, você tem direito a: (a) confirmar a existência de tratamento; (b) acessar seus dados; (c) corrigir dados incompletos; (d) solicitar anonimização ou eliminação; (e) portabilidade; (f) revogar consentimento.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">6. Retenção de Dados</h2>
        <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, os dados são removidos em até 30 dias, exceto quando a retenção for exigida por lei.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">7. Segurança</h2>
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (TLS/SSL), controle de acesso e monitoramento contínuo.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">8. Cookies</h2>
        <p>Utilizamos cookies essenciais para manter sua sessão autenticada. Não utilizamos cookies de rastreamento publicitário.</p>

        <h2 className="font-display text-lg font-semibold text-foreground">9. Contato do Encarregado (DPO)</h2>
        <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato: privacidade@vyral.com.br</p>
      </div>
    </div>
  </div>
);

export default Privacy;
