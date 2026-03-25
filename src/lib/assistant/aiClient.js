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



    if (data.error) {
      // Extract technical message but throw a standardized error
      const technicalMsg = data.error?.message || data.error?.error?.message || JSON.stringify(data.error);
      const error = new Error("Inara is having trouble connecting right now.");
      error.technicalDetails = technicalMsg; // Preserved for future tracking
      throw error;
    }

    return data.content;
  } catch (error) {
    /*  */
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



    if (data.error) {
      const technicalMsg = data.error?.message || data.error?.error?.message || JSON.stringify(data.error);
      const error = new Error("I couldn't quite catch that. Please try speaking again.");
      error.technicalDetails = technicalMsg; // Preserved
      throw error;
    }

    return data.text;
  } catch (error) {
    /*  */
    throw error;
  }
}
