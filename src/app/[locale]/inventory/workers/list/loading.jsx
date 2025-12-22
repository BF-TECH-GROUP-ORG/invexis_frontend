import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

export default function Loading() {
    return (
        <div className="p-6">
            {/* Header Skeleton */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={20} />
                </Box>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Controls Skeleton */}
            <Box display="flex" justifyContent="space-between" alignItems="center" px={2.5} py={1.5} gap={2}>
                <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Table Skeleton */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                <TableCell key={i}>
                                    <Skeleton variant="text" width="80%" />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
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
    );
}
