import { NextResponse } from 'next/server';
import { ASSISTANT_CONFIG } from "@/config/assistant.config";

export async function POST(req) {
  try {
    const data = await req.json();
    const { 
      summary, 
      transcript, 
      urgency = 'medium', 
      userId, 
      userName, 
      userRole, 
      userShop,
      timestamp = new Date().toISOString()
    } = data;
    
    console.log(`[Escalation API] New support alert:
      Summary: ${summary}
      Urgency: ${urgency}
      User: ${userName || userId} (${userRole})
      Shop: ${userShop}
      Time: ${timestamp}
      Transcript Lines: ${transcript ? transcript.split('\n').length : 0}
    `);

    // In production, send via Resend/EmailJS to support@invexix.com
    // e.g., await resend.emails.send({ from: 'Inara <inara@invexix.com>', to: 'support@invexix.com', ... });
    
    return NextResponse.json({ success: true, message: 'Support team alerted. They will review your conversation history and be in touch.' });
  } catch (error) {
    console.error("Escalation API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
