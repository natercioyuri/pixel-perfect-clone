import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/** Download image and upload to Storage, return public URL */
async function persistImage(imageUrl: string, productId: string, supabase: any, supabaseUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': 'image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const blob = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg';
    const path = `products/${productId}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, blob, { contentType, upsert: true });
    if (error) return null;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 20;

    // Find products with TikTok CDN URLs (not yet in storage)
    const { data: products, error } = await supabase
      .from('viral_products')
      .select('id, product_image')
      .not('product_image', 'is', null)
      .not('product_image', 'like', '%storage%')
      .like('product_image', '%tiktokcdn%')
      .order('trending_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No images to migrate', count: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Migrating ${products.length} images to storage`);
    let migratedCount = 0;

    // Process in batches of 5
    for (let i = 0; i < products.length; i += 5) {
      const batch = products.slice(i, i + 5);
      const results = await Promise.allSettled(batch.map(async (p: any) => {
        const storageUrl = await persistImage(p.product_image, p.id, supabase, supabaseUrl);
        if (storageUrl) {
          await supabase.from('viral_products').update({ product_image: storageUrl }).eq('id', p.id);
          return true;
        }
        return false;
      }));
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) migratedCount++;
      }
    }

    return new Response(JSON.stringify({ success: true, message: `${migratedCount} images migrated to storage`, count: migratedCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
