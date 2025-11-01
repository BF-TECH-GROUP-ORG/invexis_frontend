import { getUserFromToken, updateUserInDB } from "@/lib/authUtils";

export async function PATCH(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const token = authHeader.split(" ")[1];
    if (!token) return new Response("Unauthorized", { status: 401 });

    const user = await getUserFromToken(token);
    if (!user) return new Response("User not found", { status: 404 });

    const updatedSettings = await req.json();
    const updatedUser = await updateUserInDB(user._id, updatedSettings);

    return new Response(
      JSON.stringify(updatedUser),
      { status: 200 },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Update settings error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
