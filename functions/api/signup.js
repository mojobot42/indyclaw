export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { email } = await context.request.json();
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamp = new Date().toISOString();
    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    // 1. Send welcome email from onboarding@resend.dev
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IndyClaw <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to IndyClaw — Let\'s Talk About Your Business',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <h2 style="color: #f97316;">🦀 Welcome to IndyClaw!</h2>
            <p>Hi there,</p>
            <p>Thank you for signing up — we're thrilled to have you. You're among the first to explore what AI agents can do for Indianapolis businesses, and our team is looking forward to connecting with you.</p>
            <p>To make the most of your <strong>free discovery call</strong>, it would be great to learn a bit about you beforehand. When you have a moment, just reply to this email with:</p>
            <ul style="margin: 16px 0; padding-left: 20px;">
              <li><strong>A brief description of your business</strong> — what you do, who you serve, and how big your team is</li>
              <li><strong>Any pain points or bold ideas</strong> you'd like our team of AI experts to help you solve</li>
              <li><strong>Your preferred time</strong> for the discovery call — mornings, afternoons, or a specific day that works best</li>
              <li><strong>Your preference for the call</strong> — phone call or video call?</li>
            </ul>
            <p>No pressure to answer everything right now — even a few sentences helps us prepare a more valuable conversation for you.</p>
            <p>Just hit reply — this goes directly to our team.</p>
            <p>We're excited to show you what's possible.<br><br>Warm regards,<br><strong>The IndyClaw Team</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="font-size: 12px; color: #999;">IndyClaw — AI agents for Indianapolis businesses.<br>Powered by OpenClaw + NVIDIA NemoClaw.</p>
          </div>
        `,
        reply_to: 'mojobot42@gmail.com',
      }),
    });

    // 2. Notify mojobot42@gmail.com about the new signup
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IndyClaw Signups <onboarding@resend.dev>',
        to: 'mojobot42@gmail.com',
        subject: `🦀 New IndyClaw Signup: ${email}`,
        html: `<p>New signup at ${timestamp}</p><p><strong>Email:</strong> ${email}</p>`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
