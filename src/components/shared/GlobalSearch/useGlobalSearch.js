import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getSearchablePages } from "@/lib/searchRegistry";
import { getProducts } from "@/services/productsService";
import { getWorkersByCompanyId } from "@/services/workersService";
import { getBranches } from "@/services/branches";
import { Package, Users, Database, Clock } from "lucide-react";

/**
 * Custom hook to handle global search logic with pre-fetching.
 * Does NOT call APIs on every character; filters locally for 'magical' speed.
 */
export default function useGlobalSearch(query, session) {
  const t = useTranslations();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreFetching, setIsPreFetching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Local Data Cache
  const [dataCache, setDataCache] = useState({
    products: [],
    workers: [],
    branches: []
  });

  const companyId = session?.user?.companies?.[0];
  const companyIdStr = typeof companyId === 'string' ? companyId : (companyId?.id || companyId?._id);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent-searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  // 1. Pre-fetch all searchable data once
  useEffect(() => {
    if (!companyIdStr || !session?.accessToken) return;

    const preFetchData = async () => {
      setIsPreFetching(true);
      try {
        console.log("Pre-fetching global search data...");
        const [productsRes, workersRes, branchesRes] = await Promise.allSettled([
          getProducts({ companyId: companyIdStr, limit: 200 }, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
          }),
          getWorkersByCompanyId(companyIdStr, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
          }),
          getBranches(companyIdStr, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
          })
        ]);

        const products = productsRes.status === 'fulfilled' ? (productsRes.value.data || productsRes.value) : [];
        const workers = workersRes.status === 'fulfilled' ? (workersRes.value.data || workersRes.value) : [];
        const branches = branchesRes.status === 'fulfilled' ? (branchesRes.value.data || branchesRes.value) : [];

        setDataCache({
          products: Array.isArray(products) ? products : [],
          workers: Array.isArray(workers) ? workers : [],
          branches: Array.isArray(branches) ? branches : []
        });
      } catch (err) {
        console.error("Global search pre-fetch failed:", err);
      } finally {
        setIsPreFetching(false);
      }
    };

    preFetchData();
  }, [companyIdStr, session?.accessToken]);

  // 2. Static Pages Search
  const pages = useMemo(() => getSearchablePages(t), [t]);

  // 3. Live Search Logic (Purely Client-Side)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      // Show recent searches if query is empty or too short
      const normalizedRecent = recentSearches.map(s => ({
        ...s,
        id: `recent-${s.id}`,
        icon: <Clock size={20} className="text-gray-400" />,
        type: "recent"
      }));
      setResults(normalizedRecent);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    
    // PERFORM LIVE FILTERING (INSTANT)
    // A. Filter Pages
    const filteredPages = pages.filter(page => 
      page.title.toLowerCase().includes(searchQuery) || 
      page.subtitle.toLowerCase().includes(searchQuery) ||
      page.keywords?.some(k => k.toLowerCase().includes(searchQuery))
    );

    // B. Filter Cached Products
    const filteredProducts = dataCache.products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery) ||
      p.sku?.toLowerCase().includes(searchQuery)
    ).slice(0, 5).map(p => ({
      id: p._id || p.id,
      title: p.name,
      subtitle: `SKU: ${p.sku || 'N/A'} • ${p.salePrice || 0} RWF`,
      icon: <Package size={20} className="text-blue-500" />,
      link: `/inventory/products/${p._id || p.id}`,
      type: "product"
    }));

    // C. Filter Cached Workers
    const filteredWorkers = dataCache.workers.filter(w => 
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchQuery) ||
      w.username?.toLowerCase().includes(searchQuery) ||
      w.role?.toLowerCase().includes(searchQuery)
    ).slice(0, 3).map(w => ({
      id: w._id || w.id,
      title: `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.username,
      subtitle: w.role || "Staff Member",
      icon: <Users size={20} className="text-green-500" />,
      link: "/inventory/workers/list",
      type: "staff"
    }));

    // D. Filter Cached Branches
    const filteredBranches = dataCache.branches.filter(b => 
      b.name?.toLowerCase().includes(searchQuery) ||
      b.location?.toLowerCase().includes(searchQuery)
    ).slice(0, 3).map(b => ({
      id: b._id || b.id,
      title: b.name,
      subtitle: b.location || "Branch Location",
      icon: <Database size={20} className="text-orange-500" />,
      link: "/inventory/companies",
      type: "shop"
    }));

    // Combine everything instantly
    setResults([
      ...filteredPages,
      ...filteredProducts,
      ...filteredWorkers,
      ...filteredBranches
    ]);

  }, [query, pages, dataCache, recentSearches]);

  const saveRecentSearch = (item) => {
    if (item.type === 'recent') return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(p => p.id !== item.id);
      const next = [item, ...filtered].slice(0, 5);
      localStorage.setItem("recent-searches", JSON.stringify(next));
      return next;
    });
  };

  return { 
    results, 
    isLoading: isPreFetching, // We only show loader during initial pre-fetch
    saveRecentSearch, 
    recentSearches: results.filter(r => r.type === 'recent') 
  };
}
