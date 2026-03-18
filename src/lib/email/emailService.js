import { ASSISTANT_CONFIG } from '../../config/assistant.config';

export async function sendRegistrationEmail(data) {
  if (ASSISTANT_CONFIG.emailProvider === 'emailjs') {
    return sendViaEmailJS(data);
  }
  if (ASSISTANT_CONFIG.emailProvider === 'resend') {
    return sendViaResendBackend(data);
  }
  throw new Error(`Unknown email provider: ${ASSISTANT_CONFIG.emailProvider}`);
}

async function sendViaEmailJS(data) {
  const emailjs = await import('@emailjs/browser');
  return emailjs.send(
    process.env.VITE_EMAILJS_SERVICE_ID,
    process.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      to_email:      process.env.VITE_MANAGER_EMAIL || 'onboard@invexix.com',
      full_name:     data.full_name,
      business_email:data.business_email,
      phone_number:  data.phone_number  || 'N/A',
      company_name:  data.company_name,
      desired_role:  data.desired_role  || 'N/A',
      extra_info:    data.extra_info    || 'None',
    },
    process.env.VITE_EMAILJS_PUBLIC_KEY
  );
}

async function sendViaResendBackend(data) {
  const res = await fetch('/api/send-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send registration email');
  return res.json();
}
