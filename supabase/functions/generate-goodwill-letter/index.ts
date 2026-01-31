import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  creditorName: z.string().min(1, "Creditor name required").max(200, "Creditor name too long"),
  accountNumber: z.string().max(50, "Account number too long").optional(),
  latePaymentDate: z.string().max(50, "Date too long").optional(),
  reason: z.string().min(10, "Reason too short").max(1000, "Reason too long"),
  relationshipLength: z.string().max(100, "Relationship length too long").optional(),
  positiveHistory: z.string().max(500, "Positive history too long").optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check first (before parsing body)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user info
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { creditorName, accountNumber, latePaymentDate, reason, relationshipLength, positiveHistory } = validation.data;

    console.log("Generating goodwill letter for user:", user.id, "creditor:", creditorName);

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

    console.log("Goodwill letter generated successfully for user:", user.id);

    return new Response(
      JSON.stringify({ letter: formattedLetter }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: unknown) {
    console.error("Error in generate-goodwill-letter:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
