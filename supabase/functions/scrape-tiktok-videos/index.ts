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
      const delay = Math.pow(2, attempt + 1) * 1000;
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
    const query = body.query || 'TikTok Shop Brasil produto review unboxing comprei';

    // Search for TikTok Shop product videos — filtered to Brazil region
    const searchUrl = `https://${RAPIDAPI_HOST}/api/search/general?keyword=${encodeURIComponent(query)}&count=20&region=BR`;

    console.log('Fetching videos from TikTok API:', searchUrl);

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
      throw new Error(`TikTok API error [${searchResponse.status}]: ${rawText.substring(0, 200)}`);
    }

    if (!rawText || rawText.trim().length === 0) {
      console.warn('TikTok API returned empty response');
      return new Response(
        JSON.stringify({ success: true, message: 'API retornou resposta vazia. Tente novamente.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let searchData;
    try {
      searchData = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse API response:', rawText.substring(0, 300));
      return new Response(
        JSON.stringify({ success: false, error: 'API retornou resposta inválida. Possível rate limit.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      const video = item?.video || {};
      const desc = item?.desc || item?.title || item?.description || '';

      if (!desc || desc.length < 3) continue;

      const views = Number(stats?.playCount || stats?.play_count || stats?.views || 0);
      const likes = Number(stats?.diggCount || stats?.digg_count || stats?.likes || 0);
      const shares = Number(stats?.shareCount || stats?.share_count || stats?.shares || 0);
      const comments = Number(stats?.commentCount || stats?.comment_count || stats?.comments || 0);
      const duration = Number(video?.duration || item?.duration || 0);

      // Calculate engagement rate
      const engagementRate = views > 0
        ? Number(((likes + comments + shares) / views * 100).toFixed(2))
        : 0;

      // Calculate trending score
      const trendingScore = Math.min(100, Math.max(50, Math.round(
        50 + (Math.log10(Math.max(likes + shares, 1)) * 10)
      )));

      // Extract hashtags from description
      const hashtagMatches = desc.match(/#\w+/g) || [];
      const hashtags = hashtagMatches.map((h: string) => h.replace('#', ''));

      const title = desc.length > 150 ? desc.substring(0, 150) : desc;
      const creatorName = author?.uniqueId ? `@${author.uniqueId}` : (author?.nickname || 'Unknown');

      const thumbnailUrl = video?.cover || video?.dynamicCover || video?.originCover || null;
      const videoUrl = item?.video?.id
        ? `https://www.tiktok.com/@${author?.uniqueId || ''}/video/${item.video.id}`
        : (video?.playAddr || null);

      const { error } = await supabase.from('viral_videos').insert({
        title,
        creator_name: creatorName,
        views,
        likes,
        shares,
        comments,
        engagement_rate: engagementRate,
        trending_score: trendingScore,
        duration_seconds: duration,
        source: 'TikTok API',
        hashtags,
        product_name: desc.substring(0, 80),
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        revenue_estimate: Math.round(views * 0.015),
      });

      if (!error) insertedCount++;
      else console.error('Insert error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${insertedCount} novos vídeos adicionados via TikTok API!`,
        count: insertedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-tiktok-videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
