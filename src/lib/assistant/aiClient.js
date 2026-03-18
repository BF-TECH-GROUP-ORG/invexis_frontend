export async function sendMessage(messages, context) {
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, context }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return data.content;
  } catch (error) {
    console.error('aiClient Error:', error);
    throw error;
  }
}
