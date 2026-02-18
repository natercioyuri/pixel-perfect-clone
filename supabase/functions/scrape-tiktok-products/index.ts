import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Primary API
const PRIMARY_HOST = 'tiktok-api23.p.rapidapi.com';
// Fallback API (separate quota)
const FALLBACK_HOST = 'tiktok-scraper7.p.rapidapi.com';

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status === 429 && attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt + 1) * 1000;
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return response;
  }
  throw new Error('Max retries exceeded');
}

async function searchPrimary(query: string, apiKey: string): Promise<any[] | null> {
  const cursor = Math.floor(Math.random() * 2) * 10;
  const url = `https://${PRIMARY_HOST}/api/search/general?keyword=${encodeURIComponent(query)}&count=20&cursor=${cursor}`;
  console.log('[Primary] Trying:', query);

  try {
    const res = await fetchWithRetry(url, {
      method: 'GET',
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': PRIMARY_HOST },
    });

    if (res.status === 429) {
      console.warn('[Primary] Quota exceeded (429)');
      return null; // Signal to use fallback
    }

    const text = await res.text();
    if (!res.ok || !text.trim()) return [];

    const parsed = JSON.parse(text);
    const items = (parsed?.data || []).map((d: any) => d?.item || d).filter(Boolean);
    return items.length > 0 ? items : [];
  } catch (e) {
    console.error('[Primary] Error:', e);
    return null;
  }
}

async function searchFallback(query: string, apiKey: string): Promise<any[] | null> {
  const url = `https://${FALLBACK_HOST}/feed/search?keywords=${encodeURIComponent(query)}&count=20&cursor=0&region=br&publish_time=0&sort_type=0`;
  console.log('[Fallback] Trying:', query);

  try {
    const res = await fetchWithRetry(url, {
      method: 'GET',
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': FALLBACK_HOST },
    });

    if (res.status === 429) {
      console.warn('[Fallback] Quota exceeded (429)');
      return null;
    }

    const text = await res.text();
    if (!res.ok || !text.trim()) return [];

    const parsed = JSON.parse(text);
    // tiktok-scraper7 returns { data: { videos: [...] } } or { data: [...] }
    const videos = parsed?.data?.videos || parsed?.data || [];
    return videos.length > 0 ? videos : [];
  } catch (e) {
    console.error('[Fallback] Error:', e);
    return null;
  }
}

function normalizeItem(item: any, source: string): any {
  if (source === 'fallback') {
    // tiktok-scraper7 format
    return {
      desc: item?.title || item?.desc || '',
      stats: {
        playCount: item?.play_count || item?.stats?.playCount || 0,
        diggCount: item?.digg_count || item?.stats?.diggCount || 0,
        shareCount: item?.share_count || item?.stats?.shareCount || 0,
      },
      author: {
        uniqueId: item?.author?.unique_id || item?.author?.uniqueId || '',
        nickname: item?.author?.nickname || '',
      },
      video: {
        cover: item?.cover || item?.origin_cover || item?.video?.cover || null,
        id: item?.video_id || item?.id || null,
      },
    };
  }
  // Primary format (already correct)
  return item;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const category = body.category || '';

    const defaultQueries = [
      'fashion haul TikTok Shop', 'dress viral TikTok Shop', 'outfit TikTok Shop trending',
      'sneakers TikTok Shop viral', 'bag TikTok Shop viral', 'makeup viral TikTok Shop',
      'skincare TikTok Shop trending', 'gym clothes TikTok Shop', 'kids toys TikTok Shop viral',
      'TikTok Shop best sellers', 'viral product TikTok Shop', 'TikTok made me buy it',
    ];

    const queriesToTry = body.query 
      ? [body.query] 
      : defaultQueries.sort(() => Math.random() - 0.5).slice(0, 3);

    let items: any[] = [];
    let usedSource = 'primary';
    let primaryQuotaExceeded = false;

    // Try primary API first
    for (const query of queriesToTry) {
      if (primaryQuotaExceeded) break;
      const result = await searchPrimary(query, RAPIDAPI_KEY);
      if (result === null) { primaryQuotaExceeded = true; break; }
      if (result.length > 0) { items = result; break; }
    }

    // Fallback if primary quota exceeded or no results
    if (items.length === 0) {
      console.log('Switching to fallback API...');
      usedSource = 'fallback';
      for (const query of queriesToTry) {
        const result = await searchFallback(query, RAPIDAPI_KEY);
        if (result === null) break;
        if (result.length > 0) { items = result; break; }
      }
    }

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum produto encontrado. Ambas APIs com cota esgotada ou sem resultados.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${items.length} items from ${usedSource}`);
    let insertedCount = 0;

    for (const rawItem of items) {
      const item = normalizeItem(rawItem, usedSource);
      const stats = item?.stats || {};
      const author = item?.author || {};
      const desc = item?.desc || '';
      if (!desc || desc.length < 3) continue;

      const videoViews = Number(stats?.playCount || 0);
      const videoLikes = Number(stats?.diggCount || 0);
      const videoShares = Number(stats?.shareCount || 0);

      const engagement = videoLikes + videoShares;
      const trendingScore = Math.min(100, Math.max(50, Math.round(50 + (Math.log10(Math.max(engagement, 1)) * 10))));
      const estimatedRevenue = Math.round(videoViews * 0.02);
      const estimatedSales = Math.round(videoViews * 0.001);
      const estimatedPrice = Math.round(Math.random() * 150 + 20);
      const productName = desc.length > 100 ? desc.substring(0, 100) : desc;
      const productImage = item?.video?.cover || null;

      const { error } = await supabase.from('viral_products').upsert({
        product_name: productName,
        category: category || detectCategory(desc),
        price: estimatedPrice,
        revenue: estimatedRevenue,
        sales_count: estimatedSales,
        video_views: videoViews,
        video_likes: videoLikes,
        video_shares: videoShares,
        trending_score: trendingScore,
        country: 'BR',
        shop_name: author?.nickname || author?.uniqueId || 'TikTok Shop',
        source: `TikTok API (${usedSource})`,
        product_image: productImage,
        tiktok_url: item?.video?.id ? `https://www.tiktok.com/@${author?.uniqueId || ''}/video/${item.video.id}` : null,
      }, { onConflict: 'product_name,shop_name', ignoreDuplicates: true });

      if (!error) insertedCount++;
      else console.error('Insert error:', error);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${insertedCount} novos produtos adicionados via ${usedSource}!`, count: insertedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-tiktok-products:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/beleza|makeup|maquiagem|skincare|pele|cabelo|hair|beauty|perfume|cosmético/.test(lower)) return 'Beleza';
  if (/eletrônic|tech|fone|celular|gadget|phone|headphone/.test(lower)) return 'Eletrônicos';
  if (/casa|home|decoraç|decor|organiz|cozinha|kitchen/.test(lower)) return 'Casa';
  if (/vestido|blusa|camisa|camiseta|calça|jeans|saia|conjunto|roupa|dress|outfit|estilo|jaqueta|casaco|moletom|plus size/.test(lower)) return 'Moda';
  if (/tênis|sapato|bota|chinelo|sandália|slide|shoe|sneaker/.test(lower)) return 'Calçados';
  if (/bolsa|mochila|carteira|bag|wallet|necessaire|pochete/.test(lower)) return 'Acessórios';
  if (/óculos|relógio|colar|pulseira|brinco|anel|bijuteria|joia/.test(lower)) return 'Acessórios';
  if (/fitness|gym|treino|workout|exercise|saúde|academia|legging|top fitness/.test(lower)) return 'Fitness';
  if (/pet|cachorro|gato|dog|cat|animal/.test(lower)) return 'Pet';
  if (/infantil|bebê|criança|brinquedo|kids|baby|child/.test(lower)) return 'Infantil';
  if (/moda|fashion/.test(lower)) return 'Moda';
  return 'Outros';
}
