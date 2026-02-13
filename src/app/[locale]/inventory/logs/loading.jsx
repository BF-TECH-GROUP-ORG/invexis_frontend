
import React from 'react';
import { Paper, Toolbar, Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export default function LogsLoading() {
    return (
        <section className="w-full inline-grid animate-in fade-in duration-500">
            <div className="space-y-10 w-full">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton variant="text" width={200} height={32} />
                        <div className="flex gap-2">
                            <Skeleton variant="text" width={60} />
                            <Skeleton variant="text" width={10} />
                            <Skeleton variant="text" width={60} />
                        </div>
                    </div>
                    <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: '16px' }} />
                </div>

                {/* Table Container Skeleton */}
                <Paper sx={{ width: "100%", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", bgcolor: "white" }}>
                    <Toolbar sx={{ display: "flex", gap: 2, py: 2, borderBottom: "1px solid #eee" }}>
                        <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: '12px' }} />
                    </Toolbar>

                    <TableContainer sx={{ width: '100%' }}>
                        <Table stickyHeader sx={{ minWidth: 1000 }}>
                            <TableHead>
                                <TableRow>
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <TableCell key={i} sx={{ backgroundColor: "#F9FAFB" }}>
                                            <Skeleton variant="text" width="60%" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton variant="text" width="80%" height={24} /></TableCell>
                                        <TableCell><Skeleton variant="text" width="70%" height={24} /></TableCell>
                                        <TableCell><Skeleton variant="text" width="70%" height={24} /></TableCell>
                                        <TableCell><Skeleton variant="text" width="70%" height={24} /></TableCell>
                                        <TableCell><Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: '6px' }} /></TableCell>
                                        <TableCell><Skeleton variant="text" width="90%" height={24} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination Footer Skeleton */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee' }}>
                        <Skeleton variant="text" width={250} />
                        <Skeleton variant="rectangular" width={200} height={32} />
                    </Box>
                </Paper>
            </div>
        </section>
    );
}
