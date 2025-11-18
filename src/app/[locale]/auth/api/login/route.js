import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/jsonDb";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const users = readJson("users.json");
    const sessions = readJson("sessions.json");

    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user)
      return NextResponse({ error: "Invalid credentials" }, { status: 401 });

    const token = "fake-jwt-" + user._id;

    const ip = req.headers.get("x-forwaded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const session = {
      id: "s" + (sessions.length + 1),
      user_id: user._id,
      start_time: new Date().toISOString(),
      ip,
      device: userAgent,
      country: "Rwanda",
    };

    sessions.push(session);
    writeJson("sessions.json", sessions);

    return NextResponse.json({ user, token, session });
  } catch (err) {
    console.log("Login API Error: ", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
