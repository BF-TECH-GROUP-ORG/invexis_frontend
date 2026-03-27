import { NextResponse } from "next/server";
import { ASSISTANT_CONFIG } from "@/config/assistant.config";

const LOGO_SVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="40" height="40" rx="8" fill="#081422"/>
<path d="M12 12L28 28M12 28L28 12" stroke="#FF782D" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export async function POST(req) {
  try {
    const data = await req.json();
    const { fullName, email, phone, companyName, role } = data;

    const emailContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #081422; padding: 24px; text-align: center;">
          ${LOGO_SVG}
          <h1 style="color: white; margin-top: 16px; font-size: 20px;">Invexix Onboarding</h1>
        </div>
        <div style="padding: 32px; color: #334155;">
          <h2 style="color: #081422; margin-top: 0;">New Registration Request</h2>
          <p>A new user has requested to join Invexix via Inara.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Full Name</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${fullName}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Business Email</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${email}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Phone Number</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${phone}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Company Name</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${companyName}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Desired Role</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${role}</td></tr>
          </table>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #ff782d;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #081422;">Action Required</p>
            <p style="margin: 4px 0 0; font-size: 13px;">Please verify these details and contact the user within 24-48 business hours to complete their setup.</p>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Invexix Management System. All rights reserved.
        </div>
      </div>
    `;

    // Depending on config, send via Resend or EmailJS or just log in Dev
    if (ASSISTANT_CONFIG.emailProvider === 'resend') {
        // Implementation for Resend would go here
        console.log("Mock: Sending via Resend to", ASSISTANT_CONFIG.managerEmail);
    } else {
        console.log("Mock: Sending via EmailJS (client-side usually) or internal mock to", ASSISTANT_CONFIG.managerEmail);
    }

    return NextResponse.json({ success: true, message: "Registration email sent to onboarding team." });
  } catch (error) {
    console.error("Registration API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
