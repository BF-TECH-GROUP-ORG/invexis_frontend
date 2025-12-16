"use client";
import { useMemo } from "react";
// import { Jost } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/shared/button";
import { useLocale } from "next-intl";
import CompaniesTable from "./table";
import CompanyCards from "./cards";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/branches";

import ProtectedRoute from "@/lib/ProtectedRoute";

import { useSession } from "next-auth/react";

const CompaniesPage = () => {
  const locale = useLocale();
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

  const { data: shops = [] } = useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => getBranches(companyId),
    enabled: !!companyId,
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.shops)) return data.shops;
      return [];
    },
  });

  const stats = useMemo(() => {
    const totalBranches = shops.length;
    const activeBranches = shops.filter((s) => s.status === "open").length;
    const totalCapacity = shops.reduce((sum, s) => sum + (s.capacity || 0), 0);

    return {
      totalBranches,
      activeBranches,
      totalCapacity,
    };
  }, [shops]);

  return (
    <ProtectedRoute allowedRoles={["company_admin"]}>
      <>
        <section className="w-full inline-grid">
          <div className="space-y-10">
            <CompanyCards stats={stats} />
            <div className="space-y-5 flex justify-between items-center  ">
              <div>
                <h1 className="text-2xl font-medium ">Branches Management</h1>
                <p className="space-x-5 font-light">
                  <span>Dashboard</span>
                  <span>.</span>
                  <span>Inventory</span>
                  <span>.</span>
                  <span className="text-gray-500">Companies</span>
                </p>
              </div>
              <div>
                <Link href={`/${locale}/inventory/companies/new`}>
                  <Button
                    variant="outline"
                    className="bg-orange-500 text-white cursor-pointer">
                    Add Branch
                  </Button>
                </Link>
              </div>
            </div>
            <CompaniesTable initialRows={shops} />
          </div>
        </section>
      </>
    </ProtectedRoute>
  );
};

export default CompaniesPage;
