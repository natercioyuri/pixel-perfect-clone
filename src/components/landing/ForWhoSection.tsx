import { motion } from "framer-motion";
import { ShoppingBag, Video, Palette, Users } from "lucide-react";

const audiences = [
  {
    icon: ShoppingBag,
    title: "Vendedores do TikTok Shop",
    description: "Encontre os produtos certos para vender e as estratégias que mais convertem na plataforma.",
  },
  {
    icon: Video,
    title: "Criadores de Conteúdo",
    description: "Descubra quais formatos de vídeo geram mais vendas e replique o que já funciona.",
  },
  {
    icon: Palette,
    title: "Dropshippers",
    description: "Identifique produtos com alta demanda e baixa concorrência antes de todo mundo.",
  },
  {
    icon: Users,
    title: "Agências e Gestores",
    description: "Monitore tendências e ofereça estratégias baseadas em dados reais para seus clientes.",
  },
];

const ForWhoSection = () => {
  return (
    <section id="para-quem" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_60%)]" />
      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Para quem é</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            Feito para quem quer <span className="text-gradient">vender mais</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 flex gap-4 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <a.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWhoSection;
