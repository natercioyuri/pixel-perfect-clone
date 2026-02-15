import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PLANS } from "@/lib/plans";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "47",
    period: "/mês",
    icon: Zap,
    description: "Perfeito para começar a espiar produtos virais.",
    features: [
      "Acesso a produtos virais",
      "50 buscas por dia",
      "Filtros básicos",
      "Dados de vendas estimadas",
      "Suporte por email",
    ],
    popular: false,
    cta: "Começar Agora",
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "97",
    period: "/mês",
    icon: Crown,
    description: "Para criadores que querem escalar suas vendas.",
    features: [
      "Tudo do Starter",
      "Buscas ilimitadas",
      "Filtros avançados",
      "Análise de vídeos virais",
      "Transcrição de vídeos",
      "Roteiros por IA",
      "Alertas de tendências",
      "Suporte prioritário",
    ],
    popular: true,
    cta: "Escolher Pro",
  },
  {
    key: "business" as const,
    name: "Business",
    price: "197",
    period: "/mês",
    icon: Rocket,
    description: "Para equipes e operações em escala.",
    features: [
      "Tudo do Pro",
      "API de acesso",
      "Múltiplos usuários",
      "Relatórios personalizados",
      "Dados em tempo real",
      "Gerente de conta dedicado",
      "Onboarding personalizado",
    ],
    popular: false,
    cta: "Falar com Vendas",
  },
];

const PricingSection = () => {
  const { user } = useAuth();
  const { data: userPlan } = useUserPlan();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async (planKey: string) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    const plan = PLANS[planKey as keyof typeof PLANS];
    if (!plan?.price_id) return;

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.price_id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Erro ao iniciar checkout", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="planos" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Planos</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3">
            Escolha o plano ideal <span className="text-gradient">para você</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isCurrentPlan = userPlan === plan.key;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`glass rounded-2xl p-8 relative flex flex-col ${
                  plan.popular ? "border-primary/50 glow-primary" : ""
                } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Mais Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Seu Plano
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={isCurrentPlan || loadingPlan === plan.key}
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {loadingPlan === plan.key ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                  ) : isCurrentPlan ? (
                    "Plano Atual"
                  ) : (
                    plan.cta
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
