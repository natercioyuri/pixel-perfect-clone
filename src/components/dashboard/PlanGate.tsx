import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUserPlan } from "@/hooks/useUserPlan";
import { canAccessFeature } from "@/lib/plans";
import type { ReactNode } from "react";

interface PlanGateProps {
  feature: "transcriptions" | "aiScripts" | "alerts";
  children: ReactNode;
  featureName?: string;
  minPlan?: string;
}

const PlanGate = ({ feature, children, featureName, minPlan = "Pro" }: PlanGateProps) => {
  const { data: userPlan } = useUserPlan();
  const hasAccess = canAccessFeature(userPlan || "free", feature);

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">
            {featureName || "Recurso Premium"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este recurso está disponível a partir do plano {minPlan}. Faça upgrade para desbloquear todas as funcionalidades.
          </p>
          <Link to="/pricing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Ver Planos
            </Button>
          </Link>
        </div>
      </div>
      <div className="pointer-events-none opacity-30 select-none">
        {children}
      </div>
    </div>
  );
};

export default PlanGate;
