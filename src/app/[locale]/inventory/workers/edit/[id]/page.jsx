"use client";
import React, { useEffect, useState, Suspense } from "react";
import AddWorkerForm from "@/components/forms/AddWorkerForm";
import { getWorkerById } from "@/services/workersService";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "./loading";

function EditWorkerPageContent({ params }) {
    const { id } = React.use(params);
    const { data: session } = useSession();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const data = await getWorkerById(id);
                console.log("Worker data received:", data);

                // Ensure data matches form structure if necessary
                setWorker(data);
            } catch (err) {
                console.error("Failed to fetch worker:", err);
                const errorMsg = err.message || "Failed to load worker details.";
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (id && session) {
            fetchWorker();
        } else if (!session) {
            console.log("Waiting for session to load...");
        }
    }, [id, session]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return <AddWorkerForm initialData={worker} isEditMode={true} />;
}

export default function EditWorkerPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading...</div></div>}>
            <EditWorkerPageContent />
        </Suspense>
    );
}
