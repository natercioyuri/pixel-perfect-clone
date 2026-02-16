
-- Add unique constraint on product_name + shop_name to prevent duplicates
ALTER TABLE public.viral_products ADD CONSTRAINT viral_products_unique_product UNIQUE (product_name, shop_name);

-- Add unique constraint on title + creator_name for videos too
ALTER TABLE public.viral_videos ADD CONSTRAINT viral_videos_unique_video UNIQUE (title, creator_name);
