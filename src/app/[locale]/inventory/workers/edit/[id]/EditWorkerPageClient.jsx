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
