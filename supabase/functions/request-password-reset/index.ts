import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate password reset link using Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://creditrepairai.app'}/reset-password`,
      }
    });

    if (error) {
      console.error('Error generating reset link:', error);
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'If an account exists, a reset link has been sent.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resetUrl = data.properties?.action_link;

    // Send email via Resend
    if (resendApiKey && resetUrl) {
      const resend = new Resend(resendApiKey);
      
      const { error: emailError } = await resend.emails.send({
        from: 'Credit Repair AI <notifications@resend.dev>',
        to: [email],
        subject: '🔐 Reset Your Password - Credit Repair AI',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your password for your Credit Repair AI account.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;margin-top:16px;margin-bottom:16px;">Reset Password</a>
            <p style="color:#666;">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
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
      } else {
        console.log('📧 Password reset email sent to:', email);
      }
    } else {
      console.log('📧 Reset link generated (Resend not configured):', resetUrl);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'If an account exists, a reset link has been sent.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in request-password-reset:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
