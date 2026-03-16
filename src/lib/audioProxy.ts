import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const PROXIED_AUDIO_HOST_PATTERNS = [
  "akamaized.net",
  "tiktokcdn",
  "byteoversea",
  "ibytedtos",
  "muscdn",
];

function shouldProxyAudio(url: string) {
  return PROXIED_AUDIO_HOST_PATTERNS.some((pattern) => url.includes(pattern));
}

export async function fetchProxiedAudio(originalUrl: string): Promise<string | null> {
  if (!originalUrl) return null;
  if (!shouldProxyAudio(originalUrl)) return originalUrl;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/audio-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url: originalUrl }),
    });

    if (!res.ok) return null;

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
