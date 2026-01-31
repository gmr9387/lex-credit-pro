import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const itemDetailsSchema = z.object({
  accountName: z.string().max(200, "Account name too long"),
  issueType: z.string().max(100, "Issue type too long"),
  description: z.string().max(2000, "Description too long"),
  balance: z.number().optional(),
  dateOpened: z.string().max(50).optional(),
});

const requestSchema = z.object({
  itemDetails: itemDetailsSchema,
  bureau: z.enum(['Experian', 'TransUnion', 'Equifax', 'experian', 'transunion', 'equifax']),
  roundNumber: z.number().int().min(1, "Round number must be at least 1").max(10, "Round number cannot exceed 10"),
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
        JSON.stringify({ error: 'Unauthorized' }),
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
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { itemDetails, bureau, roundNumber } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating dispute letter for user:', user.id, { bureau, roundNumber });

    const systemPrompt = `You are a legal expert specializing in FCRA (Fair Credit Reporting Act), FDCPA (Fair Debt Collection Practices Act), and CFPB regulations.

Your task is to generate legally compliant dispute letters for credit reporting errors. Each letter must:

1. Be professional and legally sound
2. Cite specific FCRA statutes (e.g., 15 U.S.C. § 1681)
3. Clearly describe the disputed item and the specific error
4. Demand investigation and correction under federal law
5. Include a 30-day response deadline requirement
6. Be unique in wording (especially for Round 2+ disputes)
7. Maintain firm but respectful tone

CRITICAL STATUTES TO CITE:
- 15 U.S.C. § 1681i - Procedure in case of disputed accuracy
- 15 U.S.C. § 1681b - Permissible purposes
- 15 U.S.C. § 1681s-2 - Responsibilities of furnishers

Format the letter with:
- Current date placeholder [DATE]
- Bureau address
- Account holder information placeholder [YOUR NAME AND ADDRESS]
- Clear subject line
- Detailed dispute explanation
- Legal citations
- Formal closing

Do NOT include personal identifying information - use placeholders.`;

    const userPrompt = `Generate a Round ${roundNumber} FCRA dispute letter for the following credit reporting error:

Bureau: ${bureau}
Account: ${itemDetails.accountName}
Issue Type: ${itemDetails.issueType}
Description: ${itemDetails.description}
${itemDetails.balance ? `Balance: $${itemDetails.balance}` : ''}
${itemDetails.dateOpened ? `Date Opened: ${itemDetails.dateOpened}` : ''}

${roundNumber > 1 ? 'This is a follow-up dispute. Use different wording and add escalation language about potential CFPB complaints.' : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const letterContent = data.choices[0].message.content;

    console.log('Dispute letter generated successfully for user:', user.id);

    return new Response(
      JSON.stringify({ letterContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-dispute-letter:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
