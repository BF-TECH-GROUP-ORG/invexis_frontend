
import AddWorkerFormClient from "./AddWorkerFormClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';

export default async function AddWorker() {
  await getServerSession(authOptions); // ensure session cookies are set

  return <AddWorkerFormClient />;
}

