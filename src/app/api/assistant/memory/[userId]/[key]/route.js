import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const { userId, key } = params;

    if (!userId || !key) {
      return NextResponse.json({ error: "userId and key required" }, { status: 400 });
    }

    console.log(`[Memory API] Forgetting memory for user ${userId}: ${key}`);

    // In production, this would use your DB client
    // e.g., await db.user_memories.delete({ where: { user_id: userId, memory_key: key } });

    return NextResponse.json({ success: true, message: `Memory forgotten: ${key}` });
  } catch (error) {
    console.error("Memory API (DELETE) Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
