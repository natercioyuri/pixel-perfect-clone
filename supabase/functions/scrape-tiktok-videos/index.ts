import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const query = body.query || 'viral TikTok videos products Brazil 2026';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a TikTok viral video data generator. Generate realistic viral video data in JSON format. Return ONLY a JSON array (no markdown). Each video must have: title (Portuguese), creator_name (with @), views (number), likes (number), shares (number), comments (number), engagement_rate (number 5-12), trending_score (50-100), duration_seconds (15-60), source ("TikTok"), hashtags (array of strings), product_name (Portuguese).`
          },
          {
            role: 'user',
            content: `Generate 5 new trending TikTok viral videos for query: "${query}". Make them realistic with Portuguese titles and Brazilian creators.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    let videos;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      videos = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum novo vídeo encontrado.', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let insertedCount = 0;
    for (const video of videos) {
      const { error } = await supabase.from('viral_videos').insert({
        title: video.title,
        creator_name: video.creator_name,
        views: video.views,
        likes: video.likes,
        shares: video.shares,
        comments: video.comments,
        engagement_rate: video.engagement_rate,
        trending_score: video.trending_score,
        duration_seconds: video.duration_seconds,
        source: video.source || 'TikTok',
        hashtags: video.hashtags,
        product_name: video.product_name,
      });
      if (!error) insertedCount++;
      else console.error('Insert error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${insertedCount} novos vídeos adicionados!`,
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
