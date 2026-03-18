const isDev = process.env.NODE_ENV === 'development';

export const ASSISTANT_CONFIG = {
  aiProvider: isDev ? 'groq' : 'claude',

  models: {
    groq: 'llama-3.3-70b-versatile',
    claude: 'claude-haiku-4-5-20251001',
  },

  emailProvider: isDev ? 'emailjs' : 'resend',
  managerEmail: process.env.VITE_MANAGER_EMAIL || 'onboard@invexix.com',
};
