import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NotificationRequest {
  type: 'analysis_complete' | 'dispute_deadline' | 'score_update' | 'followup_needed' | 'password_reset';
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user) throw new Error('User not found');

    const userEmail = userData.user.email;
    if (!userEmail) throw new Error('User email not found');

    // Get user preferences (skip for password reset - always send)
    let shouldSend = type === 'password_reset';
    
    if (!shouldSend) {
      const { data: prefs } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (prefs) {
        shouldSend = 
          (type === 'analysis_complete' && prefs.notify_analysis_complete) ||
          (type === 'dispute_deadline' && prefs.notify_dispute_deadline) ||
          (type === 'score_update' && prefs.notify_score_update) ||
          (type === 'followup_needed' && prefs.notify_followup_needed);
      }
    }

    if (!shouldSend) {
      return new Response(
        JSON.stringify({ message: 'Notification disabled by user preferences' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build notification content
    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'analysis_complete':
        subject = '✅ Credit Report Analysis Complete - Credit Repair AI';
        htmlContent = `
          <h1>Your Credit Report Analysis is Ready!</h1>
          <p>Great news! We've finished analyzing your credit report and found <strong>${data?.issueCount || 0} potential issues</strong> that you can dispute.</p>
          <p>Log in to your dashboard to review the findings and start generating dispute letters.</p>
          <a href="${data?.dashboardUrl || 'https://creditrepairai.app'}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">View Your Analysis</a>
        `;
        break;
      
      case 'dispute_deadline':
        subject = `⏰ Dispute Deadline Alert: ${data?.bureau} Response Due ${data?.deadline}`;
        htmlContent = `
          <h1>Dispute Response Deadline Approaching</h1>
          <p>Your dispute with <strong>${data?.bureau}</strong> is due for a response on <strong>${data?.deadline}</strong>.</p>
          <p>Days remaining: <strong>${data?.daysRemaining}</strong></p>
          <p>Under the FCRA, credit bureaus must respond within 30 days. We're monitoring this for you automatically.</p>
          <p>If they don't respond in time, you may be eligible to file a CFPB complaint for automatic removal.</p>
        `;
        break;
      
      case 'score_update':
        subject = `📊 Credit Score Update: ${data?.bureau} - ${data?.score}`;
        const changeText = data?.change > 0 
          ? `🎉 Your score increased by ${data?.change} points!` 
          : data?.change < 0 
          ? `Your score decreased by ${Math.abs(data?.change)} points.`
          : 'Your score remained the same.';
        htmlContent = `
          <h1>Credit Score Update</h1>
          <p>Your <strong>${data?.bureau}</strong> credit score has been updated to <strong>${data?.score}</strong>.</p>
          <p>${changeText}</p>
          <p>Keep up the great work on your credit repair journey!</p>
        `;
        break;
      
      case 'followup_needed':
        subject = `🚨 ACTION REQUIRED: ${data?.bureau} Missed 30-Day Deadline`;
        htmlContent = `
          <h1>Bureau Missed Response Deadline!</h1>
          <p><strong>${data?.bureau}</strong> has not responded to your dispute within the legally required 30 days.</p>
          <p><strong>Dispute sent:</strong> ${data?.sentDate}</p>
          <p><strong>Deadline was:</strong> ${data?.deadline}</p>
          <h2>What This Means</h2>
          <p>Under FCRA Section 611, the bureau must respond within 30 days. Their failure to do so may entitle you to:</p>
          <ul>
            <li>Automatic deletion of the disputed item</li>
            <li>File a complaint with the CFPB</li>
            <li>Potential statutory damages of $100-$1,000 per violation</li>
          </ul>
          <a href="${data?.dashboardUrl || 'https://creditrepairai.app'}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">File CFPB Complaint</a>
        `;
        break;

      case 'password_reset':
        subject = '🔐 Reset Your Password - Credit Repair AI';
        htmlContent = `
          <h1>Password Reset Request</h1>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${data?.resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;margin-top:16px;">Reset Password</a>
          <p style="margin-top:24px;color:#666;">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
        `;
        break;
    }

    // Send email via Resend if API key is configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      const { error: emailError } = await resend.emails.send({
        from: 'Credit Repair AI <notifications@resend.dev>',
        to: [userEmail],
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${htmlContent}
            <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; margin-top: 16px;">
              Credit Repair AI - Your AI-Powered Credit Optimization Platform<br/>
              🔒 AES-256 Encrypted | FCRA/FDCPA Compliant
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }

      console.log('📧 Email sent successfully to:', userEmail);
    } else {
      // Log the notification if Resend is not configured
      console.log('📧 Email Notification (Resend not configured):', {
        to: userEmail,
        subject,
        type
      });
    }

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
        preview: { subject }
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