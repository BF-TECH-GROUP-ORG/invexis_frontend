export async function sendMessage(messages, context, image = null) {
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, context, image }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return data.content;
  } catch (error) {
    console.error('aiClient Error:', error);
    throw error;
  }
}

export async function transcribeAudio(audioBlob, accurate = false) {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('accurate', accurate);

    const res = await fetch('/api/assistant/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    return data.text;
  } catch (error) {
    console.error('Transcription Error:', error);
    throw error;
  }
}
