import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { ASSISTANT_CONFIG } from "@/config/assistant.config";
import {
  buildSystemPrompt,
  INVEXIX_APP_INFO,
} from "@/lib/assistant/systemPrompt";
import {
  formatToolsForGroq,
  formatToolsForClaude,
} from "@/lib/assistant/tools";
import { resolveTextModel, GROQ_MODELS } from "@/lib/assistant/modelRouter";

async function executeTool(toolName, toolArgs, userId) {
  console.log(`[Assistant] Executing tool: ${toolName}`, toolArgs);
  
  if (toolName === "send_registration_email") {
    // Basic implementation for registration
    return { success: true, message: "Registration request sent to onboarding team." };
  }

  if (toolName === "save_memory") {
    // In production, save to DB. For now return success so LLM can confirm.
    return { success: true, message: `Memory saved: ${toolArgs.memory_value}` };
  }

  if (toolName === "forget_memory") {
    return { success: true, message: `Memory forgotten: ${toolArgs.memory_key}` };
  }

  if (toolName === "escalate_to_support") {
    return { success: true, message: "Support team alerted." };
  }

  return { error: `Unknown tool: ${toolName}` };
}

export async function POST(req) {
  const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  console.log(
    `[Assistant API] Request received at ${new Date().toISOString()}`,
  );
  console.log(`[Assistant API] Groq Key Present: ${!!groqKey}`);

  try {
    const body = await req.json();
    const { messages, context, image } = body;

    console.log(`[Assistant API] Messages Count: ${messages?.length}`);
    console.log(`[Assistant API] Context provided: ${!!context}`);

    const { aiProvider } = ASSISTANT_CONFIG;

    // Use systemPrompt from context if provided (for frontend control), otherwise build it
    const systemPrompt =
      context?.systemPrompt || buildSystemPrompt(INVEXIX_APP_INFO, context);

    if (aiProvider === "groq") {
      if (!groqKey) {
        console.error("[Assistant API] NEXT_PUBLIC_GROQ_API_KEY is missing");
        return NextResponse.json(
          { error: "GROQ_API_KEY is not set on the server." },
          { status: 500 },
        );
      }

      const groq = new Groq({ apiKey: groqKey });

      const lastMessage = messages[messages.length - 1]?.content || "";
      let model = resolveTextModel(lastMessage);

      let payloadMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

      if (image && image.base64) {
        model = GROQ_MODELS.vision;
        const lastMsg = payloadMessages.pop();
        payloadMessages.push({
          role: "user",
          content: [
            { type: "text", text: lastMsg.content || "What is in this image?" },
            {
              type: "image_url",
              image_url: { url: `data:${image.type};base64,${image.base64}` },
            },
          ],
        });
      }

      console.log(`[Assistant API] Calling Groq with model: ${model}`);

      const chatCompletion = await groq.chat.completions.create({
        model: model,
        messages: payloadMessages,
        tools: formatToolsForGroq(),
        tool_choice: "auto",
        max_tokens: 1024,
      });

      let message = chatCompletion.choices[0].message;
      let usage =
        process.env.NODE_ENV === "development" ? chatCompletion.usage : null;

      // Handle Tool Calls (Server-side)
      if (message.tool_calls?.length > 0) {
        const call = message.tool_calls[0];
        console.log(
          `[Assistant API] Tool call detected: ${call.function.name}`,
        );
        const args = JSON.parse(call.function.arguments);
        const result = await executeTool(call.function.name, args);

        const chatCompletion2 = await groq.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            message,
            {
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(result),
            },
          ],
        });

        let finalUsage = usage;
        if (process.env.NODE_ENV === "development" && chatCompletion2.usage) {
          finalUsage = {
            prompt_tokens:
              (usage?.prompt_tokens || 0) + chatCompletion2.usage.prompt_tokens,
            completion_tokens:
              (usage?.completion_tokens || 0) +
              chatCompletion2.usage.completion_tokens,
            total_tokens:
              (usage?.total_tokens || 0) + chatCompletion2.usage.total_tokens,
          };
        }

        return NextResponse.json({
          text: chatCompletion2.choices[0].message.content,
          usage: finalUsage,
          toolCall: { name: call.function.name, args: args }
        });
      }

      console.log(`[Assistant API] Success: Response generated.`);
      return NextResponse.json({
        text: message.content,
        usage: usage,
      });
    }

    // Claude implementation (keeping it but adding basic logging)
    if (aiProvider === "claude") {
      console.log("[Assistant API] aiProvider is claude");
      if (!anthropicKey) {
        return NextResponse.json(
          { error: "ANTHROPIC_API_KEY is not set." },
          { status: 500 },
        );
      }
      const payloadMessages = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      if (image && image.base64) {
        const lastMsg = payloadMessages.pop();
        payloadMessages.push({
          role: "user",
          content: [
            { type: "text", text: lastMsg.content || "What is in this image?" },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image.type || "image/png",
                data: image.base64,
              },
            },
          ],
        });
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ASSISTANT_CONFIG.models.claude,
          max_tokens: 1024,
          system: systemPrompt,
          tools: formatToolsForClaude(),
          messages: payloadMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("[Assistant API] Claude Error:", data.error || data);
        return NextResponse.json(
          { error: data.error?.message || "Claude API error" },
          { status: res.status },
        );
      }

      let usage = process.env.NODE_ENV === "development" ? data.usage : null;

      const toolUse = data.content.find((b) => b.type === "tool_use");
      if (toolUse) {
        console.log(`[Assistant API] Claude Tool call: ${toolUse.name}`);
        const result = await executeTool(toolUse.name, toolUse.input);
        const res2 = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: ASSISTANT_CONFIG.models.claude,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...payloadMessages,
              { role: "assistant", content: data.content },
              {
                role: "user",
                content: [
                  {
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content: JSON.stringify(result),
                  },
                ],
              },
            ],
          }),
        });
        const data2 = await res2.json();

        let finalUsage = usage;
        if (process.env.NODE_ENV === "development" && data2.usage) {
          finalUsage = {
            input_tokens: (usage?.input_tokens || 0) + data2.usage.input_tokens,
            output_tokens:
              (usage?.output_tokens || 0) + data2.usage.output_tokens,
          };
        }

        return NextResponse.json({
          text: data2.content.find((b) => b.type === "text")?.text || "",
          usage: finalUsage,
        });
      }

      return NextResponse.json({
        text: data.content.find((b) => b.type === "text")?.text || "",
        usage: usage,
      });
    }
  } catch (error) {
    console.error("[Assistant API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
