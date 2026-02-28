
import AddWorkerFormClient from "./AddWorkerFormClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function AddWorker() {
  // Session is provided to client via AddWorkerFormClient's useSession hook.
  // All data fetching (branches, departments) happens client-side in AddWorkerForm,
  // so no server-side prefetching or HydrationBoundary is needed.
  await getServerSession(authOptions); // ensure session cookies are set

  return <AddWorkerFormClient />;
}
