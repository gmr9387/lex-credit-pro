import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  reportText: z.string().min(50, "Report text too short").max(500000, "Report text exceeds 500KB limit"),
  fileName: z.string().max(255, "File name too long").optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'INVALID_TOKEN' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', code: 'PARSE_ERROR' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          code: 'VALIDATION_ERROR',
          details: validation.error.issues 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reportText, fileName } = validation.data;
    console.log('Analyzing credit report for user:', user.id, 'file:', fileName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

const analysisPrompt = `You are an elite FCRA credit analyst with expertise in consumer protection law and credit scoring algorithms.

ANALYSIS FRAMEWORK:
1. Score Impact Assessment - Prioritize items by their effect on FICO scores
2. Legal Vulnerability - Identify FCRA/FDCPA violations with specific statute citations
3. Dispute Success Probability - Rate based on documentation strength and legal precedent
4. Timeline Optimization - Flag items approaching statute of limitations

For each issue, provide a JSON object with these fields:
{
  "accountName": "exact account name or identifier from report",
  "accountType": "credit_card | personal_loan | auto_loan | mortgage | collection | charge_off | inquiry | public_record",
  "issueType": "duplicate | obsolete | inaccurate_balance | identity_mismatch | unauthorized | incorrect_date | payment_history_error | settled_not_updated | mixed_file | reaged_debt",
  "description": "precise explanation with specific inaccuracies found and their impact on credit score (include exact discrepancies, dates, amounts)",
  "confidenceScore": 0.0-1.0,
  "balance": number or null,
  "dateOpened": "YYYY-MM-DD" or null,
  "recommendedAction": "specific dispute strategy (e.g., 'Method of Verification request under 15 USC 1681i(a)(1)', 'Demand deletion per 7-year rule 15 USC 1681c')",
  "legalBasis": "specific FCRA section (e.g., '15 USC 1681i - Dispute verification', '15 USC 1681c(a)(4) - 7-year obsolescence')",
  "scoreImpact": "estimated score increase if removed (e.g., '+15-25 points', '+40-60 points')",
  "disputeStrength": "strong | moderate | weak",
  "urgency": "immediate | high | normal"
}

PRIORITY SCAN AREAS:
✓ Obsolete items (>7yrs for most negatives, >10yrs for Ch7 bankruptcy)
✓ Duplicate accounts with different creditors/collectors
✓ Re-aged debt (illegal under FCRA 15 USC 1681c(a))
✓ Incorrect payment history vs actual records
✓ Settled/paid accounts still showing negative
✓ Unauthorized hard inquiries (>2yrs old or no permissible purpose)
✓ Mixed files (accounts from someone with similar name/SSN)
✓ Balance errors exceeding $50
✓ Incorrect account status (Open vs Closed, Current vs Delinquent)
✓ Missing "Dispute" notation when consumer disputed directly with furnisher

Credit Report Content:
${reportText}

Return ONLY a valid JSON array of issues. No markdown, no code blocks, no explanatory text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            code: 'RATE_LIMIT'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI credits depleted. Please add credits to continue.',
            code: 'CREDITS_DEPLETED'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('Raw AI response length:', aiResponse.length);

    // Parse the JSON response
    let flaggedItems;
    try {
      // Remove markdown code blocks if present
      const jsonText = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      flaggedItems = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI analysis results');
    }

    if (!Array.isArray(flaggedItems)) {
      console.error('AI response is not an array:', typeof flaggedItems);
      flaggedItems = [];
    }

    console.log(`Found ${flaggedItems.length} potential issues for user:`, user.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        flaggedItems,
        count: flaggedItems.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-credit-report:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'ANALYSIS_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
