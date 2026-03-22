import { NextResponse } from 'next/server';
import { GROQ_MODELS } from '@/lib/assistant/modelRouter';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file');
    const isAccurate = formData.get('accurate') === 'true';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const model = isAccurate ? GROQ_MODELS.whisper_accurate : GROQ_MODELS.whisper_fast;

    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', model);
    groqFormData.append('response_format', 'json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`,
      },
      body: groqFormData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'Transcription failed');
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text });

  } catch (error) {
    console.error('Transcription API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
