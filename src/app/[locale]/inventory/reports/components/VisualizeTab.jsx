import React from 'react';
import { Box, CircularProgress, Fade } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import reportService from '@/services/reportService';
import BusinessOverviewChart from './BusinessOverviewChart';

const VisualizeTab = ({ dateRange, reportView }) => {
    const t = useTranslations('reports');
    const { data: session } = useSession();
    const companyId = session?.user?.companies?.[0]?.id || session?.user?.companies?.[0];

    const startDate = dateRange.startDate ? dateRange.startDate.format('YYYY-MM-DD') : undefined;
    const endDate = dateRange.endDate ? dateRange.endDate.format('YYYY-MM-DD') : undefined;

    const {
        data: reportData,
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['report-general', companyId, startDate, endDate], // Using same query key for cache sharing
        queryFn: () => reportService.getGeneralReport(companyId, { startDate, endDate }),
        enabled: !!companyId,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress sx={{ color: '#FF6D00' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                {t('common.error')} {/* Assuming you have an error translation */}
            </Box>
        );
    }

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ width: '100%', bgcolor: '#f9fafb', p: 0 }}>
                <BusinessOverviewChart data={reportData} reportView={reportView} />
            </Box>
        </Fade>
    );
};

export default VisualizeTab;
