const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.tiktok.com/',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site',
        },
      });

      if (res.ok) return res;

      // Consume body to avoid leak
      await res.text();

      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (res.status === 403 && attempt < maxRetries - 1) {
        console.warn(`403 on attempt ${attempt + 1}, retrying...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return new Response(JSON.stringify({ error: 'Valid URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageRes = await fetchWithRetry(url);

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const imageData = await imageRes.arrayBuffer();

    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
