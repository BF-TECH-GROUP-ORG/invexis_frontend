import { NextResponse } from 'next/server';

// This is a mock. In a real app, you'd use a database like MongoDB.
let sessions = {};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  
  const userSessions = Object.values(sessions).filter(s => s.userId === userId);
  return NextResponse.json(userSessions);
}

export async function POST(req) {
  try {
    const { sessionId, userId, messages, summary } = await req.json();
    
    if (!sessionId || !userId) return NextResponse.json({ error: 'Missing sessionId or userId' }, { status: 400 });
    
    sessions[sessionId] = {
      sessionId,
      userId,
      messages,
      summary: summary || (messages[0]?.content?.slice(0, 80) + '...'),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
