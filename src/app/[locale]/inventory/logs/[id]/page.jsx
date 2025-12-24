"use client"
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/services/auditService";
import { useParams } from "next/navigation";
import Skeleton from "@/components/shared/Skeleton";
import { Box, Paper, Typography, Divider } from "@mui/material";

const LogDetailPage = () => {
    const { id } = useParams();
    const { data: session } = useSession();
    const user = session?.user;
    const companyObj = user?.companies?.[0];
    const companyId = typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id);

    const options = session?.accessToken ? {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    } : {};

    const { data: logs = [], isLoading } = useQuery({
        queryKey: ["auditLog", id],
        queryFn: () => getAuditLogs(companyId, { _id: id }, options),
        enabled: !!companyId && !!id,
    });

    const log = logs[0];

    if (isLoading) return <Skeleton height={400} />;
    if (!log) return <Typography>Log not found</Typography>;

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Log Details</Typography>
            <Paper sx={{ p: 3, borderRadius: '16px' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>Event Type:</Typography>
                    <Typography>{log.event_type}</Typography>

                    <Typography sx={{ fontWeight: 600 }}>Source Service:</Typography>
                    <Typography>{log.source_service}</Typography>

                    <Typography sx={{ fontWeight: 600 }}>Entity Type:</Typography>
                    <Typography>{log.entityType}</Typography>

                    <Typography sx={{ fontWeight: 600 }}>User ID:</Typography>
                    <Typography>{log.userId}</Typography>

                    <Typography sx={{ fontWeight: 600 }}>Occurred At:</Typography>
                    <Typography>{new Date(log.occurred_at).toLocaleString()}</Typography>

                    <Typography sx={{ fontWeight: 600 }}>Severity:</Typography>
                    <Typography>{log.severity.toUpperCase()}</Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>Payload</Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f8f9fa', fontFamily: 'monospace', overflow: 'auto' }}>
                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                </Paper>

                {log.metadata && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>Metadata</Typography>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f8f9fa', fontFamily: 'monospace', overflow: 'auto' }}>
                            <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </Paper>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default LogDetailPage;
