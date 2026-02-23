import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { getWorkerById } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { getDepartmentsByCompany } from "@/services/departmentsService";
import { unstable_cache } from "next/cache";
import EditWorkerPageClient from "./EditWorkerPageClient";

export const metadata = {
    title: "Edit Worker",
};

export default async function EditWorkerPage({ params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const queryClient = new QueryClient();

    const companyObj = session?.user?.companies?.[0];
    const companyId =
        typeof companyObj === "string"
            ? companyObj
            : companyObj?.id || companyObj?._id;

    if (session?.accessToken && id) {
        const options = {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        };

        const getCached = (key, fetcher, tags = []) =>
            unstable_cache(async () => fetcher(), [key, companyId || "global"], {
                revalidate: 300,
                tags: [...tags, `company-${companyId}`],
            })();

        await Promise.all([
            // Prefetch specific worker
            queryClient.prefetchQuery({
                queryKey: ["worker", id],
                queryFn: () => getWorkerById(id, options),
            }),
            // Prefetch dependencies (shops/depts)
            companyId && queryClient.prefetchQuery({
                queryKey: ["branches", companyId],
                queryFn: () => getCached("branches", () => getBranches(companyId), ["branches"]),
            }),
            companyId && queryClient.prefetchQuery({
                queryKey: ["departments", companyId],
                queryFn: () => getCached("departments", () => getDepartmentsByCompany(companyId), ["departments"]),
            }),
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditWorkerPageClient id={id} />
        </HydrationBoundary>
    );
}
