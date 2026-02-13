import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "O que é a Vyral?",
    a: "A Vyral é uma plataforma de inteligência para TikTok Shop. Rastreamos produtos e vídeos virais em tempo real para que você possa copiar estratégias que já estão vendendo milhares de reais.",
  },
  {
    q: "Como a Vyral encontra os produtos virais?",
    a: "Utilizamos algoritmos avançados e IA para monitorar o TikTok Shop, identificando produtos com crescimento explosivo de vendas, vídeos com alto engajamento e tendências emergentes.",
  },
  {
    q: "Preciso ter experiência com TikTok Shop?",
    a: "Não! A Vyral foi feita tanto para iniciantes quanto para vendedores experientes. Nossa plataforma é intuitiva e fornece dados claros para você tomar decisões inteligentes.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim, você pode cancelar sua assinatura a qualquer momento diretamente no painel. Sem multas, sem burocracia.",
  },
  {
    q: "Com que frequência os dados são atualizados?",
    a: "Os dados são atualizados diariamente. Planos Pro e Business recebem atualizações em tempo real para máxima vantagem competitiva.",
  },
  {
    q: "Existe um período de teste gratuito?",
    a: "Oferecemos uma garantia de 7 dias. Se não gostar, devolvemos 100% do seu investimento sem perguntas.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            Perguntas <span className="text-gradient">Frequentes</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass rounded-xl px-6 border-none">
                <AccordionTrigger className="font-display font-semibold text-left hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
