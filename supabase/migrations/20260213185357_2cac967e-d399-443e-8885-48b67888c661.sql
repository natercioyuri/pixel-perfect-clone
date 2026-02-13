
-- ============================================
-- Profiles table
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Viral Products table
-- ============================================
CREATE TABLE public.viral_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC,
  revenue NUMERIC,
  sales_count BIGINT,
  video_views BIGINT,
  video_likes BIGINT,
  video_shares BIGINT,
  trending_score NUMERIC DEFAULT 0,
  category TEXT,
  shop_name TEXT,
  shop_url TEXT,
  tiktok_url TEXT,
  country TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.viral_products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Viral Videos table
-- ============================================
CREATE TABLE public.viral_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  creator_name TEXT,
  views BIGINT,
  likes BIGINT,
  shares BIGINT,
  comments BIGINT,
  revenue_estimate NUMERIC,
  trending_score NUMERIC DEFAULT 0,
  engagement_rate NUMERIC,
  duration_seconds INTEGER,
  product_name TEXT,
  hashtags TEXT[],
  transcription TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.viral_videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Saved Items table
-- ============================================
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.viral_products(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.viral_videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Notifications table
-- ============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL DEFAULT 'trending',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id UUID REFERENCES public.viral_products(id) ON DELETE SET NULL,
  trending_score NUMERIC,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- User Roles table
-- ============================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Product Ranking History table
-- ============================================
CREATE TABLE public.product_ranking_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.viral_products(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  trending_score NUMERIC,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_ranking_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function: is_admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_viral_products_updated_at BEFORE UPDATE ON public.viral_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_viral_videos_updated_at BEFORE UPDATE ON public.viral_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Auto-create profile on signup trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS Policies
-- ============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Viral Products (authenticated users can read, admins can write)
CREATE POLICY "Authenticated users can view products" ON public.viral_products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert products" ON public.viral_products FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update products" ON public.viral_products FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.viral_products FOR DELETE USING (public.is_admin(auth.uid()));

-- Viral Videos (authenticated users can read, admins can write)
CREATE POLICY "Authenticated users can view videos" ON public.viral_videos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert videos" ON public.viral_videos FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update videos" ON public.viral_videos FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete videos" ON public.viral_videos FOR DELETE USING (public.is_admin(auth.uid()));

-- Saved Items
CREATE POLICY "Users can view own saved items" ON public.saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save items" ON public.saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved items" ON public.saved_items FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() IS NOT NULL);

-- User Roles
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- Product Ranking History
CREATE POLICY "Authenticated users can view ranking" ON public.product_ranking_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert ranking" ON public.product_ranking_history FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_viral_products_trending ON public.viral_products(trending_score DESC);
CREATE INDEX idx_viral_products_category ON public.viral_products(category);
CREATE INDEX idx_viral_videos_trending ON public.viral_videos(trending_score DESC);
CREATE INDEX idx_saved_items_user ON public.saved_items(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_ranking_date ON public.product_ranking_history(snapshot_date);
