export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import DocumentsPageClient from "./DocumentsPageClient";
import { getCompanySalesInvoices, getCompanyInventoryMedia } from '@/services/documentService';

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

    // Prefetch invoices and inventory media
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['salesInvoices', companyId],
        queryFn: () => getCompanySalesInvoices(companyId, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['inventoryMedia', companyId],
        queryFn: () => getCompanyInventoryMedia(companyId, options),
      })
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DocumentsPageClient />
    </HydrationBoundary>
  );
}