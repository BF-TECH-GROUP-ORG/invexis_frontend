export const ASSISTANT_TOOLS = [
  {
    name: 'send_registration_email',
    description: 'Send a company/user registration request email to the Invexix onboarding team',
    parameters: {
      type: 'object',
      properties: {
        full_name:     { type: 'string', description: 'Full name of the contact person' },
        business_email:{ type: 'string', description: 'Business email address' },
        phone_number:  { type: 'string', description: 'Phone number' },
        company_name:  { type: 'string', description: 'Company or branch name' },
        desired_role:  { type: 'string', description: 'The role they need: Company Admin, Manager, Seller, or Viewer' },
        extra_info:    { type: 'string', description: 'Any additional information provided' },
      },
      required: ['full_name', 'business_email', 'company_name'],
    },
  },
];

// Groq/OpenAI-compatible format
export function formatToolsForGroq() {
  return ASSISTANT_TOOLS.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

// Claude format (for production)
export function formatToolsForClaude() {
  return ASSISTANT_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}
