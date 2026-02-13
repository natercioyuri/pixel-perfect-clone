import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Vyral</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <Link to="/signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Começar Agora
            </Button>
          </Link>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Vyral. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
