import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status === 429 && attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return response;
  }
  throw new Error('Max retries exceeded');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const category = body.category || '';
    
    // Rotate queries to get fresh products each time
    const defaultQueries = [
      // Fashion & clothing
      'fashion haul TikTok Shop',
      'dress viral TikTok Shop',
      'outfit TikTok Shop trending',
      'plus size fashion TikTok',
      'streetwear TikTok Shop',
      'jeans viral TikTok',
      'hoodie TikTok Shop',
      // Shoes
      'sneakers TikTok Shop viral',
      'shoes TikTok Shop trending',
      'slides sandals TikTok Shop',
      // Bags & accessories
      'bag TikTok Shop viral',
      'backpack TikTok Shop',
      'wallet TikTok Shop trending',
      'sunglasses TikTok Shop',
      'jewelry TikTok Shop viral',
      'watch TikTok Shop',
      // Beauty
      'makeup viral TikTok Shop',
      'skincare TikTok Shop trending',
      'perfume TikTok Shop',
      'hair care TikTok Shop viral',
      // Fitness
      'gym clothes TikTok Shop',
      'leggings viral TikTok',
      'activewear TikTok Shop',
      // Kids & baby
      'kids toys TikTok Shop viral',
      'baby clothes TikTok Shop',
      'kids fashion TikTok',
      // Home
      'home decor TikTok Shop viral',
      'room organizer TikTok Shop',
      // General viral
      'TikTok Shop best sellers',
      'viral product TikTok Shop',
      'TikTok made me buy it',
      'most popular TikTok Shop',
    ];

    const queriesToTry = body.query 
      ? [body.query] 
      : defaultQueries.sort(() => Math.random() - 0.5).slice(0, 5);

    let searchData: any = null;

    for (const query of queriesToTry) {
      const cursor = Math.floor(Math.random() * 2) * 10;
      const searchUrl = `https://${RAPIDAPI_HOST}/api/search/general?keyword=${encodeURIComponent(query)}&count=20&cursor=${cursor}`;
      console.log('Trying query:', query, 'cursor:', cursor);

      const searchResponse = await fetchWithRetry(searchUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      });

      const rawText = await searchResponse.text();

      if (!searchResponse.ok) {
        console.error(`TikTok API error [${searchResponse.status}]:`, rawText.substring(0, 300));
        continue;
      }

      if (!rawText || rawText.trim().length === 0) {
        console.warn('Empty response for query:', query);
        continue;
      }

      try {
        const parsed = JSON.parse(rawText);
        const items = parsed?.data || [];
        if (items.length > 0) {
          searchData = parsed;
          console.log(`Got ${items.length} results with query: "${query}"`);
          break;
        }
        console.warn('No items for query:', query);
      } catch {
        console.error('Failed to parse response for query:', query);
        continue;
      }
    }

    if (!searchData || !searchData.data || searchData.data.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum produto encontrado. Tente novamente em alguns minutos.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // tiktok-api23 returns data as array of { item: {...} } objects
    const rawItems = searchData?.data || [];
    const items = rawItems.map((d: any) => d?.item || d).filter(Boolean);
    console.log('Items found:', items.length);
    
    let insertedCount = 0;

    for (const item of items) {
      const stats = item?.stats || item?.statistics || {};
      const author = item?.author || item?.user || {};
      const desc = item?.desc || item?.title || item?.description || '';
      
      const videoViews = Number(stats?.playCount || stats?.play_count || stats?.views || 0);
      const videoLikes = Number(stats?.diggCount || stats?.digg_count || stats?.likes || 0);
      const videoShares = Number(stats?.shareCount || stats?.share_count || stats?.shares || 0);
      
      if (!desc || desc.length < 3) continue;

      // Calculate trending score based on engagement
      const engagement = videoLikes + videoShares;
      const trendingScore = Math.min(100, Math.max(50, Math.round(
        50 + (Math.log10(Math.max(engagement, 1)) * 10)
      )));

      // Estimate revenue based on views
      const estimatedRevenue = Math.round(videoViews * 0.02);
      const estimatedSales = Math.round(videoViews * 0.001);
      const estimatedPrice = Math.round(Math.random() * 150 + 20);

      const productName = desc.length > 100 ? desc.substring(0, 100) : desc;

      // Extract thumbnail/cover image from video data
      const videoData = item?.video || {};
      const productImage = videoData?.cover || videoData?.dynamicCover || videoData?.originCover || null;

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
        source: 'TikTok API',
        product_image: productImage,
        tiktok_url: item?.video?.id ? `https://www.tiktok.com/@${author?.uniqueId || ''}/video/${item.video.id}` : null,
      }, { onConflict: 'product_name,shop_name', ignoreDuplicates: true });

      if (!error) insertedCount++;
      else console.error('Insert error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${insertedCount} novos produtos adicionados via TikTok API!`,
        count: insertedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-tiktok-products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
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
