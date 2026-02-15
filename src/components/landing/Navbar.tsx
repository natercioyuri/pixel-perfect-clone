import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Vyral</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como Funciona</a>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</Link>
          <a href="#para-quem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Para quem é</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Fazer Login</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              Garantir a Vyral
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass border-t border-border px-6 py-4 space-y-3">
          <a href="#funciona" className="block text-sm text-muted-foreground">Como Funciona</a>
          <Link to="/pricing" className="block text-sm text-muted-foreground">Planos</Link>
          <a href="#para-quem" className="block text-sm text-muted-foreground">Para quem é</a>
          <a href="#faq" className="block text-sm text-muted-foreground">FAQ</a>
          <div className="flex gap-2 pt-2">
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-primary text-primary-foreground">Começar</Button></Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
