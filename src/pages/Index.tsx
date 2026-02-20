import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ForWhoSection from "@/components/landing/ForWhoSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/SEOHead";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vyral",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Plataforma de inteligência de mercado para TikTok Shop. Descubra produtos virais, analise vídeos e copie estratégias vencedoras.",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "47.00",
      priceCurrency: "BRL",
      url: "https://vyral.com.br/pricing",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "97.00",
      priceCurrency: "BRL",
      url: "https://vyral.com.br/pricing",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "197.00",
      priceCurrency: "BRL",
      url: "https://vyral.com.br/pricing",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1280",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é o Vyral?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vyral é uma plataforma de inteligência de mercado para o TikTok Shop que ajuda você a descobrir produtos virais, analisar vídeos e copiar estratégias vencedoras.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso ter uma loja no TikTok Shop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não necessariamente. Vyral é útil tanto para vendedores do TikTok Shop quanto para criadores de conteúdo e afiliados.",
      },
    },
    {
      "@type": "Question",
      name: "Posso cancelar a qualquer momento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! Todos os planos são mensais e você pode cancelar a qualquer momento pelo portal de assinatura.",
      },
    },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Vyral — Descubra Produtos Virais do TikTok Shop"
        description="Descubra os produtos e vídeos que estão vendendo milhares no TikTok Shop. Copie estratégias virais antes da concorrência. +10K produtos rastreados."
        canonical="https://vyral.com.br"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [jsonLd, faqJsonLd],
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ForWhoSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
