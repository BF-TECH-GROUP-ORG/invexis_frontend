import React from 'react';
import { getCachedShopPerformance, getCachedEmployeePerformance } from '@/services/dashboardCache';
import { getBranches } from '@/services/branches';
import { getWorkersByCompanyId } from '@/services/workersService';
import { unstable_cache } from 'next/cache';
import ShopReportsSection from './ShopReportsSection';

export default async function ShopReportsWrapper({ companyId, params, options }) {
  // Parallel server-side data fetching
  const [shopRes, employeeRes, branchesRes, workersRes] = await Promise.all([
    getCachedShopPerformance(companyId, params, options),
    getCachedEmployeePerformance(companyId, params, options),
    unstable_cache(
      async () => getBranches(companyId, options),
      [`shops`, companyId],
      { revalidate: 600, tags: ['shops', `company-${companyId}`] }
    )(),
    unstable_cache(
      async () => getWorkersByCompanyId(companyId, options),
      [`workers`, companyId],
      { revalidate: 600, tags: ['workers', `company-${companyId}`] }
    )(),
  ]);

  return (
    <ShopReportsSection
        shopRes={shopRes}
        employeeRes={employeeRes}
        branchesRes={branchesRes}
        workersRes={workersRes}
    />
  );
}
