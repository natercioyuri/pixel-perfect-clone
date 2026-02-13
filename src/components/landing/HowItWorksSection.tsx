import { motion } from "framer-motion";
import { Search, BarChart3, Copy, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Descubra Produtos Virais",
    description: "Nossa IA rastreia milhares de produtos no TikTok Shop em tempo real, identificando os que mais vendem.",
    step: "01",
  },
  {
    icon: BarChart3,
    title: "Analise os Dados",
    description: "Veja métricas de vendas, visualizações, engajamento e receita estimada de cada produto e vídeo.",
    step: "02",
  },
  {
    icon: Copy,
    title: "Copie a Estratégia",
    description: "Acesse os vídeos que mais converteram e replique o formato, hashtags e abordagem que funcionam.",
    step: "03",
  },
  {
    icon: Rocket,
    title: "Escale Suas Vendas",
    description: "Com dados reais, pare de adivinhar e comece a vender com confiança usando estratégias comprovadas.",
    step: "04",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="funciona" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Como Funciona</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            Simples. Rápido. <span className="text-gradient">Lucrativo.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-6 group hover:border-primary/30 transition-all duration-300"
            >
              <span className="text-5xl font-display font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                {step.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mt-4 mb-4 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
