import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Find products trending in last 24h with score >= 90
    const { data: trendingProducts } = await supabase
      .from("viral_products")
      .select("id, product_name, trending_score, category, video_views")
      .gte("trending_score", 90)
      .gte("updated_at", twentyFourHoursAgo)
      .order("trending_score", { ascending: false })
      .limit(10);

    if (!trendingProducts || trendingProducts.length === 0) {
      return new Response(JSON.stringify({ message: "No new trends", alerts: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check which products already have recent notifications (avoid spam)
    const productIds = trendingProducts.map((p: any) => p.id);
    const { data: existingNotifs } = await supabase
      .from("notifications")
      .select("product_id")
      .in("product_id", productIds)
      .gte("created_at", twentyFourHoursAgo);

    const alreadyNotified = new Set((existingNotifs || []).map((n: any) => n.product_id));
    const newTrends = trendingProducts.filter((p: any) => !alreadyNotified.has(p.id));

    if (newTrends.length === 0) {
      return new Response(JSON.stringify({ message: "All trends already notified", alerts: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create global notifications (user_id = null for all users)
    const notifications = newTrends.map((p: any) => ({
      type: "trend_alert",
      title: `🚀 Tendência detectada: Score ${p.trending_score}!`,
      message: `"${p.product_name.substring(0, 80)}" está explodindo${p.category ? ` em ${p.category}` : ""} com ${(p.video_views || 0).toLocaleString("pt-BR")} views!`,
      product_id: p.id,
      trending_score: p.trending_score,
      is_read: false,
    }));

    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) throw error;

    console.log(`[TREND-ALERTS] Created ${notifications.length} alerts`);

    return new Response(JSON.stringify({
      message: `${notifications.length} trend alerts created`,
      alerts: notifications.length,
      products: newTrends.map((p: any) => p.product_name.substring(0, 50)),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[TREND-ALERTS] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
