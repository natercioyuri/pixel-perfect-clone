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
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return response;
  }
  throw new Error('Max retries exceeded');
}

async function searchPrimary(query: string, apiKey: string): Promise<any[] | null> {
  const cursor = Math.floor(Math.random() * 3) * 20;
  const url = `https://${PRIMARY_HOST}/api/search/general?keyword=${encodeURIComponent(query)}&count=20&cursor=${cursor}`;
  console.log('[Primary] Trying:', query);

  try {
    const res = await fetchWithRetry(url, {
      method: 'GET',
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': PRIMARY_HOST },
    });
    if (res.status === 429) { console.warn('[Primary] Quota exceeded'); return null; }
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
    if (res.status === 429) { console.warn('[Fallback] Quota exceeded'); return null; }
    const text = await res.text();
    if (!res.ok || !text.trim()) return [];
    const parsed = JSON.parse(text);
    const videos = parsed?.data?.videos || parsed?.data || [];
    return videos.length > 0 ? videos : [];
  } catch (e) {
    console.error('[Fallback] Error:', e);
    return null;
  }
}

function normalizeItem(item: any, source: string): any {
  if (source === 'fallback') {
    return {
      desc: item?.title || item?.desc || '',
      stats: {
        playCount: item?.play_count || item?.stats?.playCount || 0,
        diggCount: item?.digg_count || item?.stats?.diggCount || 0,
        shareCount: item?.share_count || item?.stats?.shareCount || 0,
        commentCount: item?.comment_count || item?.stats?.commentCount || 0,
      },
      author: {
        uniqueId: item?.author?.unique_id || item?.author?.uniqueId || '',
        nickname: item?.author?.nickname || '',
      },
      video: {
        cover: item?.cover || item?.origin_cover || item?.video?.cover || null,
        id: item?.video_id || item?.id || null,
        duration: item?.duration || 0,
      },
    };
  }
  return item;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));

    const defaultQueries = [
      'fashion haul TikTok Shop review', 'outfit viral TikTok Shop', 'sneakers TikTok Shop unboxing',
      'makeup viral TikTok Shop review', 'skincare TikTok Shop trending', 'gym clothes TikTok Shop viral',
      'TikTok Shop best sellers review', 'TikTok made me buy it haul', 'viral product TikTok Shop review',
    ];

    const queriesToTry = body.query 
      ? [body.query] 
      : defaultQueries.sort(() => Math.random() - 0.5).slice(0, 3);

    let items: any[] = [];
    let usedSource = 'primary';
    let primaryQuotaExceeded = false;

    for (const query of queriesToTry) {
      if (primaryQuotaExceeded) break;
      const result = await searchPrimary(query, RAPIDAPI_KEY);
      if (result === null) { primaryQuotaExceeded = true; break; }
      if (result.length > 0) { items = result; break; }
    }

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
        JSON.stringify({ success: true, message: 'Nenhum vídeo encontrado. Ambas APIs com cota esgotada.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${items.length} items from ${usedSource}`);
    let insertedCount = 0;

    for (const rawItem of items) {
      const item = normalizeItem(rawItem, usedSource);
      const stats = item?.stats || {};
      const author = item?.author || {};
      const video = item?.video || {};
      const desc = item?.desc || '';
      if (!desc || desc.length < 3) continue;

      const views = Number(stats?.playCount || 0);
      const likes = Number(stats?.diggCount || 0);
      const shares = Number(stats?.shareCount || 0);
      const comments = Number(stats?.commentCount || 0);
      const duration = Number(video?.duration || 0);
      const engagementRate = views > 0 ? Number(((likes + comments + shares) / views * 100).toFixed(2)) : 0;
      const trendingScore = Math.min(100, Math.max(50, Math.round(50 + (Math.log10(Math.max(likes + shares, 1)) * 10))));
      const hashtagMatches = desc.match(/#\w+/g) || [];
      const hashtags = hashtagMatches.map((h: string) => h.replace('#', ''));
      const title = desc.length > 150 ? desc.substring(0, 150) : desc;
      const creatorName = author?.uniqueId ? `@${author.uniqueId}` : (author?.nickname || 'Unknown');
      const thumbnailUrl = video?.cover || null;
      const videoUrl = video?.id ? `https://www.tiktok.com/@${author?.uniqueId || ''}/video/${video.id}` : null;

      const { error } = await supabase.from('viral_videos').upsert({
        title, creator_name: creatorName, views, likes, shares, comments,
        engagement_rate: engagementRate, trending_score: trendingScore,
        duration_seconds: duration, source: `TikTok API (${usedSource})`,
        hashtags, product_name: desc.substring(0, 80),
        thumbnail_url: thumbnailUrl, video_url: videoUrl,
        revenue_estimate: Math.round(views * 0.015),
      }, { onConflict: 'title,creator_name', ignoreDuplicates: true });

      if (!error) insertedCount++;
      else console.error('Insert error:', error);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${insertedCount} novos vídeos adicionados via ${usedSource}!`, count: insertedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-tiktok-videos:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
