import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dayjs from "dayjs";
import { Suspense } from "react";
import StatsCardsSection from "./features/StatsCardsSection";
import SalesChartsWrapper from "./features/SalesChartsWrapper";
import ShopReportsWrapper from "./features/ShopReportsWrapper";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

function SectionSkeleton({ height = "400px" }) {
  return <div className={`w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100`} style={{ height }} />;
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32 animate-pulse" />
      ))}
    </div>
  );
}

const DashboardPage = async ({ params, searchParams }) => {
  const session = await getServerSession(authOptions);
  // Ensure params is awaited correctly for Next.js 15
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  // Await searchParams if it's a promise (Next.js 15 behavior)
  const resolvedParams = await (searchParams || {});
  const timeRange = resolvedParams.timeRange || '7d';
  const customDate = resolvedParams.date || dayjs().format('YYYY-MM-DD');

  if (session?.accessToken) {
    const user = session.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    // Calculate dates on the server
    const end = dayjs(customDate);
    let start;
    let interval;

    switch (timeRange) {
      case '24h':
        start = end.subtract(1, 'day');
        interval = 'hour';
        break;
      case '7d':
        start = end.subtract(7, 'day');
        interval = 'day';
        break;
      case '30d':
        start = end.subtract(30, 'day');
        interval = 'day';
        break;
      case '90d':
        start = end.subtract(90, 'day');
        interval = 'day';
        break;
      case '1y':
        start = end.subtract(1, 'year');
        interval = 'month';
        break;
      default:
        start = end.subtract(7, 'day');
        interval = 'day';
    }

    const apiParams = {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      interval
    };

    const options = {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    };

    return (
      <section>
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">{t('title')}</h1>
            <h1 className="text-sm text-gray-500">{t('subtitle')}</h1>
          </div>
          {/* Filter controls managed via URL */}
        </div>

        <Suspense fallback={<CardsSkeleton />}>
          <StatsCardsSection
            companyId={companyId}
            params={apiParams}
            options={options}
            locale={locale}
          />
        </Suspense>

        <div className="space-y-6">
          <Suspense fallback={<SectionSkeleton height="500px" />}>
            <SalesChartsWrapper
              companyId={companyId}
              params={apiParams}
              options={options}
              timeRange={timeRange}
              selectedDate={customDate}
            />
          </Suspense>

          <Suspense fallback={<SectionSkeleton height="400px" />}>
            <ShopReportsWrapper
              companyId={companyId}
              params={apiParams}
              options={options}
              locale={locale}
            />
          </Suspense>
        </div>
      </section>
    );
  }

  return <div>Please log in to view the dashboard.</div>;
};

export default DashboardPage;