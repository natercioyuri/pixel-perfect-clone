-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow service role to upload (edge functions use service role)
CREATE POLICY "Service role can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');
