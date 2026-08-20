"use client";

import React, { useMemo } from "react";
import AddWorkerForm from "@/components/forms/AddWorkerForm";
import { getWorkerById } from "@/services/workersService";
import { Box, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Loading from "./loading";

export default function EditWorkerPageClient({ id }) {
    const { data: session } = useSession();

    const options = useMemo(() => (session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {}), [session?.accessToken]);

    const { data: worker, isLoading, error } = useQuery({
        queryKey: ["worker", id],
        queryFn: () => getWorkerById(id, options),
        enabled: !!id && !!session?.accessToken,
        staleTime: Infinity,            // Never auto-stale → no races with optimistic updates
        gcTime: 5 * 60 * 1000,         // Keep cache for 5 min so navigating back is instant
        refetchOnMount: 'always',       // Always background-refetch on visit
        refetchOnWindowFocus: 'always', // Refetch when switching back to this tab
    });

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">{error.message || "Failed to load worker details."}</Typography>
            </Box>
        );
    }

    return <AddWorkerForm initialData={worker} isEditMode={true} />;
}
