export const ASSISTANT_CONFIG = {
  // AI_PROVIDER env var controls which backend to use. Defaults to 'groq'.
  // Set AI_PROVIDER=claude on your cloud dashboard only if you have a Claude key configured.
  aiProvider: process.env.AI_PROVIDER || 'groq',

  models: {
    groq: 'llama-3.3-70b-versatile',
    claude: 'claude-haiku-4-5-20251001',
  },

  emailProvider: process.env.EMAIL_PROVIDER || 'emailjs',
  managerEmail: process.env.MANAGER_EMAIL || 'onboard@invexix.com',
};

