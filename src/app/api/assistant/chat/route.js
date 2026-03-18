import { NextResponse } from 'next/server';
import { ASSISTANT_CONFIG } from '@/config/assistant.config';
import { buildSystemPrompt, INVEXIX_APP_INFO } from '@/lib/assistant/systemPrompt';
import { formatToolsForGroq, formatToolsForClaude } from '@/lib/assistant/tools';

async function executeTool(toolName, toolArgs) {
  // This runs on the server now
  if (toolName === 'send_registration_email') {
    const { sendRegistrationEmail } = await import('@/lib/email/emailService');
    await sendRegistrationEmail(toolArgs);
    return { success: true, message: 'Registration request sent.' };
  }
  return { error: `Unknown tool: ${toolName}` };
}

export async function POST(req) {
  try {
    const { messages, context } = await req.json();
    const { aiProvider } = ASSISTANT_CONFIG;
    const systemPrompt = buildSystemPrompt(INVEXIX_APP_INFO, context);

    if (aiProvider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: ASSISTANT_CONFIG.models.groq,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          tools: formatToolsForGroq(),
          tool_choice: 'auto',
          max_tokens: 1024,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      let message = data.choices[0].message;

      // Handle Tool Calls (Server-side)
      if (message.tool_calls?.length > 0) {
        const call = message.tool_calls[0];
        const args = JSON.parse(call.function.arguments);
        const result = await executeTool(call.function.name, args);

        const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: ASSISTANT_CONFIG.models.groq,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages,
              message,
              { role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) },
            ],
          }),
        });
        const data2 = await res2.json();
        return NextResponse.json({ content: data2.choices[0].message.content });
      }

      return NextResponse.json({ content: message.content });
    }

    if (aiProvider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ASSISTANT_CONFIG.models.claude,
          max_tokens: 1024,
          system: systemPrompt,
          tools: formatToolsForClaude(),
          messages: messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const toolUse = data.content.find(b => b.type === 'tool_use');
      if (toolUse) {
        const result = await executeTool(toolUse.name, toolUse.input);
        const res2 = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: ASSISTANT_CONFIG.models.claude,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
              { role: 'assistant', content: data.content },
              { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) }] },
            ],
          }),
        });
        const data2 = await res2.json();
        return NextResponse.json({ content: data2.content.find(b => b.type === 'text')?.text || '' });
      }

      return NextResponse.json({ content: data.content.find(b => b.type === 'text')?.text || '' });
    }

  } catch (error) {
    console.error('Assistant API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
