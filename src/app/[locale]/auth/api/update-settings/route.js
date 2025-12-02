export async function PATCH(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const updatedSettings = await req.json();

    // Proxy the update to the backend API; the backend handles authorization using the provided token
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(updatedSettings),
      credentials: "include",
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Update settings error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
