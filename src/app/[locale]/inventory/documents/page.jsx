export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import DocumentsPageClient from "./DocumentsPageClient";
import { getCompanySalesInvoices, getCompanyInventoryMedia } from '@/services/documentService';
import { unstable_cache } from 'next/cache';

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    // Helper for server-side persistence using unstable_cache
    const getCached = (key, fetcher) =>
      unstable_cache(
        async () => fetcher(),
        [`documents-${key}`, companyId],
        { revalidate: 300, tags: ['documents', `company-${companyId}`] }
      )();

    // Prefetch invoices and inventory media with caching
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['salesInvoices', companyId],
        queryFn: () => getCached('invoices', () => getCompanySalesInvoices(companyId, options)),
      }),
      queryClient.prefetchQuery({
        queryKey: ['inventoryMedia', companyId],
        queryFn: () => getCached('media', () => getCompanyInventoryMedia(companyId, options)),
      })
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsPageClient />
    </HydrationBoundary>
  );
}