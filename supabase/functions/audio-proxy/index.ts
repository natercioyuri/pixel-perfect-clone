const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchAudioWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Referer: "https://www.tiktok.com/",
          Accept: "audio/*,*/*;q=0.9",
          "Accept-Language": "en-US,en;q=0.9",
          Range: "bytes=0-",
        },
      });

      if (res.ok || res.status === 206) return res;

      await res.text();

      if ((res.status === 403 || res.status === 429) && attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error("Max retries exceeded");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return new Response(JSON.stringify({ error: "Valid URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioRes = await fetchAudioWithRetry(url);
    const contentType = audioRes.headers.get("content-type") || "audio/mpeg";
    const audioData = await audioRes.arrayBuffer();

    return new Response(audioData, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Audio proxy error:", error);

    return new Response(JSON.stringify({ error: "Proxy error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
