import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const CheckoutFeedback = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast({
        title: "🎉 Assinatura ativada!",
        description: "Seu plano foi ativado com sucesso. Aproveite todos os recursos!",
      });
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    } else if (checkout === "canceled") {
      toast({
        title: "Checkout cancelado",
        description: "Você pode assinar a qualquer momento na seção de planos.",
        variant: "destructive",
      });
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return null;
};

export default CheckoutFeedback;
