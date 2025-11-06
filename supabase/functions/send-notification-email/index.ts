import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'analysis_complete' | 'dispute_deadline' | 'score_update' | 'followup_needed';
  userId: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userId, data }: NotificationRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user email and preferences
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user) throw new Error('User not found');

    const { data: prefs, error: prefsError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefsError) throw prefsError;

    // Check if user wants this notification type
    const shouldSend = 
      (type === 'analysis_complete' && prefs.notify_analysis_complete) ||
      (type === 'dispute_deadline' && prefs.notify_dispute_deadline) ||
      (type === 'score_update' && prefs.notify_score_update) ||
      (type === 'followup_needed' && prefs.notify_followup_needed);

    if (!shouldSend) {
      return new Response(
        JSON.stringify({ message: 'Notification disabled by user preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build notification content
    let subject = '';
    let content = '';

    switch (type) {
      case 'analysis_complete':
        subject = '✅ Credit Report Analysis Complete';
        content = `Your credit report has been analyzed. We found ${data?.issueCount || 0} potential issues that you can dispute.`;
        break;
      
      case 'dispute_deadline':
        subject = '⏰ Dispute Response Deadline Approaching';
        content = `Your dispute with ${data?.bureau} is due for a response on ${data?.deadline}. We're monitoring it automatically.`;
        break;
      
      case 'score_update':
        subject = '📊 Credit Score Update';
        content = `Your ${data?.bureau} credit score has been updated to ${data?.score}. ${data?.change > 0 ? '🎉 Great improvement!' : 'Keep working on it!'}`;
        break;
      
      case 'followup_needed':
        subject = '🚨 Bureau Missed Deadline - Action Required';
        content = `${data?.bureau} has not responded within 30 days. You can now file a CFPB complaint for automatic removal.`;
        break;
    }

    // In production, integrate with Resend or SendGrid
    // For now, just log the notification
    console.log('📧 Email Notification:', {
      to: userData.user.email,
      subject,
      content,
      type
    });

    // Store notification in database for in-app display
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: 'notification_sent',
      event_data: { type, subject, sent_at: new Date().toISOString() }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent',
        preview: { subject, content }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-notification-email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});