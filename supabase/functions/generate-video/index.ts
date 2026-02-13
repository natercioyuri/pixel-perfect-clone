const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, image } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'generate') {
      // Use Lovable AI to generate a video script/storyboard
      const messages = [
        {
          role: 'system',
          content: 'You are a viral TikTok video script creator. Create detailed, engaging video scripts with scenes, camera angles, transitions, and text overlays. Format as a structured storyboard. Write in Portuguese (BR).'
        },
        {
          role: 'user',
          content: prompt || 'Create a viral TikTok product video script'
        }
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Gateway error [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const script = data.choices?.[0]?.message?.content || 'Erro ao gerar script';

      return new Response(
        JSON.stringify({
          success: true,
          script,
          message: 'Script de vídeo gerado com sucesso! Use este roteiro para criar seu vídeo viral.',
          // Simulate operation for polling compatibility
          operationName: `op_${Date.now()}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'poll') {
      // Return immediately as done with the script
      return new Response(
        JSON.stringify({
          done: true,
          message: 'Script gerado com sucesso!',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "generate" or "poll".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
