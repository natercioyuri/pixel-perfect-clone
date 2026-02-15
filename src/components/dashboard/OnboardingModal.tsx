import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Video, TrendingUp, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Produtos Virais",
    description: "Descubra os produtos que estão bombando no TikTok Shop com dados de vendas, receita e tendências em tempo real.",
  },
  {
    icon: Video,
    title: "Vídeos & Transcrições",
    description: "Analise vídeos virais, veja métricas de engajamento e transcreva o conteúdo para criar seus próprios roteiros.",
  },
  {
    icon: TrendingUp,
    title: "Ranking & Analytics",
    description: "Acompanhe o ranking dos produtos mais quentes e veja análises detalhadas para tomar decisões estratégicas.",
  },
  {
    icon: Sparkles,
    title: "Roteiros por IA",
    description: "Gere roteiros de vídeo otimizados com inteligência artificial baseados nos vídeos virais que mais convertem.",
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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="glass border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="text-gradient">Bem-vindo ao Vyral! 🚀</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Veja como a plataforma pode ajudar você
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <current.icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">
              Pular
            </Button>
            <Button size="sm" onClick={handleNext} className="bg-primary text-primary-foreground">
              {step < steps.length - 1 ? "Próximo" : "Começar!"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
