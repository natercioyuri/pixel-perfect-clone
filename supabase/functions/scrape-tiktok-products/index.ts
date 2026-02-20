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
      const delay = Math.pow(2, attempt + 1) * 1000;
      console.log(`Rate limited, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
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
    if (res.status === 429) { console.warn('[Primary] 429'); return null; }
    const text = await res.text();
    if (!res.ok || !text.trim()) return [];
    const parsed = JSON.parse(text);
    const items = (parsed?.data || []).map((d: any) => d?.item || d).filter(Boolean);
    return items.length > 0 ? items : [];
  } catch (e) { console.error('[Primary]', e); return null; }
}

async function searchFallback(query: string, apiKey: string): Promise<any[] | null> {
  const url = `https://${FALLBACK_HOST}/feed/search?keywords=${encodeURIComponent(query)}&count=20&cursor=0&region=br&publish_time=7&sort_type=0`;
  console.log('[Fallback]', query);
  try {
    const res = await fetchWithRetry(url, { method: 'GET', headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': FALLBACK_HOST } });
    if (res.status === 429) { console.warn('[Fallback] 429'); return null; }
    const text = await res.text();
    if (!res.ok || !text.trim()) return [];
    const parsed = JSON.parse(text);
    const videos = parsed?.data?.videos || parsed?.data || [];
    return videos.length > 0 ? videos : [];
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

// Category-specific queries for 2025/2026 trending products across ALL categories
const CATEGORY_QUERIES: Record<string, string[]> = {
  'Moda': [
    'vestido viral TikTok Shop 2025', 'outfit trending TikTok Shop', 'roupa viral TikTok 2025',
    'plus size TikTok Shop trending', 'conjunto feminino TikTok Shop', 'fashion haul TikTok Shop 2025',
    'jaqueta viral TikTok', 'moletom trending TikTok Shop', 'dress viral TikTok Shop',
  ],
  'Calçados': [
    'tênis viral TikTok Shop 2025', 'sneakers trending TikTok Shop', 'sapato viral TikTok 2025',
    'sandália TikTok Shop trending', 'chinelo viral TikTok Shop', 'new balance TikTok Shop',
  ],
  'Beleza': [
    'makeup viral TikTok Shop 2025', 'skincare trending TikTok Shop', 'perfume viral TikTok 2025',
    'maquiagem TikTok Shop trending', 'hair care viral TikTok Shop', 'beauty best seller TikTok 2025',
    'cosmético viral TikTok', 'body splash TikTok Shop',
  ],
  'Acessórios': [
    'bolsa viral TikTok Shop 2025', 'mochila trending TikTok Shop', 'óculos viral TikTok Shop',
    'relógio trending TikTok 2025', 'bijuteria viral TikTok Shop', 'carteira TikTok Shop trending',
    'bag viral TikTok Shop', 'jewelry trending TikTok 2025',
  ],
  'Eletrônicos': [
    'gadget viral TikTok Shop 2025', 'tech trending TikTok Shop', 'fone bluetooth TikTok viral',
    'celular acessório TikTok Shop trending', 'smart gadget TikTok 2025', 'LED light TikTok Shop',
  ],
  'Casa': [
    'home decor viral TikTok Shop 2025', 'organização casa TikTok trending', 'cozinha viral TikTok Shop',
    'kitchen gadget TikTok Shop 2025', 'cleaning viral TikTok', 'decoração TikTok Shop trending',
  ],
  'Fitness': [
    'legging viral TikTok Shop 2025', 'gym accessories trending TikTok', 'fitness TikTok Shop viral',
    'workout gear TikTok 2025', 'academia TikTok Shop trending',
  ],
  'Pet': [
    'pet viral TikTok Shop 2025', 'cachorro TikTok Shop trending', 'gato acessório TikTok viral',
    'dog toy TikTok Shop', 'pet gadget trending 2025',
  ],
  'Infantil': [
    'brinquedo viral TikTok Shop 2025', 'kids toys trending TikTok', 'bebê TikTok Shop viral',
    'children toy TikTok 2025', 'infantil TikTok Shop trending',
  ],
  'Geral': [
    'TikTok Shop best sellers 2025', 'viral product TikTok Shop 2025', 'TikTok made me buy it 2025',
    'achado TikTok Shop 2025', 'novidade TikTok Shop', 'comprei no TikTok Shop 2025',
    'most sold TikTok Shop', 'rising product TikTok 2025', 'hidden gem TikTok Shop 2025',
    'produto em alta TikTok Shop', 'just dropped TikTok Shop 2025',
  ],
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

    // Build query list: if specific category requested, use those queries
    // Otherwise pick queries from MULTIPLE categories for diversity
    let queriesToTry: string[];

    if (body.query) {
      queriesToTry = [body.query];
    } else if (requestedCategory && CATEGORY_QUERIES[requestedCategory]) {
      queriesToTry = shuffle(CATEGORY_QUERIES[requestedCategory]).slice(0, 4);
    } else {
      // Pick 1-2 queries from each category for maximum diversity
      const allCategoryKeys = Object.keys(CATEGORY_QUERIES);
      queriesToTry = [];
      for (const cat of allCategoryKeys) {
        const catQueries = shuffle(CATEGORY_QUERIES[cat]);
        queriesToTry.push(catQueries[0]);
        if (catQueries.length > 1 && Math.random() > 0.5) {
          queriesToTry.push(catQueries[1]);
        }
      }
      queriesToTry = shuffle(queriesToTry).slice(0, 6);
    }

    let allItems: { item: any; source: string }[] = [];
    let primaryQuotaExceeded = false;

    // Try primary API across multiple queries for diversity
    for (const query of queriesToTry) {
      if (primaryQuotaExceeded) break;
      const result = await searchPrimary(query, RAPIDAPI_KEY);
      if (result === null) { primaryQuotaExceeded = true; break; }
      if (result.length > 0) {
        for (const item of result) allItems.push({ item, source: 'primary' });
      }
      // Small delay between requests
      if (queriesToTry.indexOf(query) < queriesToTry.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Fallback if primary exhausted
    if (allItems.length === 0) {
      console.log('Switching to fallback API...');
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
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum produto encontrado.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduplicate by description
    const seen = new Set<string>();
    const uniqueItems = allItems.filter(({ item, source }) => {
      const norm = normalizeItem(item, source);
      const key = (norm?.desc || '').substring(0, 60).toLowerCase();
      if (!key || key.length < 3 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Processing ${uniqueItems.length} unique items from ${uniqueItems.length > 0 ? uniqueItems[0].source : 'none'}`);
    let insertedCount = 0;

    for (const { item: rawItem, source } of uniqueItems) {
      const item = normalizeItem(rawItem, source);
      const stats = item?.stats || {};
      const author = item?.author || {};
      const desc = item?.desc || '';
      if (!desc || desc.length < 3) continue;

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
      const productImage = item?.video?.cover || null;

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
        product_image: productImage,
        tiktok_url: item?.video?.id ? `https://www.tiktok.com/@${author?.uniqueId || ''}/video/${item.video.id}` : null,
      }, { onConflict: 'product_name,shop_name', ignoreDuplicates: true });

      if (!error) insertedCount++;
      else console.error('Insert error:', error);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${insertedCount} novos produtos adicionados!`, count: insertedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
