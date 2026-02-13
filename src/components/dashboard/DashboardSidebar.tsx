import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap, TrendingUp, Video, Heart, BarChart3, LogOut, Settings, Trophy, Clapperboard,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUserPlan } from "@/hooks/useUserPlan";

interface DashboardSidebarProps {
  onSignOut: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardSidebar = ({ onSignOut, activeTab = "products", onTabChange }: DashboardSidebarProps) => {
  const { data: isAdmin } = useIsAdmin();
  const { data: userPlan } = useUserPlan();
  const isPaidPlan = userPlan && userPlan !== "free";
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-border p-6 hidden lg:flex flex-col z-40">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl font-bold">Vyral</span>
      </Link>

      <nav className="space-y-1 flex-1">
        {[
          { id: "products", icon: TrendingUp, label: "Produtos Virais" },
          { id: "videos", icon: Video, label: "Vídeos Virais" },
          { id: "ranking", icon: Trophy, label: "Ranking" },
          { id: "saved", icon: Heart, label: "Salvos" },
          { id: "analytics", icon: BarChart3, label: "Análises" },
          { id: "generate", icon: Clapperboard, label: "Gerar Vídeo IA" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange?.(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        {isAdmin && (
          <Link to="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary text-sm transition-colors">
            <Settings className="w-4 h-4" />
            Painel Admin
          </Link>
        )}
      </nav>

      {!isPaidPlan && (
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Plano atual</p>
          <p className="font-display font-semibold text-primary">Free</p>
          <Link to="/#planos">
            <Button size="sm" className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
              Fazer Upgrade
            </Button>
          </Link>
        </div>
      )}

      <button onClick={onSignOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </aside>
  );
};

export default DashboardSidebar;
