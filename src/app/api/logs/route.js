import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const DUMMY_LOGS = [
  {
    id: 1,
    actor: "alice@company.test",
    action: "created branch",
    target: "Branch: Kigali 1",
    ts: new Date().toISOString(),
  },
  {
    id: 2,
    actor: "bob@company.test",
    action: "updated product price",
    target: "Product: Rice 5kg",
    ts: new Date().toISOString(),
  },
  {
    id: 3,
    actor: "carol@company.test",
    action: "revoked session",
    target: "Session: 0x123...",
    ts: new Date().toISOString(),
  },
];

export async function GET(req) {
  // Protect this API so only company_admins can read logs
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userRole = token?.user?.role ?? token?.role ?? null;

    if (userRole !== "company_admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, logs: DUMMY_LOGS }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
