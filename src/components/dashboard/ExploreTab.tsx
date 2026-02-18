import { TrendingUp, Store, Users, Video, Crown, Flame } from "lucide-react";
import { motion } from "framer-motion";
import TopProductsSection from "./TopProductsSection";

interface ExploreTabProps {
  onNavigate: (tab: string) => void;
}

const featureCards = [
  {
    id: "products",
    title: "Produtos em Alta",
    description: "Quais produtos estão gerando dinheiro agora?",
    icon: TrendingUp,
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    id: "shops",
    title: "Lojas Concorrentes",
    description: "Quais lojas da sua categoria vendem mais?",
    icon: Store,
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    id: "creators",
    title: "Criadores Afiliados",
    description: "Encontre os melhores criadores por engajamento",
    icon: Users,
    gradient: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
  {
    id: "videos",
    title: "Vídeos Virais",
    description: "Qual vídeo está vendendo mais recentemente?",
    icon: Video,
    gradient: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-400",
  },
  {
    id: "ranking",
    title: "Ranking Semanal",
    description: "Top produtos por trending score",
    icon: Crown,
    gradient: "from-yellow-500/20 to-yellow-500/5",
    iconColor: "text-yellow-400",
  },
  {
    id: "analytics",
    title: "Análises & Insights",
    description: "Dados detalhados sobre o mercado",
    icon: Flame,
    gradient: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
  },
];

const ExploreTab = ({ onNavigate }: ExploreTabProps) => {
  return (
    <div className="space-y-8">
      {/* Feature Cards Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📖</span>
          <h2 className="font-display text-lg font-bold">Explorar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card, i) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigate(card.id)}
              className={`glass rounded-xl p-5 text-left hover:scale-[1.02] transition-all group bg-gradient-to-br ${card.gradient}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">
                    {card.title} →
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <card.icon className={`w-8 h-8 ${card.iconColor} opacity-60`} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Top Products Section */}
      <TopProductsSection />
    </div>
  );
};

export default ExploreTab;
