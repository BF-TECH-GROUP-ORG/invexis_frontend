import { NextResponse } from "next/server";

// Mock database for user memories
// In production, this would use your Prisma/Drizzle/Knex client to access the 'user_memories' table
const mockMemories = new Map();

export async function POST(req) {
  try {
    const { user_id, memory_key, memory_value, source } = await req.json();

    if (!user_id || !memory_key || !memory_value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[Memory API] Saving memory for user ${user_id}: ${memory_key} = ${memory_value} (source: ${source})`);
    
    // Simulate DB upsert
    if (!mockMemories.has(user_id)) mockMemories.set(user_id, []);
    const userMems = mockMemories.get(user_id);
    const existingIdx = userMems.findIndex(m => m.key === memory_key);
    
    if (existingIdx >= 0) {
      userMems[existingIdx].value = memory_value;
      userMems[existingIdx].updatedAt = new Date().toISOString();
    } else {
      userMems.push({ 
        key: memory_key, 
        value: memory_value, 
        source, 
        createdAt: new Date().toISOString() 
      });
    }

    return NextResponse.json({ success: true, message: "Memory saved" });
  } catch (error) {
    console.error("Memory API (POST) Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const memories = mockMemories.get(userId) || [];
    return NextResponse.json(memories);
  } catch (error) {
    console.error("Memory API (GET) Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    console.log(`[Memory API] Clearing all memories for user ${userId}`);
    mockMemories.set(userId, []);

    return NextResponse.json({ success: true, message: "All memories cleared" });
  } catch (error) {
    console.error("Memory API (DELETE) Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
