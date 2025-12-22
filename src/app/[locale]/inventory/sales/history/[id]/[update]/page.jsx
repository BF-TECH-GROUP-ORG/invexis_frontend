"use client";
import UpdateInputs from "./inputs";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSingleSale } from '@/services/salesService';
import { CircularProgress, Typography } from '@mui/material';

const UpdateSale = () => {
    const t = useTranslations("updateProduct");
    const params = useParams();
    const saleId = params.id;

    const [saleData, setSaleData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaleData = async () => {
            if (!saleId) return;

            setLoading(true);
            const data = await getSingleSale(saleId);
            setSaleData(data);
            setLoading(false);
        };

        fetchSaleData();
    }, [saleId]);

    if (loading) {
        return (
            <section className="flex items-center justify-center min-h-screen">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading sale data...</Typography>
            </section>
        );
    }

    if (!saleData) {
        return (
            <section className="flex items-center justify-center min-h-screen">
                <Typography variant="h6">Sale not found</Typography>
            </section>
        );
    }

    const productName = saleData.items && saleData.items.length > 0
        ? saleData.items[0].productName
        : "Unknown Product";

    return (
        <>
            <section className="space-y-10">
                <div>
                    <h1 className="text-center text-2xl font-bold">
                        {t('pageTitle')}
                        <span className="text-orange-500">{productName}</span>
                    </h1>
                    <p className="text-center text-gray-500">{t('pageSubtitle')}</p>
                </div>
                <div className="">
                    <UpdateInputs saleData={saleData} saleId={saleId} />
                </div>
            </section>
        </>
    );
};

export default UpdateSale;