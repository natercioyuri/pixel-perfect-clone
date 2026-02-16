import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu email para confirmar sua conta." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-[120px]" />
      </div>
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Vyral</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">Criar sua conta</h1>
          <p className="text-sm text-muted-foreground mb-6">Comece a descobrir produtos virais agora</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" required className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-secondary border-border pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                Li e aceito os{" "}
                <Link to="/terms" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
                {" "}e a{" "}
                <Link to="/privacy" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
              </Label>
            </div>
            <Button type="submit" disabled={loading || !acceptedTerms} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
