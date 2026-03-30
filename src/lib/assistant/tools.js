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
  {
    name: 'escalate_to_support',
    description: 'Escalate a complex or unresolved issue to the human support team',
    parameters: {
      type: 'object',
      properties: {
        issue_summary: { type: 'string', description: 'A concise summary of the problem' },
        urgency:       { type: 'string', enum: ['low', 'medium', 'high'], description: 'Urgency level' },
        user_contact:  { type: 'string', description: 'The best way to reach the user' },
      },
      required: ['issue_summary', 'urgency'],
    },
  },
  {
    name: 'save_memory',
    description: `Save a persistent fact about the user to memory.
Use this when the user reveals a preference, a recurring pattern,
or explicitly asks Inara to remember something.
Only save genuinely useful, non-sensitive facts.
Never save passwords, financial data, or health information.
Examples of good memories:
- preferred_shop: "Kigali Branch"
- language_preference: "French"  
- common_task: "daily stock reconciliation"
- struggled_with: "Level 3 category selection"
- prefers_short_answers: "true"`,
    parameters: {
      type: 'object',
      properties: {
        memory_key: {
          type: 'string',
          description: 'Short snake_case key describing what this memory is. e.g. preferred_shop, language_preference, common_task',
        },
        memory_value: {
          type: 'string',
          description: 'The value to remember. Keep it concise — one sentence max.',
        },
        reason: {
          type: 'string',
          description: 'Brief internal note on why this was saved. Not shown to user.',
        },
      },
      required: ['memory_key', 'memory_value'],
    },
  },
  {
    name: 'forget_memory',
    description: 'Delete a specific memory about the user. Use when the user asks Inara to forget something.',
    parameters: {
      type: 'object',
      properties: {
        memory_key: {
          type: 'string',
          description: 'The key of the memory to delete.',
        },
      },
      required: ['memory_key'],
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
