// Test route for 500 Internal Server Error
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Simulate a server error by throwing an exception
  throw new Error("Simulated internal server error for testing");
}
