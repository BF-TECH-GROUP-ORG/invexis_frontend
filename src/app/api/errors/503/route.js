// Test route for 503 Service Unavailable error
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return new Response(
    JSON.stringify({
      error: "Service Unavailable",
      message:
        "The service is temporarily unavailable. Please try again later.",
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "120",
      },
    }
  );
}
