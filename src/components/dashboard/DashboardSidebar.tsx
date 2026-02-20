import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap, TrendingUp, Video, Heart, BarChart3, LogOut, Settings, Trophy, Clapperboard, Menu, X, CreditCard, Store, Users,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DashboardSidebarProps {
  onSignOut: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardSidebar = ({ onSignOut, activeTab = "products", onTabChange }: DashboardSidebarProps) => {
  const { data: isAdmin } = useIsAdmin();
  const { data: userPlan } = useUserPlan();
  const isPaidPlan = userPlan && userPlan !== "free";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const navItems = [
    { id: "explore", icon: Zap, label: "Explorar" },
    { id: "products", icon: TrendingUp, label: "Produtos Virais" },
    { id: "videos", icon: Video, label: "Vídeos Virais" },
    { id: "shops", icon: Store, label: "Lojas / Concorrentes" },
    { id: "creators", icon: Users, label: "Criadores" },
    { id: "ranking", icon: Trophy, label: "Ranking" },
    { id: "saved", icon: Heart, label: "Salvos" },
    { id: "analytics", icon: BarChart3, label: "Análises" },
    { id: "generate", icon: Clapperboard, label: "Roteiros por IA" },
  ];

  const handleTabChange = (id: string) => {
    onTabChange?.(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl font-bold">Vyral</span>
      </Link>

      <nav className="space-y-1 flex-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
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

      {isPaidPlan ? (
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Plano atual</p>
          <p className="font-display font-semibold text-primary capitalize">{userPlan}</p>
          <Button
            onClick={handleManageSubscription}
            size="sm"
            variant="outline"
            className="w-full mt-3 text-xs border-primary text-primary"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Gerenciar Assinatura
          </Button>
        </div>
      ) : (
        <div className="glass rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Plano atual</p>
          <p className="font-display font-semibold text-primary">Free</p>
          <Link to="/pricing">
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
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-lg p-2"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 glass border-r border-border p-6 flex flex-col z-40 transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-border p-6 hidden lg:flex flex-col z-40">
        {sidebarContent}
      </aside>
    </>
  );
};

export default DashboardSidebar;
