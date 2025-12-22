import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import AnalyticsPage from "../analytics/analyticsPage";
import AnalyticsService from "@/services/analyticsService";
import { getBranches } from "@/services/branches";
import { getWorkersByCompanyId } from "@/services/workersService";
import dayjs from "dayjs";

const HomePage = async () => {
  const session = await getServerSession(authOptions);
  const queryClient = getQueryClient();

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Default params from AnalyticsPage
    const end = dayjs();
    const start = end.subtract(7, 'day');
    const params = {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      interval: 'day'
    };

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    // Prefetch all queries used in AnalyticsPage
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'summary', params],
        queryFn: () => AnalyticsService.getDashboardSummary(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'sales', params],
        queryFn: () => AnalyticsService.getRevenueReport(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'profitability', params],
        queryFn: () => AnalyticsService.getProfitabilityReport(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'products', params],
        queryFn: () => AnalyticsService.getTopProducts(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'inventory', params],
        queryFn: () => AnalyticsService.getInventoryHealth(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'paymentMethods', params],
        queryFn: () => AnalyticsService.getPaymentMethodStats(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'shops', params],
        queryFn: () => AnalyticsService.getShopPerformance(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['analytics', 'employees', params],
        queryFn: () => AnalyticsService.getEmployeePerformance(params, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['branches', companyId],
        queryFn: () => getBranches(companyId, options),
      }),
      queryClient.prefetchQuery({
        queryKey: ['workers', companyId],
        queryFn: () => getWorkersByCompanyId(companyId, options),
      })
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsPage />
    </HydrationBoundary>
  );
};

export default HomePage;