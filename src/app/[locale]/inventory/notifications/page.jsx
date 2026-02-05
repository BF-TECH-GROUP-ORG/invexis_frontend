export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import NotificationsClient from "./NotificationsClient";
import { getNotifications } from "@/services/notificationService";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  if (session?.accessToken) {
    const user = session.user;
    const currentUserId = user?._id || user?.id;

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    // Prefetch all notifications (match client-side initial fetch)
    await queryClient.prefetchQuery({
      queryKey: ["notifications", currentUserId],
      queryFn: () => getNotifications({ limit: 50, page: 1, userId: currentUserId }, options),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsClient />
    </HydrationBoundary>
  );
}
