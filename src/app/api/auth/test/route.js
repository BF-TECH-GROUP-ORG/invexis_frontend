import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token)
      return NextResponse.json(
        { ok: false, message: "No session" },
        { status: 401 }
      );
    return NextResponse.json({ ok: true, token }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "Error", error: err?.message },
      { status: 500 }
    );
  }
}
