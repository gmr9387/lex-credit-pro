import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's credit data
    const [flaggedItems, disputes, scores] = await Promise.all([
      supabase.from('flagged_items').select('*').eq('user_id', user.id),
      supabase.from('disputes').select('*').eq('user_id', user.id),
      supabase.from('score_snapshots').select('*').eq('user_id', user.id).order('snapshot_date', { ascending: false }).limit(3),
    ]);

    const creditProfile = {
      flaggedItemsCount: flaggedItems.data?.length || 0,
      flaggedItems: flaggedItems.data || [],
      disputesCount: disputes.data?.length || 0,
      disputes: disputes.data || [],
      currentScore: scores.data?.[0]?.score,
      recentScores: scores.data || [],
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a credit repair expert AI advisor. Analyze the user's credit profile and provide personalized recommendations.

Focus on:
1. Which disputes to prioritize based on impact potential
2. Credit rebuilding strategies based on their current situation
3. Specific actions they should take next
4. Timeline expectations

Be specific, actionable, and encouraging. Format your response as structured recommendations.`;

    const userPrompt = `Credit Profile:
- Current Score: ${creditProfile.currentScore || 'Not recorded'}
- Flagged Items: ${creditProfile.flaggedItemsCount}
- Active Disputes: ${creditProfile.disputesCount}
- Recent Score Trend: ${creditProfile.recentScores.map(s => s.score).join(' → ')}

Flagged Items Details:
${creditProfile.flaggedItems.map(item => 
  `- ${item.account_name} (${item.issue_type}): ${item.description}`
).join('\n')}

Provide personalized credit improvement recommendations.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const recommendations = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ 
      recommendations,
      creditProfile: {
        currentScore: creditProfile.currentScore,
        flaggedItemsCount: creditProfile.flaggedItemsCount,
        disputesCount: creditProfile.disputesCount,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in credit-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
