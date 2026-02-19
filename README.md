# 🚀 Viral Boost

Plataforma de inteligência para TikTok Shop que identifica produtos e vídeos virais, ajudando empreendedores e criadores de conteúdo a descobrir tendências e oportunidades de vendas.

## 📋 Visão Geral

O Viral Boost coleta e analisa dados do TikTok Shop em tempo real, oferecendo:

- **Explorar Produtos** — Descubra produtos virais com métricas de vendas, receita e trending score
- **Vídeos Virais** — Acompanhe vídeos em alta com dados de engajamento e visualizações
- **Ranking de Produtos** — Classificação dinâmica dos produtos mais populares
- **Descoberta de Criadores** — Encontre criadores de conteúdo relevantes no TikTok Shop
- **Análise de Lojas** — Analise o desempenho de lojas do TikTok Shop
- **Analytics** — Gráficos e estatísticas do mercado
- **Geração de Vídeo** — Crie roteiros e conceitos de vídeo com IA
- **Salvos** — Salve produtos e vídeos favoritos para acompanhar

## 🛠️ Stack Tecnológica

| Camada       | Tecnologia                                      |
| ------------ | ------------------------------------------------ |
| **Frontend** | React 18, TypeScript, Vite                       |
| **UI**       | Tailwind CSS, shadcn/ui, Framer Motion           |
| **Backend**  | Lovable Cloud (Edge Functions)                   |
| **Banco**    | PostgreSQL (via Lovable Cloud)                   |
| **APIs**     | TikTok API (RapidAPI), Stripe, Lovable AI Gateway |
| **Auth**     | Autenticação por e-mail com verificação          |

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── dashboard/       # Componentes do painel principal
│   ├── landing/         # Componentes da landing page
│   └── ui/              # Componentes base (shadcn/ui)
├── contexts/            # Context de autenticação
├── hooks/               # Hooks customizados
├── integrations/        # Cliente e tipos do banco
├── lib/                 # Utilitários e configuração de planos
├── pages/               # Páginas da aplicação
supabase/
└── functions/           # Edge Functions (backend)
    ├── create-checkout/         # Checkout Stripe
    ├── check-subscription/      # Verificação de assinatura
    ├── customer-portal/         # Portal do cliente Stripe
    ├── stripe-webhook/          # Webhook do Stripe
    ├── scrape-tiktok-products/  # Coleta de produtos virais
    ├── scrape-tiktok-videos/    # Coleta de vídeos virais
    ├── generate-video/          # Geração de vídeo com IA
    └── transcribe-videos/       # Transcrição de vídeos
```

## ⚙️ Funcionalidades Principais

### Coleta de Dados (Scraping)
- Sistema dual-API com fallback automático (`tiktok-api23` → `tiktok-scraper7`)
- Retry com backoff exponencial em caso de rate limiting (429)
- Normalização de dados entre diferentes formatos de API
- Cron jobs a cada 6 horas para atualização contínua

### Planos e Monetização
- **Free** — Acesso limitado
- **Starter** — Funcionalidades básicas
- **Pro** — Recursos avançados
- **Business** — Acesso completo
- **Master** — Plano administrativo

Integração completa com Stripe (checkout, webhook, portal do cliente).

### Segurança
- Row Level Security (RLS) em todas as tabelas
- Autenticação com verificação de e-mail
- Secrets armazenados de forma segura no backend
- Proteção contra override do plano Master via webhook

## 🚀 Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`.

## 📊 Tabelas do Banco

| Tabela                     | Descrição                              |
| -------------------------- | -------------------------------------- |
| `viral_products`           | Produtos virais do TikTok Shop         |
| `viral_videos`             | Vídeos virais com métricas             |
| `profiles`                 | Perfis de usuários e planos            |
| `saved_items`              | Itens salvos pelos usuários            |
| `notifications`            | Notificações de tendências             |
| `product_ranking_history`  | Histórico de ranking de produtos       |
| `user_roles`               | Roles de administrador                 |

## 🔑 Secrets Necessários

| Secret                   | Descrição                         |
| ------------------------ | --------------------------------- |
| `RAPIDAPI_KEY`           | Chave da RapidAPI (TikTok APIs)   |
| `STRIPE_SECRET_KEY`      | Chave secreta do Stripe           |
| `STRIPE_WEBHOOK_SECRET`  | Secret do webhook do Stripe       |
| `LOVABLE_API_KEY`        | Chave do Lovable AI Gateway       |

## 📄 Licença

Projeto privado — todos os direitos reservados.
