import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportText, fileName } = await req.json();
    console.log('Analyzing credit report:', fileName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const analysisPrompt = `You are a credit report analysis expert. Analyze the following credit report and identify ALL potential errors, inaccuracies, and issues that could be disputed under the Fair Credit Reporting Act (FCRA).

For EACH issue you find, provide:
1. Account name/creditor
2. Account type (credit card, loan, collection, etc.)
3. Issue type (duplicate, obsolete, inaccurate_balance, identity_mismatch, unauthorized, or other)
4. Detailed description of the problem
5. Confidence score (0.0 to 1.0) - how certain you are this is an error
6. Balance (if applicable)
7. Date opened (if available)

Common issues to look for:
- Duplicate accounts (same account reported multiple times)
- Obsolete accounts (older than 7 years for most items, 10 for bankruptcy)
- Inaccurate balances or payment history
- Accounts you don't recognize (identity theft)
- Incorrect personal information
- Accounts with wrong dates
- Mixed files (accounts belonging to someone else)
- Late payments reported incorrectly

Return ONLY a valid JSON array of issues. Each issue must follow this exact format:
{
  "accountName": "string",
  "accountType": "string",
  "issueType": "duplicate|obsolete|inaccurate_balance|identity_mismatch|unauthorized|other",
  "description": "string",
  "confidenceScore": 0.0-1.0,
  "balance": number or null,
  "dateOpened": "YYYY-MM-DD" or null
}

Credit Report Content:
${reportText}

Return ONLY the JSON array, no other text.`;

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

    console.log('Raw AI response:', aiResponse);

    // Parse the JSON response
    let flaggedItems;
    try {
      // Remove markdown code blocks if present
      const jsonText = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      flaggedItems = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response was:', aiResponse);
      throw new Error('Failed to parse AI analysis results');
    }

    if (!Array.isArray(flaggedItems)) {
      console.error('AI response is not an array:', flaggedItems);
      flaggedItems = [];
    }

    console.log(`Found ${flaggedItems.length} potential issues`);

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
