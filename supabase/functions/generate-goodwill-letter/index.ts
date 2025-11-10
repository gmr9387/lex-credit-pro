import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creditorName, accountNumber, latePaymentDate, reason, relationshipLength, positiveHistory } = await req.json();

    console.log("Generating goodwill letter for:", creditorName);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user info
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const userName = profile?.full_name || "Valued Customer";
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Generate goodwill letter using AI
    const prompt = `Generate a professional, sincere goodwill letter requesting removal of a late payment from a credit report.

Details:
- Creditor: ${creditorName}
- Account: ${accountNumber ? `ending in ${accountNumber}` : "on file"}
- Late Payment Date: ${latePaymentDate || "recent"}
- Customer Name: ${userName}
- Relationship Length: ${relationshipLength || "several years"}
- Reason for Late Payment: ${reason}
- Positive Payment History: ${positiveHistory || "consistent on-time payments"}

The letter should:
1. Be written in formal business letter format
2. Include proper salutation and sender/recipient addresses
3. Express sincere apology and take responsibility
4. Explain the one-time nature of the circumstance (not make excuses)
5. Highlight the customer's positive payment history
6. Politely request goodwill adjustment to remove the late payment
7. Express continued loyalty to the company
8. Be warm, humble, and genuine (not entitled)
9. Be exactly 300-400 words
10. Include a professional closing

Make it sound human and heartfelt, not robotic. This is a personal appeal.`;

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://api.lovable.app/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: "You are an expert at writing sincere, effective goodwill letters for credit repair." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("AI API Error:", errorData);
      throw new Error(`AI generation failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const letter = aiData.choices[0]?.message?.content || "";

    // Format the letter with proper header
    const formattedLetter = `${userName}
[Your Address]
[City, State ZIP]

${today}

${creditorName}
Customer Service Department
[Address from creditor's website]

Re: Request for Goodwill Adjustment - Account ${accountNumber ? `ending in ${accountNumber}` : "on file"}

${letter}

Sincerely,

${userName}`;

    console.log("Goodwill letter generated successfully");

    return new Response(
      JSON.stringify({ letter: formattedLetter }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: any) {
    console.error("Error in generate-goodwill-letter:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
