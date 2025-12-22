import { Box, Grid, Skeleton } from "@mui/material";

export default function Loading() {
    return (
        <Box sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3].map((i) => (
                    <Grid item xs={12} sm={4} key={i}>
                        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                    </Grid>
                ))}
            </Grid>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={300} height={20} sx={{ mb: 4 }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
        </Box>
    );
}
