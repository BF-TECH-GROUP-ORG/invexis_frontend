import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { sessionId, messageIndex, feedback, reason, userMessage, inaraReply } = await req.json();
    
    // In a real app, save to your 'Feedback' or 'Analytics' table
    
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
