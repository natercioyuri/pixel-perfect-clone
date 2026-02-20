import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Video, TrendingUp, Sparkles, Store, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    icon: ShoppingCart,
    title: "Produtos Virais",
    description: "Descubra os produtos que estão bombando no TikTok Shop com dados de vendas, receita e tendências em tempo real.",
    tip: "💡 Comece clicando em 'Atualizar Dados' para popular o painel.",
  },
  {
    icon: Video,
    title: "Vídeos & Transcrições",
    description: "Analise vídeos virais, veja métricas de engajamento e transcreva o conteúdo para criar seus próprios roteiros.",
    tip: "💡 Use os filtros para separar vídeos nacionais e internacionais.",
  },
  {
    icon: Store,
    title: "Lojas & Criadores",
    description: "Veja o ranking das melhores lojas e encontre os criadores com maior engajamento para parcerias estratégicas.",
    tip: "💡 Disponível nos planos Pro e Business.",
  },
  {
    icon: TrendingUp,
    title: "Ranking & Analytics",
    description: "Acompanhe o ranking dos produtos mais quentes e veja análises detalhadas para tomar decisões estratégicas.",
    tip: "💡 Exporte dados em CSV para trabalhar offline.",
  },
  {
    icon: Sparkles,
    title: "Roteiros por IA",
    description: "Gere roteiros de vídeo otimizados com inteligência artificial baseados nos vídeos virais que mais convertem.",
    tip: "💡 Disponível a partir do plano Pro.",
  },
];

const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("vyral_onboarding_seen");
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("vyral_onboarding_seen", "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="glass border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="text-gradient">Bem-vindo ao Vyral! 🚀</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Passo {step + 1} de {steps.length} — Conheça a plataforma
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <current.icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{current.description}</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-primary">{current.tip}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-primary w-6" : i < step ? "bg-primary/50" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">
              Pular
            </Button>
            <Button size="sm" onClick={handleNext} className="bg-primary text-primary-foreground">
              {step < steps.length - 1 ? (
                <>Próximo <ArrowRight className="w-3 h-3 ml-1" /></>
              ) : (
                "Começar! 🎉"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
