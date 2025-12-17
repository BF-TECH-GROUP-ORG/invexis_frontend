// Test route for 504 Gateway Timeout error
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return new Response(
    JSON.stringify({
      error: "Gateway Timeout",
      message:
        "The server did not receive a timely response from the upstream server.",
    }),
    {
      status: 504,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
