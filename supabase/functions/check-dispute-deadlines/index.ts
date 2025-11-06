import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    // Find disputes with approaching deadlines
    const { data: approachingDeadlines, error: deadlineError } = await supabase
      .from('disputes')
      .select('*')
      .eq('status', 'sent')
      .is('outcome', null)
      .gte('response_deadline', now.toISOString())
      .lte('response_deadline', in3Days.toISOString());

    if (deadlineError) throw deadlineError;

    // Find overdue disputes
    const { data: overdueDisputes, error: overdueError } = await supabase
      .from('disputes')
      .select('*')
      .eq('status', 'sent')
      .is('outcome', null)
      .lt('response_deadline', now.toISOString())
      .eq('auto_followup_scheduled', false);

    if (overdueError) throw overdueError;

    let notificationsSent = 0;

    // Send deadline reminders
    for (const dispute of approachingDeadlines || []) {
      const daysUntil = Math.ceil(
        (new Date(dispute.response_deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'dispute_deadline',
          userId: dispute.user_id,
          data: {
            bureau: dispute.bureau,
            deadline: new Date(dispute.response_deadline).toLocaleDateString(),
            daysRemaining: daysUntil
          }
        }
      });

      notificationsSent++;
    }

    // Send follow-up needed alerts for overdue
    for (const dispute of overdueDisputes || []) {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'followup_needed',
          userId: dispute.user_id,
          data: {
            bureau: dispute.bureau,
            sentDate: new Date(dispute.sent_date!).toLocaleDateString(),
            deadline: new Date(dispute.response_deadline).toLocaleDateString()
          }
        }
      });

      // Mark as scheduled so we don't spam
      await supabase
        .from('disputes')
        .update({ auto_followup_scheduled: true })
        .eq('id', dispute.id);

      notificationsSent++;
    }

    console.log(`✅ Deadline checker complete: ${notificationsSent} notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        approaching: approachingDeadlines?.length || 0,
        overdue: overdueDisputes?.length || 0,
        notificationsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in deadline checker:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});