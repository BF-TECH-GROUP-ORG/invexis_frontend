// Test route for 400 Bad Request error
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return new Response(
    JSON.stringify({
      error: "Bad Request",
      message: "The request could not be understood by the server",
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
