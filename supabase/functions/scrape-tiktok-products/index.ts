import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PRIMARY_HOST = 'tiktok-api23.p.rapidapi.com';
const FALLBACK_HOST = 'tiktok-scraper7.p.rapidapi.com';

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status === 429 && attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt + 1) * 1000));
      continue;
    }
    return response;
  }
  throw new Error('Max retries exceeded');
}

async function searchPrimary(query: string, apiKey: string): Promise<any[] | null> {
  const cursor = Math.floor(Math.random() * 3) * 10;
  const url = `https://${PRIMARY_HOST}/api/search/general?keyword=${encodeURIComponent(query)}&count=20&cursor=${cursor}`;
  console.log('[Primary]', query);
  try {
    const res = await fetchWithRetry(url, { method: 'GET', headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': PRIMARY_HOST } });
    if (res.status === 429) return null;
    const text = await res.text();
    if (!res.ok || !text.trim()) return [];
    const parsed = JSON.parse(text);
    return (parsed?.data || []).map((d: any) => d?.item || d).filter(Boolean);
  } catch (e) { console.error('[Primary]', e); return null; }
}

async function searchFallback(query: string, apiKey: string): Promise<any[] | null> {
  const url = `https://${FALLBACK_HOST}/feed/search?keywords=${encodeURIComponent(query)}&count=20&cursor=0&region=br&publish_time=7&sort_type=0`;
  console.log('[Fallback]', query);
  try {
    const res = await fetchWithRetry(url, { method: 'GET', headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': FALLBACK_HOST } });
    if (res.status === 429) return null;
    const text = await res.text();
    if (!res.ok || !text.trim()) return [];
    const parsed = JSON.parse(text);
    return parsed?.data?.videos || parsed?.data || [];
  } catch (e) { console.error('[Fallback]', e); return null; }
}

function normalizeItem(item: any, source: string): any {
  if (source === 'fallback') {
    return {
      desc: item?.title || item?.desc || '',
      stats: { playCount: item?.play_count || item?.stats?.playCount || 0, diggCount: item?.digg_count || item?.stats?.diggCount || 0, shareCount: item?.share_count || item?.stats?.shareCount || 0 },
      author: { uniqueId: item?.author?.unique_id || item?.author?.uniqueId || '', nickname: item?.author?.nickname || '' },
      video: { cover: item?.cover || item?.origin_cover || item?.video?.cover || null, id: item?.video_id || item?.id || null },
    };
  }
  return item;
}

/** Download image from TikTok and upload to Supabase Storage, return public URL. Timeout 5s. */
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

const CATEGORY_QUERIES: Record<string, string[]> = {
  'Moda': ['vestido viral TikTok Shop 2025', 'outfit trending TikTok Shop', 'roupa viral TikTok 2025', 'plus size TikTok Shop trending', 'fashion haul TikTok Shop 2025', 'dress viral TikTok Shop'],
  'Calçados': ['tênis viral TikTok Shop 2025', 'sneakers trending TikTok Shop', 'sapato viral TikTok 2025', 'sandália TikTok Shop trending', 'new balance TikTok Shop'],
  'Beleza': ['makeup viral TikTok Shop 2025', 'skincare trending TikTok Shop', 'perfume viral TikTok 2025', 'maquiagem TikTok Shop trending', 'beauty best seller TikTok 2025'],
  'Acessórios': ['bolsa viral TikTok Shop 2025', 'mochila trending TikTok Shop', 'óculos viral TikTok Shop', 'bijuteria viral TikTok Shop', 'bag viral TikTok Shop'],
  'Eletrônicos': ['gadget viral TikTok Shop 2025', 'tech trending TikTok Shop', 'fone bluetooth TikTok viral', 'smart gadget TikTok 2025'],
  'Casa': ['home decor viral TikTok Shop 2025', 'cozinha viral TikTok Shop', 'kitchen gadget TikTok Shop 2025', 'decoração TikTok Shop trending'],
  'Fitness': ['legging viral TikTok Shop 2025', 'gym accessories trending TikTok', 'fitness TikTok Shop viral', 'workout gear TikTok 2025'],
  'Pet': ['pet viral TikTok Shop 2025', 'cachorro TikTok Shop trending', 'dog toy TikTok Shop', 'pet gadget trending 2025'],
  'Infantil': ['brinquedo viral TikTok Shop 2025', 'kids toys trending TikTok', 'bebê TikTok Shop viral', 'children toy TikTok 2025'],
  'Geral': ['TikTok Shop best sellers 2025', 'viral product TikTok Shop 2025', 'TikTok made me buy it 2025', 'achado TikTok Shop 2025', 'most sold TikTok Shop', 'rising product TikTok 2025'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const requestedCategory = body.category || '';

    let queriesToTry: string[];
    if (body.query) {
      queriesToTry = [body.query];
    } else if (requestedCategory && CATEGORY_QUERIES[requestedCategory]) {
      queriesToTry = shuffle(CATEGORY_QUERIES[requestedCategory]).slice(0, 4);
    } else {
      const allCategoryKeys = Object.keys(CATEGORY_QUERIES);
      queriesToTry = [];
      for (const cat of allCategoryKeys) {
        const catQueries = shuffle(CATEGORY_QUERIES[cat]);
        queriesToTry.push(catQueries[0]);
      }
      queriesToTry = shuffle(queriesToTry).slice(0, 6);
    }

    let allItems: { item: any; source: string }[] = [];
    let primaryQuotaExceeded = false;

    for (const query of queriesToTry) {
      if (primaryQuotaExceeded) break;
      const result = await searchPrimary(query, RAPIDAPI_KEY);
      if (result === null) { primaryQuotaExceeded = true; break; }
      if (result.length > 0) {
        for (const item of result) allItems.push({ item, source: 'primary' });
      }
      if (queriesToTry.indexOf(query) < queriesToTry.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (allItems.length === 0) {
      for (const query of queriesToTry.slice(0, 4)) {
        const result = await searchFallback(query, RAPIDAPI_KEY);
        if (result === null) break;
        if (result.length > 0) {
          for (const item of result) allItems.push({ item, source: 'fallback' });
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (allItems.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'Nenhum produto encontrado.', count: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueItems = allItems.filter(({ item, source }) => {
      const norm = normalizeItem(item, source);
      const key = (norm?.desc || '').substring(0, 60).toLowerCase();
      if (!key || key.length < 3 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limit to 15 items to stay within edge function timeout
    const itemsToProcess = uniqueItems.slice(0, 15);
    console.log(`Processing ${itemsToProcess.length} unique items`);
    let insertedCount = 0;

    // Process in parallel batches of 5 for speed
    for (let i = 0; i < itemsToProcess.length; i += 5) {
      const batch = itemsToProcess.slice(i, i + 5);
      const results = await Promise.allSettled(batch.map(async ({ item: rawItem, source }) => {
        const item = normalizeItem(rawItem, source);
        const stats = item?.stats || {};
        const author = item?.author || {};
        const desc = item?.desc || '';
        if (!desc || desc.length < 3) return false;

        const videoViews = Number(stats?.playCount || 0);
        const videoLikes = Number(stats?.diggCount || 0);
        const videoShares = Number(stats?.shareCount || 0);
        const engagement = videoLikes + videoShares;
        const engagementRate = videoViews > 0 ? (engagement / videoViews) * 100 : 0;
        const rawScore = Math.log10(Math.max(engagement, 1)) * 8;
        const rateBonus = Math.min(engagementRate * 3, 25);
        const trendingScore = Math.min(100, Math.max(40, Math.round(40 + rawScore + rateBonus)));
        const estimatedSales = Math.round(videoViews * 0.001);
        const estimatedPrice = Math.round(Math.random() * 150 + 20);
        const estimatedRevenue = estimatedSales * estimatedPrice;
        const productName = desc.length > 100 ? desc.substring(0, 100) : desc;

        const productId = crypto.randomUUID();
        const originalImageUrl = item?.video?.cover || null;
        const persistedImageUrl = await persistImage(originalImageUrl, productId, supabase, supabaseUrl);

        const { error } = await supabase.from('viral_products').upsert({
          product_name: productName,
          category: requestedCategory || detectCategory(desc),
          price: estimatedPrice,
          revenue: estimatedRevenue,
          sales_count: estimatedSales,
          video_views: videoViews,
          video_likes: videoLikes,
          video_shares: videoShares,
          trending_score: trendingScore,
          country: 'BR',
          shop_name: author?.nickname || author?.uniqueId || 'TikTok Shop',
          source: `TikTok API (${source})`,
          product_image: persistedImageUrl || originalImageUrl,
          tiktok_url: item?.video?.id ? `https://www.tiktok.com/@${author?.uniqueId || ''}/video/${item.video.id}` : null,
        }, { onConflict: 'product_name,shop_name', ignoreDuplicates: true });

        return !error;
      }));

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) insertedCount++;
      }
    }

    return new Response(JSON.stringify({ success: true, message: `${insertedCount} novos produtos adicionados!`, count: insertedCount }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function shuffle<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
  return s;
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/beleza|makeup|maquiagem|skincare|pele|cabelo|hair|beauty|perfume|cosmético|body splash/.test(lower)) return 'Beleza';
  if (/eletrônic|tech|fone|celular|gadget|phone|headphone|bluetooth|smart|led/.test(lower)) return 'Eletrônicos';
  if (/casa|home|decoraç|decor|organiz|cozinha|kitchen|clean|limpeza/.test(lower)) return 'Casa';
  if (/vestido|blusa|camisa|camiseta|calça|jeans|saia|conjunto|roupa|dress|outfit|estilo|jaqueta|casaco|moletom|plus size|fashion/.test(lower)) return 'Moda';
  if (/tênis|sapato|bota|chinelo|sandália|slide|shoe|sneaker|new balance|nike|adidas/.test(lower)) return 'Calçados';
  if (/bolsa|mochila|carteira|bag|wallet|necessaire|pochete|óculos|relógio|colar|pulseira|brinco|anel|bijuteria|joia|jewelry/.test(lower)) return 'Acessórios';
  if (/fitness|gym|treino|workout|exercise|saúde|academia|legging|top fitness/.test(lower)) return 'Fitness';
  if (/pet|cachorro|gato|dog|cat|animal/.test(lower)) return 'Pet';
  if (/infantil|bebê|criança|brinquedo|kids|baby|child|toy/.test(lower)) return 'Infantil';
  return 'Outros';
}
