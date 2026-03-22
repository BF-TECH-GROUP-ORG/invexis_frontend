import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getSearchablePages } from "@/lib/searchRegistry";
import productsService from "@/services/productsService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { Package, Users, Database } from "lucide-react";

/**
 * Custom hook to handle global search logic.
 * Fetches and filters Pages, Products, Staff, and Shops.
 */
export default function useGlobalSearch(query, session) {
  const t = useTranslations();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const companyId = session?.user?.companies?.[0];
  const companyIdStr = typeof companyId === 'string' ? companyId : (companyId?.id || companyId?._id);

  // 1. Static Pages Search
  const pages = useMemo(() => getSearchablePages(t), [t]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    setIsLoading(true);

    const performSearch = async () => {
      try {
        // A. Filter Pages
        const filteredPages = pages.filter(page => 
          page.title.toLowerCase().includes(searchQuery) || 
          page.subtitle.toLowerCase().includes(searchQuery)
        );

        // B. Fetch Dynamic Data (Products, Workers, Shops)
        // We use a small timeout to debounce if this was called from a fast-typing user
        const dynamicResults = await Promise.allSettled([
          // 1. Products
          productsService.searchProducts(searchQuery, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
          }).catch(() => []),
          
          // 2. Workers (Fetch once and filter client-side for better UX in this small-scale app)
          getWorkersByCompanyId(companyIdStr, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
          }).catch(() => []),

          // 3. Shops/Branches
          getBranches(companyIdStr, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
          }).catch(() => [])
        ]);

        const products = dynamicResults[0].status === 'fulfilled' ? dynamicResults[0].value : [];
        const workers = dynamicResults[1].status === 'fulfilled' ? dynamicResults[1].value : [];
        const branches = dynamicResults[2].status === 'fulfilled' ? dynamicResults[2].value : [];

        // Normalize Results
        const normalizedProducts = (products.data || products).slice(0, 5).map(p => ({
          id: p._id || p.id,
          title: p.name,
          subtitle: `SKU: ${p.sku || 'N/A'} • ${p.salePrice || 0} RWF`,
          icon: <Package size={20} className="text-blue-500" />,
          link: `/inventory/products/${p._id || p.id}`,
          type: "product"
        }));

        const normalizedWorkers = workers.filter(w => 
          `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchQuery) ||
          (w.username && w.username.toLowerCase().includes(searchQuery))
        ).slice(0, 3).map(w => ({
          id: w._id || w.id,
          title: `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.username,
          subtitle: w.role || "Staff Member",
          icon: <Users size={20} className="text-green-500" />,
          link: "/inventory/workers/list", // Highlighting the list for now
          type: "staff"
        }));

        const normalizedBranches = branches.filter(b => 
          b.name.toLowerCase().includes(searchQuery)
        ).slice(0, 3).map(b => ({
          id: b._id || b.id,
          title: b.name,
          subtitle: b.location || "Branch Location",
          icon: <Database size={20} className="text-orange-500" />,
          link: "/inventory/companies",
          type: "shop"
        }));

        // Combine everything
        const allResults = [
          ...filteredPages,
          ...normalizedProducts,
          ...normalizedWorkers,
          ...normalizedBranches
        ];

        setResults(allResults);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, pages, companyIdStr, session, t]);

  return { results, isLoading };
}
