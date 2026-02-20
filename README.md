# 🚀 Vyral — Plataforma de Inteligência para TikTok Shop

Plataforma SaaS que coleta, analisa e exibe dados de produtos e vídeos virais do TikTok Shop em tempo real, ajudando empreendedores e criadores de conteúdo a identificar tendências, gerar scripts virais e maximizar vendas.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#️-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [APIs Externas](#-apis-externas)
- [Edge Functions (Backend)](#-edge-functions-backend)
- [Banco de Dados](#-banco-de-dados)
- [Autenticação](#-autenticação)
- [Planos e Monetização](#-planos-e-monetização)
- [Controle de Acesso por Plano](#-controle-de-acesso-por-plano)
- [SEO e Metadata](#-seo-e-metadata)
- [Cron Jobs](#-cron-jobs)
- [Secrets Necessários](#-secrets-necessários)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Rotas da Aplicação](#️-rotas-da-aplicação)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Segurança](#-segurança)

---

## 🔍 Visão Geral

O Vyral oferece as seguintes funcionalidades:

| Aba do Dashboard       | Descrição                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| **Explorar**           | Lista de produtos virais com filtros por categoria, país e trending score |
| **Vídeos**             | Vídeos em alta separados por **Nacionais 🇧🇷**, **Internacionais 🌎** e **Todos** |
| **Ranking**            | Classificação dinâmica dos produtos mais populares com histórico         |
| **Descoberta**         | Encontre criadores de conteúdo relevantes no TikTok Shop                 |
| **Análise de Lojas**   | Analise desempenho de lojas por métricas agregadas                       |
| **Analytics**          | Gráficos e estatísticas gerais do mercado                                |
| **Geração de Vídeo**   | Gere scripts/roteiros de vídeo viral com IA (Gemini)                     |
| **Salvos**             | Salve produtos e vídeos favoritos para acompanhar                        |

---

## 🛠️ Stack Tecnológica

| Camada        | Tecnologia                                                     |
| ------------- | -------------------------------------------------------------- |
| **Frontend**  | React 18.3, TypeScript, Vite                                   |
| **UI**        | Tailwind CSS, shadcn/ui, Framer Motion, Recharts               |
| **Roteamento**| React Router DOM v6                                            |
| **Estado**    | TanStack React Query v5                                        |
| **Backend**   | Lovable Cloud (Deno Edge Functions)                            |
| **Banco**     | PostgreSQL com Row Level Security                              |
| **Pagamento** | Stripe (Checkout, Webhooks, Customer Portal)                   |
| **IA**        | Lovable AI Gateway (Google Gemini 2.5 Flash)                   |
| **Scraping**  | RapidAPI (TikTok API23 + TikTok Scraper7)                     |
| **Auth**      | Autenticação por e-mail com verificação                        |
| **SEO**       | SEOHead dinâmico com JSON-LD, Open Graph e Meta Tags           |

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── dashboard/                # Componentes do painel principal
│   │   ├── AnalyticsTab.tsx      # Aba de analytics com gráficos
│   │   ├── CheckoutFeedback.tsx  # Feedback pós-checkout Stripe
│   │   ├── CreatorDiscoveryTab.tsx# Descoberta de criadores
│   │   ├── DashboardHeader.tsx   # Header com busca e perfil
│   │   ├── DashboardSidebar.tsx  # Sidebar de navegação
│   │   ├── ExploreTab.tsx        # Explorar produtos virais
│   │   ├── ExportCSVButton.tsx   # Exportação de dados em CSV (Pro+)
│   │   ├── NotificationBell.tsx  # Sino de notificações
│   │   ├── OnboardingModal.tsx   # Modal de boas-vindas multi-step
│   │   ├── PaginationControls.tsx# Controles de paginação
│   │   ├── PlanGate.tsx          # Gate de acesso por plano (upgrade wall)
│   │   ├── PriceHistoryChart.tsx # Gráfico de histórico de trending score
│   │   ├── ProductCard.tsx       # Card de produto
│   │   ├── ProductDetailDialog.tsx# Modal de detalhe do produto
│   │   ├── RankingTab.tsx        # Ranking de produtos
│   │   ├── SaveButton.tsx        # Botão salvar/favoritar
│   │   ├── SavedTab.tsx          # Itens salvos
│   │   ├── ShopAnalysisTab.tsx   # Análise de lojas
│   │   ├── StatsCards.tsx        # Cards de estatísticas
│   │   ├── TopProductsSection.tsx# Seção de top produtos
│   │   ├── TranscriptionDialog.tsx# Modal de transcrição
│   │   ├── VideoCard.tsx         # Card de vídeo
│   │   ├── VideoFilters.tsx      # Filtros de vídeos
│   │   ├── VideoGenerationTab.tsx# Geração de vídeo com IA
│   │   └── VideoRow.tsx          # Linha de vídeo em tabela
│   ├── landing/                  # Componentes da landing page
│   │   ├── FAQSection.tsx        # Perguntas frequentes
│   │   ├── Footer.tsx            # Rodapé
│   │   ├── ForWhoSection.tsx     # Para quem é
│   │   ├── HeroSection.tsx       # Seção hero
│   │   ├── HowItWorksSection.tsx # Como funciona
│   │   ├── Navbar.tsx            # Barra de navegação
│   │   └── PricingSection.tsx    # Seção de preços
│   ├── ui/                       # Componentes base (shadcn/ui)
│   ├── ErrorBoundary.tsx         # Captura erros de renderização React
│   ├── NavLink.tsx               # Link de navegação ativo
│   └── SEOHead.tsx               # Meta tags dinâmicas e JSON-LD
├── contexts/
│   └── AuthContext.tsx           # Context de autenticação global
├── hooks/
│   ├── use-mobile.tsx            # Detecção de dispositivo mobile
│   ├── use-toast.ts              # Hook de toast notifications
│   ├── useIsAdmin.ts             # Verifica se usuário é admin
│   ├── useNotifications.ts       # Hook de notificações
│   ├── useSavedItems.ts          # Hook de itens salvos
│   ├── useUserPlan.ts            # Hook do plano do usuário
│   └── useViralProducts.ts       # Hook de produtos virais
├── integrations/
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (auto-gerado)
│       └── types.ts              # Tipos TypeScript (auto-gerado)
├── lib/
│   ├── plans.ts                  # Configuração de planos e limites
│   └── utils.ts                  # Utilitários gerais (cn, etc.)
├── pages/
│   ├── AdminPanel.tsx            # Painel administrativo com métricas
│   ├── Dashboard.tsx             # Dashboard principal
│   ├── Index.tsx                 # Landing page com SEO completo
│   ├── Login.tsx                 # Página de login
│   ├── NotFound.tsx              # Página 404
│   ├── Pricing.tsx               # Página de preços
│   ├── Privacy.tsx               # Política de privacidade
│   ├── ResetPassword.tsx         # Recuperação de senha
│   ├── Signup.tsx                # Página de cadastro
│   ├── Terms.tsx                 # Termos de uso
│   └── UpdatePassword.tsx        # Atualização de senha
supabase/
├── config.toml                   # Configuração das Edge Functions
└── functions/
    ├── create-checkout/          # Cria sessão de checkout Stripe
    ├── check-subscription/       # Verifica assinatura ativa
    ├── customer-portal/          # Abre portal do cliente Stripe
    ├── stripe-webhook/           # Processa webhooks do Stripe
    ├── scrape-tiktok-products/   # Coleta produtos virais do TikTok
    ├── scrape-tiktok-videos/     # Coleta vídeos virais do TikTok
    ├── generate-video/           # Gera scripts de vídeo com IA
    └── transcribe-videos/        # Gera transcrições com IA
```

---

## 🌐 APIs Externas

### 1. TikTok API (via RapidAPI)

Utilizada para coletar dados de produtos e vídeos virais do TikTok Shop.

| Propriedade        | API Primária                      | API Fallback                       |
| ------------------- | --------------------------------- | ---------------------------------- |
| **Host**            | `tiktok-api23.p.rapidapi.com`     | `tiktok-scraper7.p.rapidapi.com`   |
| **Plano**           | Basic (gratuito)                  | Basic (gratuito)                   |
| **Endpoint**        | `/api/search/general`             | `/feed/search`                     |
| **Autenticação**    | Header `X-RapidAPI-Key`           | Header `X-RapidAPI-Key`            |
| **Rate Limit**      | Varia por plano                   | Varia por plano                    |

**Como configurar:**
1. Crie uma conta em [rapidapi.com](https://rapidapi.com)
2. Inscreva-se no plano Basic (gratuito) de ambas as APIs:
   - [TikTok API23](https://rapidapi.com/tikapi-tikapi-default/api/tiktok-api23)
   - [TikTok Scraper7](https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7)
3. Copie sua **RapidAPI Key** (a mesma chave funciona para ambas)
4. Adicione como secret `RAPIDAPI_KEY`

**Lógica de Fallback:**
```
Requisição → tiktok-api23 (primária)
  ├── Sucesso → Usar dados
  ├── HTTP 429 (cota esgotada) → Mudar para fallback
  └── Erro → Mudar para fallback
       └── tiktok-scraper7 (fallback)
            ├── Sucesso → Normalizar e usar dados
            └── HTTP 429 → Retornar "cota esgotada"
```

**Retry com Backoff Exponencial:**
- 1ª tentativa: imediata
- 2ª tentativa: após 2 segundos
- 3ª tentativa: após 4 segundos

### 2. Stripe

Utilizada para gerenciar assinaturas e pagamentos recorrentes.

| Componente          | Descrição                                              |
| ------------------- | ------------------------------------------------------ |
| **Checkout**        | Sessão de pagamento hospedada pelo Stripe               |
| **Webhook**         | Recebe eventos de subscription e pagamento              |
| **Customer Portal** | Portal para o cliente gerenciar sua assinatura          |
| **API Version**     | `2025-08-27.basil`                                     |

**Como configurar:**
1. Crie uma conta em [stripe.com](https://stripe.com)
2. Crie 3 produtos com preços recorrentes (mensal):
   - **Starter** → R$ 47/mês → anote o `product_id` e `price_id`
   - **Pro** → R$ 97/mês → anote o `product_id` e `price_id`
   - **Business** → R$ 197/mês → anote o `product_id` e `price_id`
3. Configure o webhook no Stripe Dashboard:
   - **URL:** `https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
   - **Eventos:** `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Adicione os secrets:
   - `STRIPE_SECRET_KEY` → Chave secreta do Stripe (sk_live_... ou sk_test_...)
   - `STRIPE_WEBHOOK_SECRET` → Signing secret do webhook (whsec_...)
5. Atualize o mapeamento em `src/lib/plans.ts` e nos Edge Functions (`PLAN_MAP`) com seus `product_id`s

**Mapeamento atual de produtos:**
```typescript
const PLAN_MAP = {
  "prod_TysnxyPY7dXqVK": "starter",  // R$ 47/mês
  "prod_TytgUGD2tNKYbs": "pro",      // R$ 97/mês
  "prod_TytgzeWLP67bjX": "business",  // R$ 197/mês
};
```

### 3. Lovable AI Gateway

Utilizada para geração de scripts de vídeo e transcrições via IA.

| Propriedade        | Valor                                           |
| ------------------- | ----------------------------------------------- |
| **URL Base**        | `https://ai.gateway.lovable.dev/v1/chat/completions` |
| **Modelo**          | `google/gemini-2.5-flash`                       |
| **Autenticação**    | Header `Authorization: Bearer LOVABLE_API_KEY`  |
| **Formato**         | OpenAI-compatible chat completions              |

**Funcionalidades:**
- **Geração de Vídeo** (`generate-video`): Cria roteiros de TikTok com gancho, cenas, transições e texto em PT-BR
- **Transcrição** (`transcribe-videos`): Gera análise estruturada (gancho, dor, solução, descrição) baseada nos metadados do vídeo

---

## ⚡ Edge Functions (Backend)

### `scrape-tiktok-products`
- **Método:** POST
- **Body (opcional):** `{ "query": "busca personalizada", "category": "Moda" }`
- **Função:** Busca produtos do TikTok Shop e insere na tabela `viral_products`
- **Detecção automática de categoria:** Moda, Beleza, Eletrônicos, Casa, Calçados, Acessórios, Fitness, Pet, Infantil
- **Conflito:** Upsert com `onConflict: 'product_name,shop_name'`

### `scrape-tiktok-videos`
- **Método:** POST
- **Body (opcional):** `{ "query": "busca personalizada" }`
- **Função:** Busca vídeos do TikTok e insere na tabela `viral_videos`
- **Métricas calculadas:** engagement_rate, trending_score, revenue_estimate
- **Conflito:** Upsert com `onConflict: 'title,creator_name'`

### `create-checkout`
- **Método:** POST
- **Auth:** Requer token JWT no header Authorization
- **Body:** `{ "priceId": "price_xxx" }`
- **Função:** Cria uma sessão de checkout do Stripe e retorna a URL
- **Retorno:** `{ "url": "https://checkout.stripe.com/..." }`

### `check-subscription`
- **Método:** POST
- **Auth:** Requer token JWT
- **Função:** Verifica se o usuário tem assinatura ativa no Stripe e sincroniza o plano com a tabela `profiles`
- **Retorno:** `{ "subscribed": true, "plan": "pro", "subscription_end": "2026-03-19T..." }`
- **Proteção:** Não sobrescreve o plano `master`

### `customer-portal`
- **Método:** POST
- **Auth:** Requer token JWT
- **Função:** Cria uma sessão do Billing Portal do Stripe
- **Retorno:** `{ "url": "https://billing.stripe.com/..." }`

### `stripe-webhook`
- **Método:** POST
- **Auth:** Verificação de assinatura Stripe (`stripe-signature` header)
- **Eventos processados:**
  - `customer.subscription.created` → Atualiza plano do usuário
  - `customer.subscription.updated` → Atualiza plano do usuário
  - `customer.subscription.deleted` → Downgrade para `free`
  - `invoice.payment_failed` → Log de falha
- **Proteção:** Não sobrescreve o plano `master`

### `generate-video`
- **Método:** POST
- **Body:** `{ "action": "generate", "prompt": "Crie um roteiro para..." }`
- **Função:** Gera scripts/roteiros de vídeo viral usando Gemini 2.5 Flash
- **Retorno:** `{ "success": true, "script": "..." }`

### `transcribe-videos`
- **Método:** POST
- **Body:** `{ "video_id": "uuid" }` ou `{ "limit": 10 }`
- **Função:** Gera análise estruturada (gancho, dor, solução, descrição) para vídeos sem transcrição
- **Retorno:** `{ "success": true, "count": 5 }`

---

## 🗄️ Banco de Dados

### Tabelas

#### `profiles`
| Coluna       | Tipo        | Descrição                              |
| ------------ | ----------- | -------------------------------------- |
| `id`         | uuid (PK)   | ID único                               |
| `user_id`    | uuid        | ID do usuário autenticado              |
| `full_name`  | text        | Nome completo                          |
| `plan`       | text        | Plano atual (free/starter/pro/business/master) |
| `created_at` | timestamptz | Data de criação                        |
| `updated_at` | timestamptz | Última atualização                     |

#### `viral_products`
| Coluna          | Tipo        | Descrição                          |
| --------------- | ----------- | ---------------------------------- |
| `id`            | uuid (PK)   | ID único                           |
| `product_name`  | text        | Nome do produto                    |
| `category`      | text        | Categoria detectada automaticamente|
| `price`         | numeric     | Preço estimado                     |
| `revenue`       | numeric     | Receita estimada                   |
| `sales_count`   | bigint      | Vendas estimadas                   |
| `video_views`   | bigint      | Views do vídeo associado           |
| `video_likes`   | bigint      | Likes do vídeo                     |
| `video_shares`  | bigint      | Shares do vídeo                    |
| `trending_score`| numeric     | Score de tendência (0-100)         |
| `country`       | text        | País                               |
| `shop_name`     | text        | Nome da loja                       |
| `shop_url`      | text        | URL da loja                        |
| `product_image` | text        | URL da imagem do produto           |
| `tiktok_url`    | text        | URL do vídeo no TikTok             |
| `source`        | text        | Fonte dos dados (API usada)        |
| `created_at`    | timestamptz | Data de criação                    |
| `updated_at`    | timestamptz | Última atualização                 |

#### `viral_videos`
| Coluna            | Tipo        | Descrição                          |
| ----------------- | ----------- | ---------------------------------- |
| `id`              | uuid (PK)   | ID único                           |
| `title`           | text        | Título/descrição do vídeo          |
| `creator_name`    | text        | Nome do criador (@username)        |
| `views`           | bigint      | Visualizações                      |
| `likes`           | bigint      | Curtidas                           |
| `shares`          | bigint      | Compartilhamentos                  |
| `comments`        | bigint      | Comentários                        |
| `engagement_rate` | numeric     | Taxa de engajamento (%)            |
| `trending_score`  | numeric     | Score de tendência (0-100)         |
| `duration_seconds`| integer     | Duração em segundos                |
| `hashtags`        | text[]      | Lista de hashtags                  |
| `product_name`    | text        | Produto mencionado                 |
| `thumbnail_url`   | text        | URL da thumbnail                   |
| `video_url`       | text        | URL do vídeo no TikTok             |
| `source`          | text        | Fonte dos dados                    |
| `revenue_estimate`| numeric     | Receita estimada                   |
| `transcription`   | text        | Transcrição gerada por IA (JSON)   |
| `created_at`      | timestamptz | Data de criação                    |
| `updated_at`      | timestamptz | Última atualização                 |

#### `saved_items`
| Coluna       | Tipo        | Descrição                          |
| ------------ | ----------- | ---------------------------------- |
| `id`         | uuid (PK)   | ID único                           |
| `user_id`    | uuid        | ID do usuário                      |
| `product_id` | uuid (FK)   | Referência para `viral_products`   |
| `video_id`   | uuid (FK)   | Referência para `viral_videos`     |
| `created_at` | timestamptz | Data que salvou                    |

#### `notifications`
| Coluna          | Tipo        | Descrição                          |
| --------------- | ----------- | ---------------------------------- |
| `id`            | uuid (PK)   | ID único                           |
| `user_id`       | uuid        | ID do usuário                      |
| `title`         | text        | Título da notificação              |
| `message`       | text        | Mensagem                           |
| `type`          | text        | Tipo (default: 'trending')         |
| `product_id`    | uuid (FK)   | Produto relacionado                |
| `trending_score`| numeric     | Score do produto                   |
| `is_read`       | boolean     | Se foi lida                        |
| `created_at`    | timestamptz | Data de criação                    |

#### `product_ranking_history`
| Coluna          | Tipo        | Descrição                          |
| --------------- | ----------- | ---------------------------------- |
| `id`            | uuid (PK)   | ID único                           |
| `product_id`    | uuid (FK)   | Referência para `viral_products`   |
| `rank_position` | integer     | Posição no ranking                 |
| `trending_score`| numeric     | Score no momento do snapshot       |
| `snapshot_date` | date        | Data do snapshot                   |
| `created_at`    | timestamptz | Data de criação                    |

#### `user_roles`
| Coluna       | Tipo        | Descrição                          |
| ------------ | ----------- | ---------------------------------- |
| `id`         | uuid (PK)   | ID único                           |
| `user_id`    | uuid        | ID do usuário                      |
| `role`       | text        | Role (default: 'user', ou 'admin') |
| `created_at` | timestamptz | Data de criação                    |

### Funções do Banco

| Função                    | Descrição                                           |
| ------------------------- | --------------------------------------------------- |
| `is_admin(user_id)`       | Retorna `true` se o usuário tem role `admin`        |
| `handle_new_user()`       | Trigger que cria perfil automaticamente no signup    |
| `update_updated_at_column()` | Trigger que atualiza `updated_at` em updates     |

---

## 🔐 Autenticação

- **Método:** E-mail + senha com verificação de e-mail obrigatória
- **Signup:** Cria conta e envia e-mail de confirmação
- **Login:** Apenas com e-mail verificado
- **Recuperação de senha:** Via e-mail com link de redefinição
- **Perfil automático:** Trigger `handle_new_user()` cria registro na tabela `profiles` no signup
- **Rotas protegidas:** `/dashboard` e `/admin` requerem autenticação

---

## 💰 Planos e Monetização

| Plano       | Preço    | Buscas/dia | Transcrição IA | Scripts IA | Alertas | Exportação CSV |
| ----------- | -------- | ---------- | -------------- | ---------- | ------- | -------------- |
| **Free**    | Grátis   | Limitado   | ❌             | ❌         | ❌      | ❌             |
| **Starter** | R$ 47/mês| 50         | ❌             | ❌         | ❌      | ❌             |
| **Pro**     | R$ 97/mês| Ilimitado  | ✅             | ✅         | ✅      | ✅             |
| **Business**| R$ 197/mês| Ilimitado | ✅             | ✅         | ✅      | ✅             |
| **Master**  | Interno  | Ilimitado  | ✅             | ✅         | ✅      | ✅             |

> O plano **Master** é atribuído manualmente no banco e nunca é sobrescrito pelo webhook do Stripe.

---

## 🔒 Controle de Acesso por Plano

O componente `PlanGate.tsx` implementa restrições de acesso baseadas no plano do usuário:

| Funcionalidade          | Free | Starter | Pro | Business | Master |
| ----------------------- | ---- | ------- | --- | -------- | ------ |
| Explorar Produtos       | ✅   | ✅      | ✅  | ✅       | ✅     |
| Vídeos (Nacional/Intl.) | ✅   | ✅      | ✅  | ✅       | ✅     |
| Ranking                 | ✅   | ✅      | ✅  | ✅       | ✅     |
| Salvos                  | ✅   | ✅      | ✅  | ✅       | ✅     |
| Análise de Lojas        | ❌   | ❌      | ✅  | ✅       | ✅     |
| Descoberta de Criadores | ❌   | ❌      | ✅  | ✅       | ✅     |
| Analytics               | ❌   | ❌      | ✅  | ✅       | ✅     |
| Geração de Vídeo (IA)   | ❌   | ❌      | ✅  | ✅       | ✅     |
| Exportação CSV          | ❌   | ❌      | ✅  | ✅       | ✅     |

Abas bloqueadas exibem um **overlay de upgrade** com botão para a página de preços.

---

## 🏷️ SEO e Metadata

A otimização de SEO é implementada pelo componente `SEOHead.tsx`:

| Recurso               | Descrição                                              |
| ---------------------- | ------------------------------------------------------ |
| **Meta Tags**          | Title, description, keywords dinâmicos por página      |
| **Open Graph**         | og:title, og:description, og:type para redes sociais   |
| **Twitter Cards**      | twitter:title, twitter:description                     |
| **JSON-LD**            | Schema SoftwareApplication + FAQPage na landing page   |
| **Canonical**          | URLs canônicas para evitar conteúdo duplicado          |
| **HTML Semântico**     | `<header>`, `<main>`, `<section>`, `<footer>`          |
| **Alt Attributes**     | Descrições em todas as imagens                         |

**Schemas JSON-LD implementados:**
- `SoftwareApplication` — dados da plataforma, preço, avaliação
- `FAQPage` — perguntas frequentes indexáveis pelo Google

---

## ⏰ Cron Jobs

Os cron jobs estão configurados via `pg_cron` + `pg_net` no banco de dados:

| Job                         | Frequência     | Horário  | Função                    |
| --------------------------- | -------------- | -------- | ------------------------- |
| Scrape de Produtos          | A cada 6 horas | XX:00    | `scrape-tiktok-products`  |
| Scrape de Vídeos            | A cada 6 horas | XX:30    | `scrape-tiktok-videos`    |

---

## 🔑 Secrets Necessários

| Secret                   | Onde obter                                          | Usado por                              |
| ------------------------ | --------------------------------------------------- | -------------------------------------- |
| `RAPIDAPI_KEY`           | [rapidapi.com](https://rapidapi.com) → Dashboard    | `scrape-tiktok-products`, `scrape-tiktok-videos` |
| `STRIPE_SECRET_KEY`      | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key | `create-checkout`, `check-subscription`, `customer-portal`, `stripe-webhook` |
| `STRIPE_WEBHOOK_SECRET`  | Stripe Dashboard → Webhooks → Signing secret        | `stripe-webhook`                       |
| `LOVABLE_API_KEY`        | Provisionado automaticamente pelo Lovable Cloud      | `generate-video`, `transcribe-videos`  |
| `SUPABASE_URL`           | Auto-configurado                                     | Todas as Edge Functions                |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configurado                                  | Todas as Edge Functions                |
| `SUPABASE_ANON_KEY`      | Auto-configurado                                     | `create-checkout`, Cron Jobs           |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm))
- npm ou bun

### Passos

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`.

> **Nota:** As variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) são configuradas automaticamente pelo arquivo `.env`.

---

## 🗺️ Rotas da Aplicação

| Rota               | Componente          | Acesso        | Descrição                   |
| ------------------- | ------------------- | ------------- | --------------------------- |
| `/`                 | `Index`             | Público       | Landing page com SEO        |
| `/login`            | `Login`             | Público       | Página de login             |
| `/signup`           | `Signup`            | Público       | Página de cadastro          |
| `/reset-password`   | `ResetPassword`     | Público       | Recuperação de senha        |
| `/update-password`  | `UpdatePassword`    | Público       | Atualizar senha (via link)  |
| `/dashboard`        | `Dashboard`         | Autenticado   | Painel principal            |
| `/admin`            | `AdminPanel`        | Admin         | Painel administrativo       |
| `/pricing`          | `Pricing`           | Público       | Página de preços            |
| `/terms`            | `Terms`             | Público       | Termos de uso               |
| `/privacy`          | `Privacy`           | Público       | Política de privacidade     |

---

## ✅ Funcionalidades Implementadas

### Core
- [x] Scraping automatizado de produtos e vídeos virais do TikTok Shop
- [x] Filtros por categoria, país, trending score, visualizações e curtidas
- [x] Ranking dinâmico de produtos com histórico de posições
- [x] Sistema de favoritos (salvar produtos e vídeos)
- [x] Notificações de produtos em alta
- [x] Paginação em todas as listagens

### Separação Nacional/Internacional
- [x] Detecção heurística de vídeos brasileiros (padrões de PT-BR, acentos, hashtags)
- [x] Abas separadas: **🇧🇷 Nacionais**, **🌎 Internacionais** e **Todos**
- [x] Filtragem aplicada sobre os filtros globais já existentes

### Inteligência Artificial
- [x] Geração de scripts/roteiros de vídeo viral com Gemini 2.5 Flash
- [x] Transcrição e análise estruturada de vídeos (gancho, dor, solução)

### Monetização
- [x] Integração completa com Stripe (Checkout, Webhooks, Customer Portal)
- [x] 4 planos de assinatura (Free, Starter, Pro, Business) + Master interno
- [x] Controle de acesso por plano com overlay de upgrade (`PlanGate`)

### SEO & Marketing
- [x] Meta tags dinâmicas (title, description, OG, Twitter Cards)
- [x] JSON-LD schemas (SoftwareApplication, FAQPage)
- [x] Landing page completa com Hero, How It Works, For Who, Pricing, FAQ
- [x] Termos de Uso e Política de Privacidade

### Administração
- [x] Painel admin com visão geral (métricas de usuários, produtos, vídeos)
- [x] Distribuição por plano com percentuais
- [x] Gerenciamento de usuários, produtos e vídeos
- [x] Scraping manual com busca personalizada
- [x] Exclusão de registros com confirmação

### UX & Estabilidade
- [x] Onboarding multi-step com tour guiado
- [x] ErrorBoundary para captura de erros de renderização
- [x] Exportação de dados em CSV (produtos e vídeos)
- [x] Gráfico de histórico de trending score (Recharts)
- [x] Layout responsivo (mobile-first)
- [x] Feedback visual pós-checkout do Stripe

---

## 🛡️ Segurança

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado com políticas restritivas:

- **profiles:** Usuário só vê/edita o próprio perfil; admins podem visualizar todos
- **viral_products / viral_videos:** Leitura para autenticados; escrita apenas para admins
- **saved_items:** CRUD completo apenas nos próprios itens
- **notifications:** Leitura e atualização apenas nas próprias notificações
- **user_roles:** Apenas admins podem gerenciar roles
- **product_ranking_history:** Leitura para autenticados; inserção apenas por admins

### Proteções Adicionais
- Verificação de e-mail obrigatória no signup
- Tokens JWT validados em todas as Edge Functions protegidas
- Webhook do Stripe com verificação de assinatura (`stripe-signature`)
- Plano Master protegido contra override por webhook
- Secrets armazenados de forma criptografada no backend
- Edge Functions com `verify_jwt = false` no config (validação feita em código)
- ErrorBoundary para captura segura de erros no frontend
- Controle de acesso por plano impede uso de funcionalidades premium sem assinatura

---

## 📄 Licença

Projeto privado — todos os direitos reservados.
