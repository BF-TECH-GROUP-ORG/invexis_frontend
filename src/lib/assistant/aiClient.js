export async function executeTool(toolName, toolArgs, userId) {
  if (toolName === "send_registration_email") {
    // This could be a fetch to your backend that sends the actual email
    await fetch("/api/assistant/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toolArgs),
    });
    return { success: true, message: "Registration request sent." };
  }

  // ─── Save memory ───
  if (toolName === "save_memory") {
    if (!userId) return { success: false, message: "No user ID available." };
    await fetch("/api/assistant/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        memory_key: toolArgs.memory_key,
        memory_value: toolArgs.memory_value,
        source: "inara",
      }),
    });
    return { success: true, message: `Got it — I'll remember that.` };
  }

  // ─── Forget memory ───
  if (toolName === "forget_memory") {
    if (!userId) return { success: false, message: "No user ID available." };
    await fetch(`/api/assistant/memory/${userId}/${toolArgs.memory_key}`, {
      method: "DELETE",
    });
    return { success: true, message: `Done — I've forgotten that.` };
  }

  if (toolName === "escalate_to_support") {
    await fetch("/api/assistant/escalate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...toolArgs, userId }),
    });
    return { success: true, message: "Escalated to support team." };
  }

  return { error: `Unknown tool: ${toolName}` };
}

export async function sendMessage(messages, context, image = null) {
  try {
    const res = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, context, image }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const technicalMsg =
        data.error?.message ||
        data.error?.error?.message ||
        JSON.stringify(data.error || data);
      const error = new Error("Inara is having trouble connecting right now.");
      error.technicalDetails = technicalMsg;
      throw error;
    }

    const text = data.text || data.content || "";
    if (!text) {
      throw new Error("Inara returned an empty response. Please try again.");
    }

    return {
      text,
      usage: data.usage,
    };
  } catch (error) {
    /*  */
    throw error;
  }
}

export async function transcribeAudio(audioBlob, accurate = false) {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("accurate", accurate);

    const res = await fetch("/api/assistant/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      const technicalMsg =
        data.error?.message ||
        data.error?.error?.message ||
        JSON.stringify(data.error);
      const error = new Error(
        "I couldn't quite catch that. Please try speaking again.",
      );
      error.technicalDetails = technicalMsg; // Preserved
      throw error;
    }

    return data.text;
  } catch (error) {
    /*  */
    throw error;
  }
}
