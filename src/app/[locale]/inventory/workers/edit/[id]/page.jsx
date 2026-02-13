import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { getWorkerById } from "@/services/workersService";
import EditWorkerPageClient from "./EditWorkerPageClient";

export const metadata = {
    title: "Edit Worker",
};

export default async function EditWorkerPage({ params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const queryClient = getQueryClient();

    // Prefetch worker if authenticated
    if (session?.accessToken && id) {
        try {
            const options = {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`
                }
            };

            await queryClient.prefetchQuery({
                queryKey: ["worker", id],
                queryFn: () => getWorkerById(id, options),
            });

            console.log(`✅ Successfully prefetched worker ${id} on server`);
        } catch (error) {
            console.error(`⚠️ Error prefetching worker ${id}:`, error);
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditWorkerPageClient id={id} />
        </HydrationBoundary>
    );
}
