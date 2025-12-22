"use client";
import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                ))}
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <Skeleton variant="text" width={150} height={32} />
                        <Skeleton variant="text" width={100} height={20} />
                    </div>
                    <div className="flex gap-3">
                        <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 4 }} />
                    </div>
                </div>

                {/* Table Skeleton */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                    <TableCell key={i}>
                                        <Skeleton variant="text" width="80%" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <TableRow key={i}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => (
                                        <TableCell key={j}>
                                            <Skeleton variant="text" width="100%" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
}
