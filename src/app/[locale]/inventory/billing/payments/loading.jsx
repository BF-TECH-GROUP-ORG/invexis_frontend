"use client";
import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

export default function Loading() {
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={20} />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
                <div className="mb-6">
                    <Skeleton variant="text" width={180} height={32} />
                    <Skeleton variant="text" width={250} height={20} />
                </div>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableCell key={i}>
                                        <Skeleton variant="text" width="80%" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    {[1, 2, 3, 4, 5].map((j) => (
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
